const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');

const misc = require('./modules/misc');
const pool = require('./modules/db')

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'jwtSecretKey';
const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.get('/username', getTokenData, (req, res) => {
    if (!req.user) return res.status(403).json({ message: 'Forbidden' });
    return res.json({ username: req.user.username });
})

app.get('/login', (req, res) => {
    if (req.cookies.token) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT id, username, password FROM users WHERE username = $1', [username])
    if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' })
    }
    const user = result.rows[0]
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid !== true) {
        return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' })
    }
    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecretKey)
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' })
    res.status(200).json({ username: user.username });
})

app.get('/logout', (req, res) => {
    if (req.cookies.token) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        });
        return res.json({ message: 'Wylogowano' })
    }
    res.status(401).send('Nieautoryzowany')
})

app.get('/register', (req, res) => {
    if (req.cookies.token) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
})

app.post('/register', async (req, res) => {
    const { username, password0, password1 } = req.body;
    const usernameExists = await pool.query('SELECT 1 FROM users WHERE username = $1', [username])
    if (usernameExists.rows.length !== 0) {
        return res.status(409).json({ message: `Użytkownik o nazwie "${username}" już istnieje` });
    }
    if (password0 !== password1) {
        return res.status(401).json({ message: 'Hasła nie są takie same' })
    }
    const hashedPassword = await bcrypt.hash(password0, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword])
    res.status(201).json({ username })
})

app.post('/', getTokenData, async (req, res) => {
    let { url, name, expiresAt } = req.body;
    console.log(expiresAt)
    expiresAt = '2025-01-08 14:30:00'

    // return res.status(400).json({message: expiresAt})

    if (!misc.checkIfStringIsUrl(url)) {
        return res.status(400).json({ message: 'Niepoprawny link.' })
    }

    name = name || misc.getRandomName()
    if (!misc.checkIfUrlNameIsValid(name)) {
        return res.status(403).json({ message: 'Niepoprawna nazwa linku, wybierz inną nazwę' })
    }

    const result = await pool.query('SELECT 1 FROM urls WHERE name = $1', [name])
    if (result.rows.length !== 0) {
        return res.status(403).json({ message: 'Nazwa linku już zajęta, wybierz inną nazwę', errorCode: 'VALUE_ALREADY_USED' })
    }

    if (req.user && req.user.id) {
        const query = 'INSERT INTO urls (url, name, user_id, expires_at) VALUES ($1, $2, $3, $4)'
        await pool.query(query, [url, name, req.user.id, expiresAt])
    } else {
        const query = 'INSERT INTO urls (url, name, expires_at) VALUES ($1, $2, $3)'
        await pool.query(query, [url, name, expiresAt])
    }

    const shortUrl = `${req.protocol}://${req.headers.host}/${name}`
    res.status(201).json({ longUrl: url, shortUrl })
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