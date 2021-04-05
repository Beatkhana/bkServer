import type { Beatmap } from "./beatmap";
import type { GameplayModifiers } from "./gameplayModifiers";
import type { PlayerSpecificSettings } from "./playerSpecificSettnigs";

export interface GameplayParameters {
    beatmap: Beatmap;
    playerSettings: PlayerSpecificSettings;
    gameplayModifiers: GameplayModifiers;
}