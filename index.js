const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Pool } = require('pg');

const misc = require('./modules/misc');

const jwtSecretKey = 'jwtSecretKey';
const port = 3000;

const pool = new Pool({
    user: 'siuras',
    host: 'localhost',
    database: 'siuras',
    password: 'siuras',
    port: 5432,
});

const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const getTokenData = (req, res, next) => {
    if (!req.cookies.token) {
        next();
        return
    }

    jwt.verify(req.cookies.token, jwtSecretKey, (err, decoded) => {
        if (!err) req.user = decoded;
        next();
    });
};

app.get('/', getTokenData, (req, res) => {
    res.render('index', { user: req.user });
})

app.get('/login', (req, res) => {
    if (req.cookies.token) return res.redirect('/')
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT id, username, password FROM users WHERE username = $1', [username])
    if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Nieprawidłowy login lub hasło.' })
    }
    const user = result.rows[0]
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid !== true) {
        return res.status(401).json({ message: 'Nieprawidłowy login lub hasło.' })
    }
    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecretKey)
    res.cookie('token', token, { httpOnly: true, sameSite: 'Strict' })
    res.status(200).json({ username: user.username });
})

app.get('/logout', (req, res) => {
    if (req.cookies.token) res.clearCookie('token')
    res.redirect('/')
})

app.get('/register', (req, res) => {
    if (req.cookies.token) return res.redirect('/')
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
})

app.post('/register', async (req, res) => {
    const { username, password0, password1 } = req.body;
    const usernameExists = await pool.query('SELECT 1 FROM users WHERE username = $1', [username])
    if (usernameExists.rows.length !== 0) {
        return res.status(409).json({ message: `Użytkownik o nazwie "${username}" już istnieje.` });
    }
    if (password0 !== password1) {
        return res.status(401).json({ message: 'Hasła nie są takie same.' })
    }
    const hashedPassword = await bcrypt.hash(password0, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword])
    res.status(201).json({ username })
})

app.post('/', getTokenData, async (req, res) => {
    let { url, name } = req.body;
    if (!misc.checkIfStringIsUrl(url)) {
        return res.status(400).json({ message: 'Niepoprawny link.' })
    }

    name = name || misc.getRandomName()
    if (['', 'login', 'logout', 'register', 'your-urls'].includes(name)) {
        return res.status(403).json({ message: 'Niepoprawna nazwa linku, wybierz inną nazwę.' })
    }

    const result = await pool.query('SELECT 1 FROM urls WHERE name = $1', [name])
    if (result.rows.length !== 0) {
        return res.status(403).json({ message: 'Nazwa linku już zajęta, wybierz inną nazwę.' })
    }

    if (req.user && req.user.id)
        await pool.query('INSERT INTO urls (url, name, user_id) VALUES ($1, $2, $3)', [url, name, req.user.id])
    else
        await pool.query('INSERT INTO urls (url, name) VALUES ($1, $2)', [url, name])

    const niceUrl = `${req.protocol}://${req.headers.host}/${name}`
    res.status(201).json({ niceUrl })
})

app.get('/your-urls', getTokenData, (req, res) => {
    if (!req.user) return res.redirect('/')
    res.sendFile(path.join(__dirname, 'views', 'urls.html'));
})

app.get('/your-urls-data', getTokenData, async (req, res) => {
    const user = req.user;
    if (!user) return res.status(403)

    const countResult = await pool.query('SELECT COUNT(1) FROM urls WHERE user_id = $1', [user.id])
    const userUrlsCount = countResult.rows[0].count || 0

    const result = await pool.query('SELECT name, url FROM urls WHERE user_id = $1', [user.id])
    const urlBeforeName = `${req.protocol}://${req.headers.host}/`
    const urls = result.rows.map((row) => { return { ...row, niceUrl: `${urlBeforeName}${row.name}` } });
    res.json({ username: user.username, urls, count: userUrlsCount })
})

app.get('/:name', async (req, res) => {
    const name = req.params.name
    const result = await pool.query('SELECT url FROM urls WHERE name = $1', [name])
    if (result.rowCount === 0) {
        return res.sendFile(path.join(__dirname, 'views', '404.html'));
    }
    res.redirect(result.rows[0].url)
})

app.listen(port, async () => {
    console.log(`UFO ${port}`)
})