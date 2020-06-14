import express from 'express';

const router = require('./router')
const app = express();
const path = require('path');
var compression = require('compression');
const session = require('express-session');


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

app.use(compression());
// app.use(express.json());
app.use(express.json({limit: '50mb'}));

app.use(session({
    name: 'uId',
    resave: false,
    saveUninitialized: false,
    secret: 'jfgdasjkfdau',
    cookie: {
        maxAge: 604800000,
        sameSite: true
    }
}));

app.use('/', router);

app.use(express.static(path.join(__dirname, 'public')));
// console.log(path.join(__dirname, 'public/index.html'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/hi', (req, res) => {
    console.log(req.session); 
    // res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = +process.env.PORT || 8080;

app.listen(PORT, () => { 
    console.log("Server now listening on "+PORT);
});