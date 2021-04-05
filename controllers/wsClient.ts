import { ConnectResponse } from "../models/TA/connectResponse";
import { Coordinator } from "../models/TA/coordinator";
import { Match } from "../models/TA/match";
import { Player } from "../models/TA/player";
import { QualifierEvent } from "../models/TA/qualifierEvent";
import { ResponseType } from "../models/TA/response";
import { State } from "../models/TA/state";
import { User } from "../models/TA/User";

export class wsClient {

    buffer: string;

    port: number;
    url: string;

    public Self: User;
    public State: State | undefined;

    public isConnected = false;

    public matchId = false;

    constructor(connectResponse?: ConnectResponse) {
        if (connectResponse && connectResponse.Type == ResponseType.Success) {
            this.Self = connectResponse.Self;
            this.State = connectResponse.State;
            delete this.State.ServerSettings.Password;
            this.isConnected = true;
        }
    }

    coordinatorAdded(data: Coordinator) {
        if (!this.isConnected) return;
        let index = this.State.Coordinators.findIndex(x => x.Id == data.Id);
        if (index == -1) this.State.Coordinators.push(data);
    }

    coordinatorLeft(data: Coordinator) {
        let index = this.State.Coordinators.findIndex(x => x.Id == data.Id);
        if (index > -1) this.State.Coordinators.splice(index, 1);
    }

    matchCreated(match: Match) {
        // console.log(match);
        if (!this.State.Matches.find(x => x.Guid == match.Guid)) this.State.Matches.push(match);
    }

    matchUpdated(match: Match) {
        let index = this.State.Matches.findIndex(x => x.Guid == match.Guid);
        if (index > -1) this.State.Matches[index] = match;
    }

    matchDeleted(match: Match) {
        let index = this.State.Matches.findIndex(x => x.Guid == match.Guid);
        if (index > -1) this.State.Matches.splice(index, 1);
    }

    playerAdded(player: Player) {
        this.State.Players.push(player);
    }

    playerUpdated(player: Player) {
        let index = this.State.Players.findIndex(x => x.Id == player.Id);
        if (index > -1) this.State.Players[index] = player;
    }

    playerLeft(player: Player) {
        let index = this.State.Players.findIndex(x => x.Id == player.Id);
        if (index > -1) this.State.Players.splice(index, 1);
    }

    qualifierEventCreated(event: QualifierEvent) {
        let index = this.State.Events.findIndex(x => x.EventId == event.EventId);
        if (index == -1) this.State.Events.push(event);
    }

    qualifierEventUpdated(event: QualifierEvent) {
        let index = this.State.Events.findIndex(x => x.EventId == event.EventId);
        if (index > -1) this.State.Events[index] = event;
    }

    qualifierEventDeleted(event: QualifierEvent) {
        let index = this.State.Events.findIndex(x => x.EventId == event.EventId);
        if (index > -1) this.State.Events.splice(index, 1);
    }
}