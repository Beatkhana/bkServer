import { prisma } from "./database";

export class TournamentService {
    public static async getTournaments({ auth, userId, mini = false, archived = false }: { auth: boolean; userId: string; mini?: boolean; archived?: boolean }) {
        const tournaments = await prisma.tournaments.findMany({
            include: {
                tournament_settings: true
            },
            where: {
                archived: false,
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

    public static async getTournament(tourneyId: number) {
        const tourney = await prisma.tournaments.findFirst({
            where: {
                id: tourneyId
            }
        });
        if (!tourney) return null;
        return tourney;
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
