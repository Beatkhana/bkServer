import { load, Root } from "protobuf-typescript";
import { Coordinator } from "./coordinator";
import { Match } from "./match";
import { Player } from "./player";
import { QualifierEvent } from "./qualifierEvent";

let eventRoot: Root;

(async () => {
    eventRoot = await load(__dirname + '/../../protobuf/Models/Packets/event.proto');
})();

export class TAEvent {
    type: EventType;
    changedObject: any;

    static ParseFrom(buffer: Buffer) {

        const eventPack = eventRoot.lookupType("TournamentAssistantShared.Models.Packets.Event");

        var errMsg = eventPack.verify(buffer);
        if (errMsg)
            throw Error(errMsg);

        const message = eventPack.decode(buffer);
        let event: protoEvent = eventPack.toObject(message) as protoEvent;
        // console.log(event.type)
        switch (event.type) {
            case EventType.PlayerAdded:
                event.changedObject = Player.ParseFrom(event.changedObject.value);
                break;
            case EventType.PlayerUpdated:
                event.changedObject = Player.ParseFrom(event.changedObject.value);
                break;
            case EventType.PlayerLeft:
                event.changedObject = Player.ParseFrom(event.changedObject.value);
                break;
            case EventType.CoordinatorAdded:
                event.changedObject = Coordinator.ParseFrom(event.changedObject.value);
                break;
            case EventType.CoordinatorLeft:
                event.changedObject = Coordinator.ParseFrom(event.changedObject.value);
                break;
            case EventType.MatchCreated:
                event.changedObject = Match.ParseFrom(event.changedObject.value);
                break;
            case EventType.MatchUpdated:
                event.changedObject = Match.ParseFrom(event.changedObject.value);
                break;
            case EventType.MatchDeleted:
                event.changedObject = Match.ParseFrom(event.changedObject.value);
                break;
            case EventType.QualifierEventCreated:
                event.changedObject = QualifierEvent.ParseFrom(event.changedObject.value);
                break;
            case EventType.QualifierEventUpdated:
                event.changedObject = QualifierEvent.ParseFrom(event.changedObject.value);
                break;
            case EventType.QualifierEventDeleted:
                event.changedObject = QualifierEvent.ParseFrom(event.changedObject.value);
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