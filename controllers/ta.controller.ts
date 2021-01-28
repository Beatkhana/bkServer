import { QualifierEvent } from "../models/TA/qualifierEvent";
import { client } from "./client";
import { controller } from "./controller";
import { taWebSocket } from "./ta.websocket";

let wsClients: taWebSocket[] = [];

export class TAController extends controller {

    taEnabledTournaments = [];

    async init() {
        this.taEnabledTournaments = await this.db.aQuery(`SELECT tournamentId, ta_url, ta_password FROM tournament_settings WHERE ta_url IS NOT NULL`);
        this.connectToTA();
        this.emitter.on("getTAState", (data) => {
            data.t = wsClients.find(x => x.tournamentId == data.t);
        });
    }

    connectToTA() {
        for (const tournament of this.taEnabledTournaments) {
            let tmp = new taWebSocket(tournament.tournamentId, tournament.ta_url, tournament.ta_password);
            wsClients.push(tmp);
        }
    }

    static updateConnection(tournamentId, url, password) {
        let clientI = wsClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            wsClients[clientI].close();
            wsClients.splice(clientI, 1);
            wsClients.push(new taWebSocket(tournamentId, url, password));
        } else {
            wsClients.push(new taWebSocket(tournamentId, url, password));
        }
    }

    static createEvent(tournamentId, maps, name, flags) {
        let clientI = wsClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            wsClients[clientI].createEvent(name, tournamentId, maps, flags);
        }
    }

    static deleteEvent(tournamentId) {
        let clientI = wsClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            wsClients[clientI].deleteEvent(tournamentId);
        }
    }

    static updateEvent(tournamentId, maps, name, flags) {
        let clientI = wsClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            wsClients[clientI].updateEvent(tournamentId, maps, name, flags);
        }
    }

    public async closeTa() {
        for (const client of wsClients) {
            client.close()
        }
    }
}