import type { Beatmap } from "./beatmap";
import type { GameplayModifiers } from "./gameplayModifiers";
import type { PlayerSpecificSettings } from "./playerSpecificSettnigs";

export interface GameplayParameters {
    Beatmap: Beatmap;
    PlayerSettings: PlayerSpecificSettings;
    GameplayModifiers: GameplayModifiers;
}