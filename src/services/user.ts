import { IUser } from "../models/user";
import { prisma } from "./database";

export class UserService {
    public static async getUser(discordId: string): Promise<IUser.User | null> {
        const user = await prisma.users.findFirst({
            where: {
                discordId: discordId
            },
            include: {
                roleassignment: true
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
            roles: user.roleassignment.map(x => x.roleId)
        };
    }
}
