import { load, Root } from "protobuf-typescript";
import type { GameplayParameters } from "./gameplayParameters";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/score_request.proto');
})();

export class ScoreRequest {
    eventId: string;
    parameters: GameplayParameters;

    static ParseFrom(buffer: Buffer) {
        const scoreRequest = root.lookupType("TournamentAssistantShared.Models.Packets.ScoreRequest");
        const message = scoreRequest.decode(buffer);
        return scoreRequest.toObject(message);
    }
}