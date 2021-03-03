import { load } from "protobuf-typescript";
import type { GameplayParameters } from "./gameplayParameters";

export class ScoreRequest {
    eventId: string;
    parameters: GameplayParameters;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/score_request.proto');
        const scoreRequest = root.lookupType("TournamentAssistantShared.Models.Packets.ScoreRequest");
        const message = scoreRequest.decode(buffer);
        return scoreRequest.toObject(message);
    }
}