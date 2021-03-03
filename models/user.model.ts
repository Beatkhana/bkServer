export interface updateUser {
    discordId: string,
    ssId?: string,
    name: string,
    twitchName: string,
    pronoun: string,
    roleIds: Array<Number>
}

export interface User {
    discordId: string;
    ssId?: string;
    name: string;
    twitchName: string;
    avatar: string;
    globalRank: number;
    localRank: number;
    country: string;
    pronoun: string;
    region: string;
    refresh_token?: string;
    roleIds?: number[] | string;
    roleNames?: string[] | string;
    badges?: badge[]
}

export interface userAPI {
    discordId: string;
    ssId?: string;
    name: string;
    twitchName: string;
    avatar: string;
    globalRank: number;
    localRank: number;
    country: string;
    tourneyRank: number;
    TR: number;
    pronoun: string;
    tournaments: string[];
    badges: badge[];
}

export interface badge {
    id: number
    image: string
    description: string
}