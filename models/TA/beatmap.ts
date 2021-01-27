import type { Characteristic } from "./characteristic";
import type { BeatmapDifficulty } from './match';

export interface Beatmap {
    Name?: string;
    LevelId: string;
    Characteristic: Characteristic;
    Difficulty: BeatmapDifficulty;
}