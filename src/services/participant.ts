import { Prisma } from ".prisma/client";
import { participants, users } from "@prisma/client";
import { prisma } from "./database";

export class ParticipantService {
    public static async getParticipants(tournamentId: bigint, reqUserId: string = "", isAuth: boolean = false, sort?: Prisma.Enumerable<Prisma.participantsOrderByWithRelationInput>, limit?: number) {
        const p = await prisma.participants.findMany({
            where: {
                tournamentId: tournamentId,
                ...(!isAuth && {
                    tournaments: {
                        tournament_settings: {
                            show_signups: true
                        }
                    }
                })
            },
            include: {
                users: true
            },
            ...(sort && {
                orderBy: sort
            }),
            ...(limit && {
                take: limit
            })
        });
        return p.map(x => this.prismaToModel(x, reqUserId === x.userId ? true : isAuth));
    }

    public static async getParticipant(tournamentId: bigint, userId: string, isAuth: boolean = false) {
        const p = await prisma.participants.findFirst({
            include: {
                users: true
            },
            where: {
                tournamentId: tournamentId,
                userId: userId
            }
        });
        return this.prismaToModel(p, isAuth);
    }

    public static async createParticipant(data: Prisma.participantsCreateArgs["data"]) {
        return await prisma.participants.create({
            data: data
        });
    }

    public static async deleteParticipant(participantId: number) {
        return await prisma.participants.delete({
            where: {
                id: participantId
            }
        });
    }

    public static async updateParticipant({ tournamentId, userId = "", participantId, data }: { tournamentId: bigint; userId?: string; participantId?: number; data: Partial<Prisma.participantsCreateInput> }) {
        return await prisma.participants.update({
            data: data,
            where: {
                ...(userId !== "" && {
                    tournamentId_userId: {
                        tournamentId: tournamentId,
                        userId: userId
                    }
                }),
                ...(participantId && {
                    id: participantId
                })
            }
        });
    }

    public static async updateTournamentParticipants(tournamentId: bigint, data: Partial<Prisma.participantsCreateInput>) {
        return await prisma.participants.updateMany({
            data: data,
            where: {
                tournamentId: tournamentId
            }
        });
    }

    private static prismaToModel(user: participants & { users: users }, isAuth: boolean) {
        if (!user) return null;
        return {
            participantId: user.id,
            userId: user.userId,
            forfeit: user.forfeit,
            seed: user.seed,
            position: user.position,
            discordId: user.users.discordId,
            ssId: user.users.ssId,
            name: user.users.name,
            twitchName: user.users.twitchName,
            avatar: user.users.avatar,
            globalRank: user.users.globalRank,
            localRank: user.users.localRank,
            country: user.users.country,
            tourneyRank: user.users.tourneyRank,
            TR: user.users.TR,
            pronoun: user.users.pronoun,
            comment: isAuth ? user.comment : null
        };
    }
}
