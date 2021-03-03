import { load } from "protobuf-typescript";
import type { Characteristic } from "./characteristic";
import type { Player } from "./player";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";
import type { User } from "./User";

export class Match {
    guid: string;
    players: Player[];
    leader: User;
    selectedLevel?: PreviewBeatmapLevel;
    selectedCharacteristic?: Characteristic;
    selectedDifficulty: BeatmapDifficulty;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/match.proto');
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