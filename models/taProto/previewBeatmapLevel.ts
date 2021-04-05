import type { Characteristic } from "./characteristic";

export interface PreviewBeatmapLevel {
    levelId: string;
    name: string;
    characteristics: Characteristic[];
    loaded: boolean;
}