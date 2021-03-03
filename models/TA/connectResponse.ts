import { load } from "protobuf-typescript";
import { ResponseType, TAResponse } from "./response";
import type { State } from "./state";
import type { User } from "./User";
import path from 'path';
import { Coordinator } from "./coordinator";
import { Player } from "./player";

export class ConnectResponse {
    response: TAResponse;
    // self: User;
    player?: Player;
    coordinator: Coordinator;
    state: State;
    serverVersion: number;
    password: string;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/connect_response.proto');

        const conRes = root.lookupType("TournamentAssistantShared.Models.Packets.ConnectResponse");

        var errMsg = conRes.verify(buffer);
        if (errMsg)
            throw Error(errMsg);

        const message = conRes.decode(buffer);
        return message;
    }
}