export interface qualifierSession {
    id?: number;
    tournamentId: string;
    time: string;
    limit: number;
    allocated: number;
    users?: sessionUser[];
}

export interface sessionUser {
    userId: string;
    name: string;
    avatar: string;
}