import { Prisma } from ".prisma/client";
import { prisma } from "./database";

export class TournamentSettingsService {
    public static async createBlank(tournamentId: bigint) {
        await prisma.tournament_settings.create({
            data: {
                tournamentId: tournamentId
            }
        });
    }

    public static async getSettings(tournamentId: bigint) {
        return await prisma.tournament_settings.findFirst({
            where: {
                tournamentId: tournamentId
            }
        });
    }

    public static async updateSettings(tournamentId: bigint, data: Partial<Prisma.tournament_settingsCreateInput>) {
        return await prisma.tournament_settings.update({
            data: data,
            where: {
                tournamentId: tournamentId
            }
        });
    }
}
