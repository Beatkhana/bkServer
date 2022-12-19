import { Models } from "tournament-assistant-client";
import { TournamentService } from "../../services/tournament";
import { controller } from "../controller";
import { TAClientWrapper } from "./ClientWrapper";

let taWSClients: TAClientWrapper[] = [];

interface ITAEnabledTournaments {
    id: bigint;
    tournament_settings: {
        ta_url: string;
        ta_password: string;
    };
}

export class TAController extends controller {
    taEnabledTournaments: ITAEnabledTournaments[] = [];

    async init() {
        this.taEnabledTournaments = await TournamentService.getTAEnabledTournaments();
        this.connectToTA();
        this.emitter.on("getTAState", data => {
            data.t = taWSClients.find(x => x.tournamentId == data.t);
        });
    }

    connectToTA() {
        for (const tournament of this.taEnabledTournaments) {
            let tmp = new TAClientWrapper(tournament.id.toString(), tournament.tournament_settings.ta_url, tournament.tournament_settings.ta_password);
            taWSClients.push(tmp);
        }
    }

    static async updateConnection(tournamentId: string, url: string, password: string) {
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            await taWSClients[clientI].taClient.close();
            taWSClients.splice(clientI, 1);
            if (url != "") taWSClients.push(new TAClientWrapper(tournamentId, url, password));
        } else if (url != "") {
            taWSClients.push(new TAClientWrapper(tournamentId, url, password));
        }
    }

    static createEvent(tournamentId: string, maps: Models.GameplayParameters[], name: string, flags: number) {
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            taWSClients[clientI].createEvent(name, tournamentId, maps, flags);
        }
    }

    // static getScores(tournamentId: string, options: Models.GameplayParameters) {
    //     let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
    //     if (clientI > -1) {
    //         return taWSClients[clientI].getScores(tournamentId, options);
    //     }
    // }

    static deleteEvent(tournamentId: string) {
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            taWSClients[clientI].deleteEvent(tournamentId);
        }
    }

    static updateEvent(tournamentId: string, maps: Models.GameplayParameters[], name: string, flags: number) {
        let clientI = taWSClients.findIndex(x => x.tournamentId == tournamentId);
        if (clientI > -1) {
            taWSClients[clientI].updateEvent(tournamentId, maps, name, flags);
        }
    }

    public async closeTa() {
        for (const client of taWSClients) {
            client.taClient.close();
        }
    }
}
