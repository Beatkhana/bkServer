import { prisma } from "./database";

export class TournamentService {
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
