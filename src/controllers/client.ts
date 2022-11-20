import { ConnectResponse } from "../models/taProto/connectResponse";
import { Coordinator } from "../models/taProto/coordinator";
import { Match } from "../models/taProto/match";
import { Player } from "../models/taProto/player";
import { QualifierEvent } from "../models/taProto/qualifierEvent";
import { ResponseType } from "../models/taProto/response";
import { State } from "../models/taProto/state";
import { User } from "../models/taProto/User";

export class client {

    buffer: string;

    port: number;
    url: string;

    public Self: Coordinator | undefined;
    public State: State | undefined;

    public isConnected = false;

    public matchId = false;

    constructor(connectResponse?: ConnectResponse) {
        if (connectResponse && connectResponse.response.type == ResponseType.Success) {
            this.Self = connectResponse.player ?? connectResponse.coordinator;
            this.State = connectResponse.state;
            delete this.State.serverSettings.password;
            this.isConnected = true;
        }
    }

    coordinatorAdded(data: Coordinator) {
        if (!this.isConnected) return;
        let index = this.State.coordinators.findIndex(x => x.id == data.id);
        if (index == -1) this.State.coordinators.push(data);
    }

    coordinatorLeft(data: Coordinator) {
        let index = this.State.coordinators.findIndex(x => x.id == data.id);
        if (index > -1) this.State.coordinators.splice(index, 1);
    }

    matchCreated(match: Match) {
        // console.log(match);
        if (!this.State.matches.find(x => x.guid == match.guid)) this.State.matches.push(match);
    }

    matchUpdated(match: Match) {
        let index = this.State.matches.findIndex(x => x.guid == match.guid);
        if (index > -1) this.State.matches[index] = match;
    }

    matchDeleted(match: Match) {
        let index = this.State.matches.findIndex(x => x.guid == match.guid);
        if (index > -1) this.State.matches.splice(index, 1);
    }

    playerAdded(player: Player) {
        this.State.players.push(player);
    }

    playerUpdated(player: Player) {
        let index = this.State.players.findIndex(x => x.id == player.id);
        if (index > -1) this.State.players[index] = player;
    }

    playerLeft(player: Player) {
        let index = this.State.players.findIndex(x => x.id == player.id);
        if (index > -1) this.State.players.splice(index, 1);
    }

    qualifierEventCreated(event: QualifierEvent) {
        let index = this.State.events.findIndex(x => x.eventId == event.eventId);
        if (index == -1) this.State.events.push(event);
    }

    qualifierEventUpdated(event: QualifierEvent) {
        let index = this.State.events.findIndex(x => x.eventId == event.eventId);
        if (index > -1) this.State.events[index] = event;
    }

    qualifierEventDeleted(event: QualifierEvent) {
        let index = this.State.events.findIndex(x => x.eventId == event.eventId);
        if (index > -1) this.State.events.splice(index, 1);
    }
}