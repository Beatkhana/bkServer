import { load, Root } from "protobuf-typescript";
import type { Score } from "./score";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/submit_score.proto');
})();

export class SubmitScore {
    score: Score;

    static ParseFrom(buffer: Buffer) {
        const submitScore = root.lookupType("TournamentAssistantShared.Models.Packets.SubmitScore");
        const message = submitScore.decode(buffer);
        return submitScore.toObject(message, {
            longs: String
        });
    }
}