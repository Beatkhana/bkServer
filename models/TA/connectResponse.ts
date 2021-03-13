import { load, Root } from "protobuf-typescript";
import { TAResponse } from "./response";
import type { State } from "./state";
import { Coordinator } from "./coordinator";
import { Player } from "./player";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/connect_response.proto');
})();

export class ConnectResponse {
    response: TAResponse;
    // self: User;
    player?: Player;
    coordinator: Coordinator;
    state: State;
    serverVersion: number;
    password: string;

    static ParseFrom(buffer: Buffer) {
        const conRes = root.lookupType("TournamentAssistantShared.Models.Packets.ConnectResponse");

        var errMsg = conRes.verify(buffer);
        if (errMsg)
            throw Error(errMsg);

        const message = conRes.decode(buffer);
        return message;
    }
}