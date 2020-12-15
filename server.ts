import express from 'express';
import { debugLogger } from './controllers/debugLogger.controller';
import { wss } from './controllers/event.controller';

const router = require('./router')
const app = express();
const path = require('path');
var compression = require('compression');
const session = require('express-session');
var MemoryStore = require('memorystore')(session)

const cron = require('node-cron');

// const cronJobs = require('./crons')
import {crons} from './crons';
import { bracketRouter } from './routers/bracket.router';
import { tournamentListRouter } from './routers/tournamentList.router';
new debugLogger();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.debug(`${req.method} ${req.url}`);
        next();
    }
});

app.use(compression());
app.use(express.json({ limit: '50mb' }));

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

app.use((err, req, res, next) => {
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

app.use('/api', bracketRouter);
app.use('/api', tournamentListRouter);
app.use('/', router);

const env = process.env.NODE_ENV || 'production';
const mainDir = env == 'development' ? 'dist/public' : 'public';
const assetDir = env == 'development' ? 'dist/public/assets' : 'public/assets';

app.use('/assets', express.static(path.join(__dirname, assetDir), { maxAge: "30d" }));
app.use(express.static(path.join(__dirname, mainDir)));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = +process.env.PORT || 8080;


let server = app.listen(PORT, () => {
    console.info("Server now listening on " + PORT);
    console.info('Running in ' + env + ' mode')
});
// allow websocket connections
server.on('upgrade', (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (socket: any) => {
        wss.emit('connection', socket, request);
    });
});


// app.listen(PORT, () => {
//     console.log("Server now listening on " + PORT);
//     console.log('Running in ' + env + ' mode')
// });

// Crons???
cron.schedule("0 * * * *", () => { 
    console.log("Running Cron: Update users");
    crons.updateSSData();
});

cron.schedule("*/5 * * * *", () => { 
    console.log("Running Cron: Discord users update");
    crons.updateUsersDiscord();
});