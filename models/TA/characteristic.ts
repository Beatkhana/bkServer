import type { BeatmapDifficulty } from './match';

export interface Characteristic {
    SerializedName: string;
    Difficulties: BeatmapDifficulty[];
}