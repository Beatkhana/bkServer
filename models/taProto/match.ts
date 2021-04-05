import { load, Root } from "protobuf-typescript";
import type { Characteristic } from "./characteristic";
import type { Player } from "./player";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";
import type { User } from "./User";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/match.proto');
})();

export class Match {
    guid: string;
    players: Player[];
    leader: User;
    selectedLevel?: PreviewBeatmapLevel;
    selectedCharacteristic?: Characteristic;
    selectedDifficulty: BeatmapDifficulty;

    static ParseFrom(buffer: Buffer) {
        const match = root.lookupType("TournamentAssistantShared.Models.Match");
        const message = match.decode(buffer);
        return match.toObject(message);
    }
}

export enum BeatmapDifficulty {
    Easy,
    Normal,
    Hard,
    Expert,
    ExpertPlus
}