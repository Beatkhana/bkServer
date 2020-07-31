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
    tournamentId: number,
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
    bracket_limit: number
}