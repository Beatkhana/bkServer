import type { Team } from "./team";

export interface ServerSettings {
    ServerName: string;
    EnableTeams: boolean;
    Teams: Team[];
    ScoreUpdateFrequency: number;
    BannedMods: string[];
    Password: string;
}