import { load, Root } from "protobuf-typescript";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/connect.proto');
})();

export class Connect {
    clientType: ConnectTypes;
    name: string;
    userId: string;
    clientVersion: number;

    static ParseFrom(buffer: Buffer) {
        const connect = root.lookupType("TournamentAssistantShared.Models.Packets.Connect");
        const message = connect.decode(buffer);
        return connect.toObject(message);
    }
}

export enum ConnectTypes {
    Player,
    Coordinator,
    TemporaryConnection
}