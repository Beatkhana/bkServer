import { load } from "protobuf-typescript";

export class Connect {
    clientType: ConnectTypes;
    name: string;
    userId: string;
    clientVersion: number;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/connect.proto');
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