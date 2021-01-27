import type { GameplayParameters } from "./gameplayParameters";

export interface ScoreRequest {
    eventId: string;
    parameters: GameplayParameters;
}