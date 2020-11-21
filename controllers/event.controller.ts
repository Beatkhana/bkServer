import { EventEmitter } from 'events';
import * as WebSocket from 'ws';

const emitter: EventEmitter = new EventEmitter();
const wss = new WebSocket.Server({ noServer: true, path: "/api/ws" });

emitter.setMaxListeners(1000);

wss.on('connection', (ws: WebSocket) => {
    setInterval(() => heartbeat(ws), 20000);
    // emitter.on('reschedule', (data) => {
    //     ws.send(JSON.stringify({ reschdule: data }));
    // });
    // emitter.on('schedule', (data) => {
    //     ws.send(JSON.stringify({ schedule: data }));
    // });
    // emitter.on('matchUpdate', (data) => {
    //     ws.send(JSON.stringify({ matchUpdate: data }));
    // });
    // emitter.on('score', (data) => {
    //     ws.send(JSON.stringify({ qualScore: data }));
    // });
    // emitter.on('packet', (data) => {
    //     ws.send(JSON.stringify({ taPacket: data }));
    // });
    emitter.on('bracketUpdate', (data) => {
        ws.send(JSON.stringify({bracketUpdate: data}));
    });
    emitter.on('bracketMatch', (data) => {
        ws.send(JSON.stringify({bracketMatch: data}));
    });
});

function heartbeat(ws: WebSocket) {
    ws.send(JSON.stringify({ heatbeat: []}));
}

export { emitter, wss };