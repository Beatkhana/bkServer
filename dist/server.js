"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var debugLogger_controller_1 = require("./controllers/debugLogger.controller");
var event_controller_1 = require("./controllers/event.controller");
var router = require('./router');
var app = express_1.default();
var path = require('path');
var compression = require('compression');
var session = require('express-session');
var MemoryStore = require('memorystore')(session);
var cron = require('node-cron');
// const cronJobs = require('./crons')
var crons_1 = require("./crons");
var bracket_router_1 = require("./routers/bracket.router");
var tournamentList_router_1 = require("./routers/tournamentList.router");
new debugLogger_controller_1.debugLogger();
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    }
    else {
        console.debug(req.method + " " + req.url);
        next();
    }
});
app.use(compression());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(session({
    name: 'uId',
    resave: false,
    saveUninitialized: false,
    secret: 'jfgdasjkfdau',
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every week
    }),
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
app.use('/api', bracket_router_1.bracketRouter);
app.use('/api', tournamentList_router_1.tournamentListRouter);
app.use('/', router);
var env = process.env.NODE_ENV || 'production';
var mainDir = env == 'development' ? 'dist/public' : 'public';
var assetDir = env == 'development' ? 'dist/public/assets' : 'public/assets';
app.use('/assets', express_1.default.static(path.join(__dirname, assetDir), { maxAge: "30d" }));
app.use(express_1.default.static(path.join(__dirname, mainDir)));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
var PORT = +process.env.PORT || 8080;
var server = app.listen(PORT, function () {
    console.info("Server now listening on " + PORT);
    console.info('Running in ' + env + ' mode');
});
// allow websocket connections
server.on('upgrade', function (request, socket, head) {
    event_controller_1.wss.handleUpgrade(request, socket, head, function (socket) {
        event_controller_1.wss.emit('connection', socket, request);
    });
});
// app.listen(PORT, () => {
//     console.log("Server now listening on " + PORT);
//     console.log('Running in ' + env + ' mode')
// });
// Crons???
cron.schedule("0 * * * *", function () {
    console.log("Running Cron: Update users");
    crons_1.crons.updateSSData();
});
cron.schedule("*/5 * * * *", function () {
    console.log("Running Cron: Discord users update");
    crons_1.crons.updateUsersDiscord();
});
