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
app.use(express_1.default.json());
app.use('/', router);
app.use(express_1.default.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public/index.html'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
// app.use((req, res) => {
//     res.sendFile(__dirname + '/public/index.html') 
// })
var PORT = +process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log("Server now listening on " + PORT);
});
