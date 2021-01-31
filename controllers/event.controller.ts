import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { client } from './client';

const emitter: EventEmitter = new EventEmitter();
const wss = new WebSocket.Server({ noServer: true, path: "/api/ws" });

emitter.setMaxListeners(1000);

const clients = [];

wss.on('connection', (ws: WebSocket) => {
    clients.push(ws);
    setInterval(() => heartbeat(ws), 20000);
    let tournamentId = null;
    let taClient: client = null;
    ws.on('message', (message) => {
        try {
            let data = JSON.parse(message);
            if (data.setTournament) {
                tournamentId = data.setTournament;
                let tmp = { t: tournamentId};
                emitter.emit("getTAState", tmp);
                taClient = tmp.t?.taClient;
                delete taClient?.State?.ServerSettings?.Password;
                ws.send(JSON.stringify({ TA: taClient}));
            }
            console.log(data);
            if (data.overlay) {
                sendAll(data);
                // ws.send(JSON.stringify(data));
            }
        } catch (error) {
            console.error(error);
        }
    });
    emitter.on('bracketUpdate', (data) => {
        ws.send(JSON.stringify({bracketUpdate: data}));
    });
    emitter.on('bracketMatch', (data) => {
        ws.send(JSON.stringify({bracketMatch: data}));
    });
    emitter.on('taEvent', (data) => {
        if (tournamentId == data[0]) {
            ws.send(JSON.stringify({ TA: data}));
        }
    });
});

function heartbeat(ws: WebSocket) {
    ws.send(JSON.stringify({ heatbeat: []}));
}

function sendAll(message) {
    for (const client of clients) {
        client.send(JSON.stringify(message));
    }
}

export { emitter, wss };