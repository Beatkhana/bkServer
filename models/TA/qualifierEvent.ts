import type { GameplayParameters } from "./gameplayParameters";

export interface QualifierEvent {
    EventId: string;
    Name: string;
    Guild: Guild;
    InfoChannel: Channel;
    QualifierMaps: GameplayParameters[];
    SendScoresToInfoChannel: boolean;
    Flags: number;
}

export enum EventSettings {
    None = 0,
    HideScoreFromPlayers = 1,
    DisableScoresaberSubmission = 2
}

export interface Guild {
    Id: string;
    Name: string;
}

export interface Channel {
    Id: string;
    Name: string;
}