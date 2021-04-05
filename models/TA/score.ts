import type { GameplayParameters } from "./gameplayParameters";

export interface Score {
    EventId: string;
    Parameters: GameplayParameters;
    UserId: number;
    Username: string;
    Score: number;
    FullCombo: boolean;
    Color: string;
}