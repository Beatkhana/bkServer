import { load, Root } from "protobuf-typescript";
import type { Score } from "./score";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/score_request_response.proto');
})();

export class ScoreRequestResponse {
    scores: Score[];

    static ParseFrom(buffer: Buffer) {
        const scoreRequestResponse = root.lookupType("TournamentAssistantShared.Models.Packets.ScoreRequestResponse");
        const message = scoreRequestResponse.decode(buffer);
        return scoreRequestResponse.toObject(message);
    }
}