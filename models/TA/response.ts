import { load } from "protobuf-typescript";

export class TAResponse {
    type: ResponseType;
    message: string;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/response.proto');
        const response = root.lookupType("TournamentAssistantShared.Models.Packets.Response");
        const message = response.decode(buffer);
        return response.toObject(message);
    }
}

export enum ResponseType {
    Fail,
    Success
}