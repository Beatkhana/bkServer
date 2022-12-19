import { Prisma } from "@prisma/client";
import DatabaseService, { prisma } from "./database";

export class TournamentService {
    public static async getTournaments({ auth = false, userId = "", mini = false, archived = false, limit = 50, offset = 0 }: { auth?: boolean; userId?: string; mini?: boolean; archived?: boolean; limit?: number; offset?: number }) {
        if (limit > 50) limit = 50;
        const tournaments = await prisma.tournaments.findMany({
            include: {
                tournament_settings: true
            },
            where: {
                archived: archived,
                is_mini: mini,
                ...(!auth && {
                    OR: [
                        {
                            tournament_settings: {
                                public: true
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
            },
            skip: offset,
            take: limit
        });
        return tournaments;
    }

    public static async getTournament({ id, auth = false, userId = "" }: { id: bigint | number; auth?: boolean; userId?: string }) {
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
                                public: true
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
        return t;
    }

    public static async getTAEnabledTournaments() {
        const tournaments = await prisma.tournaments.findMany({
            select: {
                id: true,
                tournament_settings: {
                    select: {
                        ta_url: true,
                        ta_password: true
                    }
                }
            },
            where: {
                NOT: {
                    tournament_settings: {
                        ta_url: null
                    }
                }
            }
        });
        return tournaments;
    }

    public static async getTournamentStaffIds(tourneyId: bigint, roleIds?: number[]) {
        const staff = await prisma.tournament_role_assignment.findMany({
            where: {
                tournament_id: tourneyId,
                ...(roleIds && { role_id: { in: roleIds } })
            }
        });
        return staff.map(x => x.user_id);
    }

    public static async createTournament(data) {
        data.date = new Date(data.date);
        data.endDate = new Date(data.endDate);
        return await prisma.tournaments.create({
            data: data
        });
    }

    public static async updateTournament(tournamentId: bigint, data) {
        data.date = new Date(data.date);
        data.endDate = new Date(data.endDate);
        await prisma.tournaments.update({
            data: data,
            where: {
                id: tournamentId
            }
        });
    }

    public static async archiveTournament(tournamentId: bigint, data: Partial<Prisma.tournamentsCreateInput>) {
        await prisma.tournaments.update({
            where: {
                id: tournamentId
            },
            data: {
                ...data,
                archived: true
            }
        });
    }

    public static async setImage(tournamentId: bigint, imageName: string) {
        await prisma.tournaments.update({
            data: {
                image: imageName
            },
            where: {
                id: tournamentId
            }
        });
    }

    public static async deleteTournament(tournamentId: bigint) {
        await prisma.tournaments.delete({
            where: {
                id: tournamentId
            }
        });
    }

    public static async getTournamentAPIKey(tourneyId: bigint) {
        const key = await prisma.api_keys.findFirst({
            where: {
                tournamentId: tourneyId
            }
        });
        return key?.api_key;
    }

    public static async getStaff(tourneyId: bigint) {
        let data = (await DatabaseService.query(
            `SELECT 
            u.discordId, 
            u.ssId, 
            u.name, 
            u.twitchName, 
            u.avatar, 
            u.globalRank, 
            u.localRank, 
            u.country, 
            u.tourneyRank, 
            u.TR, 
            u.pronoun,
            tr.role_name,
            tr.id as role_id
        FROM users u
        JOIN tournament_role_assignment tra ON tra.user_id = u.discordId AND tra.tournament_id = ?
        JOIN tournament_roles tr ON tr.id = tra.role_id`,
            [tourneyId]
        )) as any[];
        let users = [];
        for (const user of data) {
            let existingUser = users.find(x => x.discordId == user.discordId);
            if (existingUser) {
                existingUser.roles.push({ id: user.role_id, role: user.role_name });
            } else {
                users.push({
                    discordId: user.discordId,
                    ssId: user.ssId,
                    name: user.name,
                    twitchName: user.twitchName,
                    avatar: user.avatar,
                    globalRank: user.globalRank,
                    localRank: user.locaRank,
                    country: user.country,
                    tourneyRank: user.tourneyRank,
                    TR: user.TR,
                    pronoun: user.pronoun,
                    roles: [
                        {
                            id: user.role_id,
                            role: user.role_name
                        }
                    ]
                });
            }
        }
        return users;
    }

    static async clearStaff(tournamentId: bigint) {
        await prisma.tournament_role_assignment.deleteMany({
            where: {
                tournament_id: tournamentId
            }
        });
    }

    static async addStaff(data: Prisma.tournament_role_assignmentCreateManyInput[]) {
        await prisma.tournament_role_assignment.createMany({
            data: data
        });
    }
}
