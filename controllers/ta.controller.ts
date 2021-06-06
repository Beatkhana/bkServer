import { GameplayParameters } from "../models/TA/gameplayParameters";
import { QualifierEvent } from "../models/TA/qualifierEvent";
import { client } from "./client";
import { controller } from "./controller";
import { taSocket } from "./ta.socket";
import { taWebSocket } from "./ta.websocket";

// let wsClients: taWebSocket[] = [];
// let taClients: taSocket[] = [];
let taWSClients: taWebSocket[] = [];

export class TAController extends controller {

    taEnabledTournaments = [];

    async init() {
        this.taEnabledTournaments = await this.db.aQuery(`SELECT tournamentId, ta_url, ta_password FROM tournament_settings WHERE ta_url IS NOT NULL`);
        this.connectToTA();
        this.emitter.on("getTAState", (data) => {
            data.t = taWSClients.find(x => x.tournamentId == data.t);
        });
    }

    connectToTA() {
        for (const tournament of this.taEnabledTournaments) {

            // let tmp = new taSocket(tournament.tournamentId, tournament.ta_url, tournament.ta_password);
            // taClients.push(tmp);
            let tmp = new taWebSocket(tournament.tournamentId, tournament.ta_url, tournament.ta_password);
            taWSClients.push(tmp);
        }
    }

    static async updateConnection(tournamentId, url, password) {
        // let clientI = taClients.findIndex(x => x.tournamentId == tournamentId);
        // if (clientI > -1) {
        //     await taClients[clientI].close();
        //     taClients.splice(clientI, 1);
        //     if (url != "") taClients.push(new taSocket(tournamentId, url, password));
        // } else if (url != "") {
        //     taClients.push(new taSocket(tournamentId, url, password));
        // }
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            await taWSClients[clientI].close();
            taWSClients.splice(clientI, 1);
            if (url != "") taWSClients.push(new taWebSocket(tournamentId, url, password));
        } else if (url != "") {
            taWSClients.push(new taWebSocket(tournamentId, url, password));
        }
    }

    static createEvent(tournamentId, maps, name, flags) {
        // let clientI = taClients.findIndex(x => x.tournamentId == tournamentId);
        // if (clientI > -1) {
        //     taClients[clientI].createEvent(name, tournamentId, maps, flags);
        // }
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            taWSClients[clientI].createEvent(name, tournamentId, maps, flags);
        }
    }

    static getScores(tournamentId: string, options: GameplayParameters) {
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            return taWSClients[clientI].getScores(tournamentId, options);
        }
    }

    // static createMatch(tournamentId, maps, name, flags) {
    //     // let clientI = taClients.findIndex(x => x.tournamentId == tournamentId);
    //     // if (clientI > -1) {
    //     //     taClients[clientI].createEvent(name, tournamentId, maps, flags);
    //     // }
    //     let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
    //     if (clientI > -1) {
    //         return taWSClients[clientI].createMatch(name, tournamentId, maps, flags);
    //     }
    // }

    static deleteEvent(tournamentId) {
        // let clientI = taClients.findIndex(x => x.tournamentId == tournamentId);
        // if (clientI > -1) {
        //     taClients[clientI].deleteEvent(tournamentId);
        // }
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            taWSClients[clientI].deleteEvent(tournamentId);
        }
    }

    static updateEvent(tournamentId, maps, name, flags) {
        // let clientI = taClients.findIndex(x => x.tournamentId == tournamentId);
        // if (clientI > -1) {
        //     taClients[clientI].updateEvent(tournamentId, maps, name, flags);
        // }
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            taWSClients[clientI].updateEvent(tournamentId, maps, name, flags);
        }
    }

    public async closeTa() {
        // for (const client of taClients) {
        //     client.close()
        // }
        for (const client of taWSClients) {
            client.close()
        }
    }
}