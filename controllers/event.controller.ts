import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { bracketMatch } from '../models/bracket.model';
import { client } from './client';
import { sessionParser } from './session';
import { TAController } from './ta.controller';

const emitter: EventEmitter = new EventEmitter();
const wss = new WebSocket.Server({ noServer: true, path: "/api/ws" });
const owopWS = new WebSocket.Server({ noServer: true, path: "/api/owop", port: 9000 });

emitter.setMaxListeners(1000);

const clients = [];

wss.on('connection', async (ws: WebSocket, req: any) => {
    let res: any = {};
    await sessionParser(req, res, () => {

        // console.log(req.session);
    });
    clients.push(ws);
    setInterval(() => heartbeat(ws), 20000);
    let tournamentId = null;
    let taClient: client = null;
    ws.on('message', (message) => {
        try {
            let data = JSON.parse(<string>message);
            if (data.setTournament) {
                tournamentId = data.setTournament;
                let tmp = { t: tournamentId };
                // console.log(TAController.taClients);
                emitter.emit("getTAState", tmp);
                taClient = tmp.t?.taClient;
                delete taClient?.State?.serverSettings?.password;
                ws.send(JSON.stringify({ TA: taClient }));
            }
            // console.log(data);
            if (data.overlay) {
                sendAll(data);
            }
        } catch (error) {
            // probably not json can ignore
            // console.error(error);
        }
    });
    // emitter.on('bracketUpdate', (data) => {
    //     ws.send(JSON.stringify({ bracketUpdate: data }));
    // });
    emitter.on('bracketMatch', (data: bracketMatch) => {
        if (tournamentId == data.tournamentId) ws.send(JSON.stringify({ bracketMatch: data }));
    });
    emitter.on('taEvent', (data) => {
        if (tournamentId == data[0]) {
            ws.send(JSON.stringify({ TA: data[1] }));
        }
    });
    emitter.on('newParticipant', (data) => {
        if (tournamentId == data[0]) {
            ws.send(JSON.stringify({ newParticipant: data[1] }));
        }
    });
});

function heartbeat(ws: WebSocket) {
    ws.send(JSON.stringify({ heatbeat: [] }));
}

function sendAll(message) {
    for (const client of clients) {
        client.send(JSON.stringify(message));
    }
}

export { emitter, wss, owopWS };