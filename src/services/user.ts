import { Prisma } from ".prisma/client";
import { IUser } from "../models/user";
import { prisma } from "./database";

export class UserService {
    public static async allUsers() {
        const user = await prisma.users.findMany({
            include: {
                roleassignment: true
            }
        });
        if (!user) return null;
        return user.map(x => {
            return {
                discordId: x.discordId,
                ssId: x.ssId,
                name: x.name,
                twitchName: x.twitchName,
                avatar: x.avatar,
                globalRank: x.globalRank,
                localRank: x.localRank,
                country: x.country,
                pronoun: x.pronoun,
                roles: x.roleassignment.map(y => y.roleId)
            };
        });
    }

    public static async getUser({ discordId, ssId }: { discordId?: string; ssId?: string } = {}) {
        const user = await prisma.users.findFirst({
            where: {
                ...(discordId ? { discordId: discordId } : {}),
                ...(ssId ? { ssId: ssId } : {})
            },
            include: {
                roleassignment: {
                    include: {
                        roles: true
                    }
                },
                participants: {
                    include: {
                        tournaments: true
                    }
                },
                badge_assignment: {
                    include: {
                        badges: true
                    }
                }
            }
        });
        if (!user) return null;
        return {
            discordId: user.discordId,
            ssId: user.ssId,
            name: user.name,
            twitchName: user.twitchName,
            avatar: user.avatar,
            globalRank: user.globalRank,
            localRank: user.localRank,
            country: user.country,
            pronoun: user.pronoun,
            roles: user.roleassignment.map(x => x.roles),
            tournaments: user.participants.map(x => x.tournaments),
            badges: user.badge_assignment.map(x => x.badges)
        };
    }

    public static async searchUsersById(ids: string[], sort?: Prisma.Enumerable<Prisma.usersOrderByWithRelationInput>, limit?: number) {
        const users = await prisma.users.findMany({
            where: {
                discordId: {
                    in: ids
                }
            },
            ...(sort && {
                orderBy: sort
            }),
            ...(limit && {
                take: limit
            })
        });
        if (!users) return null;
        return users;
    }

    public static async createUser(data: Prisma.usersCreateInput) {
        return await prisma.users.create({
            data: data
        });
    }

    public static async updateUser(discordId: string, data: Prisma.usersUpdateInput) {
        if (data.avatar === null) data.avatar = "";
        return await prisma.users.update({
            where: {
                discordId: discordId
            },
            data: data
        });
    }

    static async clearRoles(discordId: string) {
        return await prisma.roleassignment.deleteMany({
            where: {
                userId: discordId
            }
        });
    }

    static async addRoles(data: Prisma.roleassignmentCreateManyInput[]) {
        return await prisma.roleassignment.createMany({
            data: data
        });
    }
}
