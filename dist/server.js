"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = require('./router');
var app = express_1.default();
var path = require('path');
var compression = require('compression');
var session = require('express-session');
var cron = require('node-cron');
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    }
    else {
        console.log(req.ip + " " + req.method + " " + req.url);
        next();
    }
});
app.use(compression());
// app.use(express.json());
app.use(express_1.default.json({ limit: '50mb' }));
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
app.use(function (err, req, res, next) {
    switch (err.message) {
        case 'NoCodeProvided':
            return res.status(400).send({
                status: 'ERROR',
                error: err.message,
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message,
            });
    }
});
app.use('/', router);
app.use(express_1.default.static(path.join(__dirname, 'public'), { maxAge: "30d" }));
app.use(express_1.default.static(path.join(__dirname, 'public/assets'), { maxAge: "30d" }));
// console.log(path.join(__dirname, 'public/index.html'));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/hi', function (req, res) {
    // console.log(req.session); 
    // res.sendFile(path.join(__dirname, 'public/index.html'));
});
var PORT = +process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log("Server now listening on " + PORT);
    var env = process.env.NODE_ENV || 'production';
    console.log('Rnning in ' + env + ' mode');
});
// Crons???
// cron.schedule("* * * * *", () => { 
//     console.log("Running cron :)");
// });
