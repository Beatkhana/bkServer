import type { GameplayParameters } from "./gameplayParameters";

export interface Score {
    eventId: string;
    parameters: GameplayParameters;
    userId: number;
    username: string;
    score: number;
    fullCombo: boolean;
    color: string;
}