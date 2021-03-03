import type { BeatmapDifficulty } from './match';

export interface Characteristic {
    serializedName: string;
    difficulties: BeatmapDifficulty[];
}