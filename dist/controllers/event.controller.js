"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.emitter = void 0;
var events_1 = require("events");
var WebSocket = __importStar(require("ws"));
var emitter = new events_1.EventEmitter();
exports.emitter = emitter;
var wss = new WebSocket.Server({ noServer: true, path: "/api/ws" });
exports.wss = wss;
emitter.setMaxListeners(1000);
wss.on('connection', function (ws) {
    setInterval(function () { return heartbeat(ws); }, 20000);
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
    emitter.on('bracketUpdate', function (data) {
        ws.send(JSON.stringify({ bracketUpdate: data }));
    });
    emitter.on('bracketMatch', function (data) {
        ws.send(JSON.stringify({ bracketMatch: data }));
    });
});
function heartbeat(ws) {
    ws.send(JSON.stringify({ heatbeat: [] }));
}
