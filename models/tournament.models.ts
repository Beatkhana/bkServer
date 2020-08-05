export interface tournamentUpdate {
    tournament: {
        name: string,
        date: string,
        endDate: string,
        discord: string,
        owner: string,
        twitchLink: string,
        image: string,
        imgName?: string,
        prize: string,
        info: string
    },
    id: string
}

export interface updateParticipant {
    tournamentId: string,
    comment: string
    discordId: string,
    participantId: string
}

export interface removeParticipant {
    participantId: string
}

export interface tournamentSettings {
    id: number,
    tournamentId: string,
    public_signups: boolean,
    show_signups: boolean,
    public: boolean,
    state: string,
    type: string,
    has_bracket: boolean,
    has_map_pool: boolean,
    signup_comment: string,
    comment_required: boolean,
    bracket_sort_method: string,
    bracket_limit: number,
    quals_cutoff: number,
    show_quals: boolean
}

export interface qualsScore {
    tournamentId: string,
    userId: string,
    ssId: string,
    songHash: string,
    score: string,
    totalScore: string,
    percentage?: number
}

export class qualScore {
    tournamentId: string;
    ssId: string;
    songHash: string;
    score: string;
    totalScore: string;
    constructor(data: qualsScore) {
        this.tournamentId = data.tournamentId;
        this.ssId = data.ssId;
        this.songHash = data.songHash;
        this.score = data.score;
        this.totalScore = data.totalScore;
    }
}

export interface match {
    round: number,
    matchNum: number,
    p1: string,
    p2: string
}
export interface bslMatch {
    id: number
    round: number,
    matchNum: number,
    p1: string,
    p2: string,
    p1Score: number,
    p2Score: number,
    status: string,
    p1Rank: number,
    p2Rank: number,
    p1Seed: number,
    p2Seed: number,
    p1Name: string,
    p2Name: string,
    p1Country: string,
    p2Country: string,
    p1Avatar: string,
    p2Avatar: string,
    bye?: boolean,
}