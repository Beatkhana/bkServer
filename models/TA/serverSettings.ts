import type { Team } from "./team";

export interface ServerSettings {
    serverName: string;
    enableTeams: boolean;
    teams: Team[];
    scoreUpdateFrequency: number;
    bannedMods: string[];
    password: string;
}