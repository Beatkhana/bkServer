import { load } from "protobuf-typescript";
import type { Score } from "./score";

export class SubmitScore {
    score: Score;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/submit_score.proto');
        const submitScore = root.lookupType("TournamentAssistantShared.Models.Packets.SubmitScore");
        const message = submitScore.decode(buffer);
        return submitScore.toObject(message, {
            longs: String
        });
    }
}