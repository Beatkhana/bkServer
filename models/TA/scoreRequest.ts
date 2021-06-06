import type { GameplayParameters } from "./gameplayParameters";

export interface ScoreRequest {
    EventId: string;
    Parameters: GameplayParameters;
}