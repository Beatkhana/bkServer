import express from 'express';
import { cronController } from './controllers/cron.controller';
import { debugLogger } from './controllers/debugLogger.controller';
import { wss } from './controllers/event.controller';
import { TAController } from './controllers/ta.controller';

const router = require('./router')
const app = express();
const path = require('path');
var compression = require('compression');
const session = require('express-session');
var MemoryStore = require('memorystore')(session);

import { bracketRouter } from './routers/bracket.router';
import { mapPoolRouter } from './routers/map_pool';
import { participantsRouter } from './routers/participants';
import { qualifiersRouter } from './routers/qualifiers';
import { tournamentRouter } from './routers/tournament.router';
import { tournamentListRouter } from './routers/tournamentList.router';
import { userRouter } from './routers/user.router';
new debugLogger();

let validHosts = ['localhost', 'bk.dannypoke03.me', 'beatkhana.com'];

app.use((req, res, next) => {
    if (!validHosts.includes(req.get("host").split(':')[0])) return res.sendStatus(404);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        if (env != 'production') console.debug(`${req.method} ${req.url}`);
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
app.use('/api', participantsRouter);
app.use('/api', mapPoolRouter);
app.use('/api', tournamentRouter);
app.use('/api', userRouter);
app.use('/api', qualifiersRouter);
app.use('/', router);

const env = process.env.NODE_ENV || 'production';
const mainDir = env == 'development' ? 'dist/public' : 'public';
const assetDir = env == 'development' ? 'dist/public/assets' : 'public/assets';

// app.use('/assets/images', express.static(path.join(__dirname, assetDir+'/images'), { maxAge: "1d" }));
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

let TACon = new TAController();
TACon.init();

// Crons???
let cronCon: cronController = new cronController();
cronCon.setCrons();

process.on('exit', beforeClose);
process.on('SIGINT', beforeClose);
process.on('SIGUSR1', beforeClose);
process.on('SIGUSR2', beforeClose);
process.on('uncaughtException', beforeClose);

function beforeClose() {
    console.info("Server shutdown");
    TACon.closeTa();
    process.exit();
}