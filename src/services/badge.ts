import { Prisma } from ".prisma/client";
import { prisma } from "./database";

export class BadgeService {
    static async getBadges() {
        return await prisma.badges.findMany();
    }

    static async clearBadgesFromUser(discordId: string) {
        return await prisma.badge_assignment.deleteMany({
            where: {
                userId: discordId
            }
        });
    }

    static async addBadgesToUser(data: Prisma.badge_assignmentCreateManyInput[]) {
        return await prisma.badge_assignment.createMany({
            data: data
        });
    }

    static async createBadge(data: Prisma.badgesCreateInput) {
        return await prisma.badges.create({
            data: data
        });
    }

    static async deleteBadge(id: number) {
        return await prisma.badges.delete({
            where: {
                id: id
            }
        });
    }

    static async updateBadge(id: number, data: Prisma.badgesUpdateInput) {
        return await prisma.badges.update({
            where: {
                id: id
            },
            data: data
        });
    }
}
