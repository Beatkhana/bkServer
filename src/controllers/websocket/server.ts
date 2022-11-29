import * as WebSocket from "ws";
import { bracketMatch } from "../../models/bracket.model";
import { getSessionParser } from "../../services/session";
import { emitter } from "../event";
import { TAClientWrapper } from "../TA/ClientWrapper";

const wss = new WebSocket.Server({ noServer: true, path: "/api/ws" });
const owopWS = new WebSocket.Server({ noServer: true, path: "/api/owop" });

export class wsController {
    private _clients: WebSocket[] = [];

    init() {
        // wss = new WebSocket.Server({ noServer: true, path: "/api/ws" });

        // taWS = new Client("BSL", {
        //     url: "ws://localhost:2053"
        // });

        // taWS.on("packet", packet => {
        //     bslWS.broadcastEvent(IWebsocket.MessageType.taPacket, Array.from(packet.serializeBinary()));
        // });

        // taWS.on("error", err => {
        //     console.error(err);
        // });

        // taWS.on("taConnected", () => {
        //     console.info("Connected to TA");
        // });

        wss.on("connection", async (ws: WebSocket, req) => {
            this._clients.push(ws);

            let res: any = {};
            const session = getSessionParser();
            session(req, res, async () => {});
            setInterval(() => this.heartbeat(ws), 20000);
            let tournamentId = null;
            let taClient: TAClientWrapper = null;
            ws.on("message", message => {
                try {
                    let data = JSON.parse(message.toString());
                    if (data.setTournament) {
                        tournamentId = data.setTournament;
                        let tmp = { t: tournamentId };
                        // console.log(TAController.taClients);
                        emitter.emit("getTAState", tmp);
                        taClient = tmp.t?.taClient;
                        ws.send(JSON.stringify({ TA: taClient }));
                    }
                    // console.log(data);
                    if (data.overlay) {
                        this.sendAll(data);
                    }
                } catch (error) {
                    // probably not json can ignore
                    // console.error(error);
                }
            });
            // emitter.on('bracketUpdate', (data) => {
            //     ws.send(JSON.stringify({ bracketUpdate: data }));
            // });
            emitter.on("bracketMatch", (data: bracketMatch) => {
                if (tournamentId == data.tournamentId) ws.send(JSON.stringify({ bracketMatch: data }));
            });
            emitter.on("taEvent", data => {
                if (tournamentId == data[0]) {
                    ws.send(JSON.stringify({ TA: data[1] }));
                }
            });
            emitter.on("newParticipant", data => {
                if (tournamentId == data[0]) {
                    ws.send(JSON.stringify({ newParticipant: data[1] }));
                }
            });

            ws.on("close", () => {
                this._clients = this._clients.filter(x => x !== ws);
            });
        });
    }

    heartbeat(ws: WebSocket) {
        ws.send(JSON.stringify({ heatbeat: [] }));
    }

    sendAll<T>(message: T) {
        for (const client of this._clients) {
            client.send(JSON.stringify(message));
        }
    }
}

export const wssServer = new wsController();

export { wss, owopWS };
