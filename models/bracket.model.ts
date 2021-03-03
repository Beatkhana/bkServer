export interface bracketMatch {
    id: string;
    status: string;
    matchNum: number;
    tournamentId: number;
    round: number;
    p1: matchPlayer;
    p2: matchPlayer;
    bye: boolean;
    time: string;
    best_of: number;
    p1_prereq_identifier?: number;
    p2_prereq_identifier?: number;
}

export interface matchPlayer {
    id: string;
    ssId?: string;
    name: string;
    avatar: string;
    score: number;
    country: string;
    seed: number;
    forfeit: boolean;
    twitch: string;
    rank: number;
}

export interface coordinator {
    id: string;
    name: string;
    avatar: string;
}