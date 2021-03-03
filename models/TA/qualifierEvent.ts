import { load } from "protobuf-typescript";
import { protoAny } from "./anyType";
import type { GameplayParameters } from "./gameplayParameters";

export class QualifierEvent {
    eventId: string;
    name: string;
    guild: Guild;
    infoChannel: Channel;
    qualifierMaps: GameplayParameters[];
    sendScoresToInfoChannel: boolean;
    flags: number;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/qualifier_event.proto');
        const qualEvent = root.lookupType("TournamentAssistantShared.Models.QualifierEvent");
        const message = qualEvent.decode(buffer);
        return qualEvent.toObject(message);
    }

    static async encode(data: QualifierEvent) {
        const root = await load(__dirname + '/../../protobuf/Models/qualifier_event.proto');
        const qualEvent = root.lookupType("TournamentAssistantShared.Models.QualifierEvent");
        var errMsg = qualEvent.verify(data);
        if (errMsg)
            throw Error(errMsg);
        let msg = qualEvent.create(data);
        // console.log(msg);
        let buff = qualEvent.encode(msg).finish();
        // console.log("decoded", qualEvent.decode(buff));
        return buff;
    }

    static async encodeAsAny(data: QualifierEvent) {
        const root = await load(__dirname + '/../../protobuf/Models/qualifier_event.proto');
        const qualEvent = root.lookupType("TournamentAssistantShared.Models.QualifierEvent");
        var errMsg = qualEvent.verify(data);
        if (errMsg)
            throw Error(errMsg);
        let msg = qualEvent.create(data);
        let buff = qualEvent.encode(msg).finish();
        return new protoAny({
            type_url: "type.googleapis.com/TournamentAssistantShared.Models.QualifierEvent",
            value: buff
        });
    }
}

export enum EventSettings {
    None = 0,
    HideScoreFromPlayers = 1,
    DisableScoresaberSubmission = 2
}

export interface Guild {
    id: string;
    name: string;
}

export interface Channel {
    id: number;
    name: string;
}