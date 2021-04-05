import type { GameplayParameters } from "./gameplayParameters";

export interface Score {
    eventId: string;
    parameters: GameplayParameters;
    userId: string;
    username: string;
    score: number;
    fullCombo: boolean;
    color: string;
}