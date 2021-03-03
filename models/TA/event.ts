import { load } from "protobuf-typescript";
import { Coordinator } from "./coordinator";
import { Match } from "./match";
import { Player } from "./player";
import { QualifierEvent } from "./qualifierEvent";

export class TAEvent {
    type: EventType;
    changedObject: any;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/event.proto');

        const conRes = root.lookupType("TournamentAssistantShared.Models.Packets.Event");

        var errMsg = conRes.verify(buffer);
        if (errMsg)
            throw Error(errMsg);

        const message = conRes.decode(buffer);
        let event: protoEvent = conRes.toObject(message) as protoEvent;
        // console.log(event.type)
        switch (event.type) {
            case EventType.PlayerAdded:
                event.changedObject = await Player.ParseFrom(event.changedObject.value);
                break;
            case EventType.PlayerUpdated:
                event.changedObject = await Player.ParseFrom(event.changedObject.value);
                break;
            case EventType.PlayerLeft:
                event.changedObject = await Player.ParseFrom(event.changedObject.value);
                break;
            case EventType.CoordinatorAdded:
                event.changedObject = await Coordinator.ParseFrom(event.changedObject.value);
                break;
            case EventType.CoordinatorLeft:
                event.changedObject = await Coordinator.ParseFrom(event.changedObject.value);
                break;
            case EventType.MatchCreated:
                event.changedObject = await Match.ParseFrom(event.changedObject.value);
                break;
            case EventType.MatchUpdated:
                event.changedObject = await Match.ParseFrom(event.changedObject.value);
                break;
            case EventType.MatchDeleted:
                event.changedObject = await Match.ParseFrom(event.changedObject.value);
                break;
            case EventType.QualifierEventCreated:
                event.changedObject = await QualifierEvent.ParseFrom(event.changedObject.value);
                break;
            case EventType.QualifierEventUpdated:
                event.changedObject = await QualifierEvent.ParseFrom(event.changedObject.value);
                break;
            case EventType.QualifierEventDeleted:
                event.changedObject = await QualifierEvent.ParseFrom(event.changedObject.value);
                break;
            // case EventType.HostAdded:

            //     break;
            // case EventType.HostRemoved:

            //     break;

            default:
                event.changedObject = null;
                break;
        }

        return event;
    }

    static async encode(data: TAEvent) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/event.proto');
        const event = root.lookupType("TournamentAssistantShared.Models.Packets.Event");
        var errMsg = event.verify(data);
        if (errMsg)
            throw Error(errMsg);
        let msg = event.create(data);
        let buff = event.encode(msg).finish();
        return buff;
    }

}

export interface protoEvent {
    type: number;
    changedObject: any | {
        type_url: string;
        value: Buffer;
    };
}

export enum EventType {
    None,
    PlayerAdded,
    PlayerUpdated,
    PlayerLeft,
    CoordinatorAdded,
    CoordinatorLeft,
    MatchCreated,
    MatchUpdated,
    MatchDeleted,
    QualifierEventCreated,
    QualifierEventUpdated,
    QualifierEventDeleted,
    HostAdded,
    HostRemoved
}