import type { Characteristic } from "./characteristic";
import type { Player } from "./player";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";
import type { User } from "./User";

export interface Match {
    Guid: string;
    Players: Player[];
    Leader: User;
    SelectedLevel?: PreviewBeatmapLevel;
    SelectedCharacteristic?: Characteristic;
    SelectedDifficulty: BeatmapDifficulty;
}

export enum BeatmapDifficulty {
    Easy,
    Normal,
    Hard,
    Expert,
    ExpertPlus
}