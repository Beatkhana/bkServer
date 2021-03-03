import { load } from "protobuf-typescript";
import type { Score } from "./score";

export class ScoreRequestResponse {
    scores: Score[];

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/score_request_response.proto');
        const scoreRequestResponse = root.lookupType("TournamentAssistantShared.Models.Packets.ScoreRequestResponse");
        const message = scoreRequestResponse.decode(buffer);
        return scoreRequestResponse.toObject(message);
    }
}