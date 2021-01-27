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
    var tournamentId = null;
    var taClient = null;
    ws.on('message', function (message) {
        var _a, _b, _c;
        try {
            var data = JSON.parse(message);
            if (data.setTournament) {
                tournamentId = data.setTournament;
                var tmp = { t: tournamentId };
                emitter.emit("getTAState", tmp);
                taClient = (_a = tmp.t) === null || _a === void 0 ? void 0 : _a.taClient;
                (_c = (_b = taClient === null || taClient === void 0 ? void 0 : taClient.State) === null || _b === void 0 ? void 0 : _b.ServerSettings) === null || _c === void 0 ? true : delete _c.Password;
                ws.send(JSON.stringify({ TA: taClient }));
            }
        }
        catch (error) {
            console.error(error);
        }
    });
    emitter.on('bracketUpdate', function (data) {
        ws.send(JSON.stringify({ bracketUpdate: data }));
    });
    emitter.on('bracketMatch', function (data) {
        ws.send(JSON.stringify({ bracketMatch: data }));
    });
    emitter.on('taEvent', function (data) {
        if (tournamentId == data[0]) {
            ws.send(JSON.stringify({ TA: data }));
        }
    });
});
function heartbeat(ws) {
    ws.send(JSON.stringify({ heatbeat: [] }));
}
