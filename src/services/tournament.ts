import { prisma } from "./database";

export class TournamentService {
    public static async getTournaments({ auth, userId = "", mini = false, archived = false }: { auth: boolean; userId: string; mini?: boolean; archived?: boolean }) {
        const tournaments = await prisma.tournaments.findMany({
            include: {
                tournament_settings: true
            },
            where: {
                archived: archived,
                is_mini: +mini,
                ...(!auth && {
                    OR: [
                        {
                            tournament_settings: {
                                public: 1
                            }
                        },
                        {
                            owner: userId
                        },
                        {
                            tournament_role_assignment: {
                                some: {
                                    user_id: userId
                                }
                            }
                        }
                    ]
                })
            }
        });
        return tournaments.map(x => {
            return {
                tournamentId: x.id.toString(),
                name: x.name,
                image: x.image,
                startDate: x.date,
                endDate: x.endDate,
                discord: x.discord,
                twitchLink: x.twitchLink,
                prize: x.prize,
                info: x.info,
                owner: x.owner,
                archived: x.archived,
                first: x.first,
                second: x.second,
                third: x.third,
                public: x.tournament_settings.public
            };
        });
    }

    public static async getTournamentSimple(tourneyId: number) {
        const tourney = await prisma.tournaments.findFirst({
            where: {
                id: tourneyId
            }
        });
        if (!tourney) return null;
        return tourney;
    }

    public static async getTournament({ id, auth = false, userId = "" }: { id: number; auth: boolean; userId: string; mini?: boolean; archived?: boolean }) {
        const t = await prisma.tournaments.findFirst({
            include: {
                tournament_settings: true
            },
            where: {
                id: id,
                ...(!auth && {
                    OR: [
                        {
                            tournament_settings: {
                                public: 1
                            }
                        },
                        {
                            owner: userId
                        },
                        {
                            tournament_role_assignment: {
                                some: {
                                    user_id: userId
                                }
                            }
                        }
                    ]
                })
            }
        });
        if (!t) return null;
        return {
            tournamentId: t.id.toString(),
            name: t.name,
            image: t.image,
            startDate: t.date,
            endDate: t.endDate,
            discord: t.discord,
            twitchLink: t.twitchLink,
            prize: t.prize,
            info: t.info,
            owner: t.owner,
            archived: t.archived,
            first: t.first,
            second: t.second,
            third: t.third,
            settingsId: t.tournament_settings.id,
            public_signups: t.tournament_settings.public_signups,
            public: t.tournament_settings.public,
            state: t.tournament_settings.state,
            type: t.tournament_settings.type,
            has_bracket: t.tournament_settings.has_bracket,
            has_map_pool: t.tournament_settings.has_map_pool,
            signup_comment: t.tournament_settings.signup_comment,
            comment_required: t.tournament_settings.comment_required,
            show_signups: t.tournament_settings.show_signups,
            bracket_sort_method: t.tournament_settings.bracket_sort_method,
            bracket_limit: t.tournament_settings.bracket_limit,
            quals_cutoff: t.tournament_settings.quals_cutoff,
            show_quals: t.tournament_settings.show_quals,
            has_quals: t.tournament_settings.has_quals,
            countries: t.tournament_settings.countries,
            sort_method: t.tournament_settings.sort_method,
            standard_cutoff: t.tournament_settings.standard_cutoff,
            qual_attempts: t.tournament_settings.qual_attempts,
            quals_method: t.tournament_settings.quals_method,
            ta_url: t.tournament_settings.ta_url,
            ...(auth && {
                ta_password: t.tournament_settings.ta_password,
                ta_event_flags: t.tournament_settings.ta_event_flags
            })
        };
    }

    public static async getTournamentStaffIds(tourneyId: number, roleIds?: number[]) {
        const staff = await prisma.tournament_role_assignment.findMany({
            where: {
                tournament_id: tourneyId,
                ...(roleIds && { role_id: { in: roleIds } })
            }
        });
        return staff.map(x => x.user_id);
    }

    public static async getTournamentAPIKey(tourneyId: number) {
        const key = await prisma.api_keys.findFirst({
            where: {
                tournamentId: tourneyId
            }
        });
        return key?.api_key;
    }
}
