import type { Characteristic } from "./characteristic";
import type { BeatmapDifficulty } from './match';

export interface Beatmap {
    name?: string;
    levelId: string;
    characteristic: Characteristic;
    difficulty: BeatmapDifficulty;
}