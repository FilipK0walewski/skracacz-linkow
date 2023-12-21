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
        return res.status(401).send(`Niepoprawna nazwa użytkownika lub hasło.`);
    }
    const user = result.rows[0]
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid !== true) {
        return res.status(401).send(`Niepoprawna nazwa użytkownika lub hasło.`);
    }
    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecretKey)
    res.cookie('token', token, { httpOnly: true })
    res.redirect('/')
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
    if (password0 !== password1) {
        return res.status(401).json('Hasła nie są takie same.')
    }
    const usernameExists = await pool.query('SELECT 1 FROM users WHERE username = $1', [username])
    if (usernameExists.rows.length !== 0) {
        return res.status(409).send(`Użytkownik o nazwie ${username} już istnieje.`);
    }
    const hashedPassword = await bcrypt.hash(password0, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword])
    res.redirect(`/login?registrationSuccess=true&newUserName=${username}`)
})

app.post('/', getTokenData, async (req, res) => {
    let { url, name } = req.body;
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
    res.status(201).json({ url, niceUrl })
})

app.get('/your-urls', getTokenData, async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect('/')
    const urlBeforeName = `${req.protocol}://${req.headers.host}/`
    const result = await pool.query('SELECT name, url FROM urls where user_id = $1', [user.id])
    const urls = result.rows.map((row) => { return { ...row, niceUrl: `${urlBeforeName}${row.name}` } });
    res.render('urls', { username: user.username, urls });
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