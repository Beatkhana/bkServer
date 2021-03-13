import { load, Root } from "protobuf-typescript";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/response.proto');
})();


export class TAResponse {
    type: ResponseType;
    message: string;

    static ParseFrom(buffer: Buffer) {
        const response = root.lookupType("TournamentAssistantShared.Models.Packets.Response");
        const message = response.decode(buffer);
        return response.toObject(message);
    }
}

export enum ResponseType {
    Fail,
    Success
}