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