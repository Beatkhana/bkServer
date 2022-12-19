import { Prisma } from "@prisma/client";
import { bracketMatch } from "../models/bracket.model";
import DatabaseService, { prisma } from "./database";
import { TournamentSettingsService } from "./tournament_settings";

export class BracketService {
    static async bracketMatchData(tourneyId: string | number, matchId: string | number) {
        const matchData = await DatabaseService.query<any>(
            `SELECT bracket.*,
        u1.globalRank as p1GlobalRank,
        u2.globalRank as p2GlobalRank,
        u1.ssId as p1ssId,
        u2.ssId as p2ssId,
        u1.name as p1Name,
        u2.name as p2Name,
        u1.country as p1Country,
        u2.country as p2Country,
        u1.avatar as p1Avatar,
        u2.avatar as p2Avatar,
        u1.twitchName as p1Twitch,
        u2.twitchName as p2Twitch,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.id = ? AND bracket.tournamentId = ?`,
            [matchId, tourneyId]
        );
        if (Array.isArray(matchData) && matchData.length < 1) return null;
        let row = matchData[0];
        let match = {
            id: row.id,
            status: row.status,
            matchNum: row.matchNum,
            tournamentId: row.tournamentId,
            p1: {
                id: row.p1,
                ssId: row.p1ssId,
                name: row.p1Name,
                avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                score: row.p1Score,
                country: row.p1Country,
                seed: row.p1Seed,
                forfeit: row.p1Forfeit,
                twitch: row.p1Twitch,
                rank: row.p1GlobalRank
            },
            p2: {
                id: row.p2,
                ssId: row.p2ssId,
                name: row.p2Name,
                avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                score: row.p2Score,
                country: row.p2Country,
                seed: row.p2Seed,
                forfeit: row.p2Forfeit,
                twitch: row.p2Twitch,
                rank: row.p2GlobalRank
            },
            round: row.round,
            bye: row.bye,
            time: row.time,
            best_of: row.best_of
        };
        return match;
    }

    public static async bracketData(id: bigint) {
        const settings: any = await TournamentSettingsService.getSettings(id);
        const bracketData: any = await DatabaseService.query(
            `SELECT bracket.*,
        u1.globalRank as p1Rank,
        u2.globalRank as p2Rank,
        u1.name as p1Name,
        u2.name as p2Name,
        u1.country as p1Country,
        u2.country as p2Country,
        u1.avatar as p1Avatar,
        u2.avatar as p2Avatar,
        u1.twitchName as p1Twitch,
        u2.twitchName as p2Twitch,
        u1.ssId as p1ssId,
        u2.ssId as p2ssId,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.tournamentId = ? `,
            [id]
        );

        let matches: bracketMatch[] = [];
        for (const row of bracketData) {
            let match = {
                id: row.id,
                status: row.status,
                matchNum: row.matchNum,
                tournamentId: row.tournamentId,
                p1: {
                    id: row.p1,
                    ssId: row.p1ssId,
                    name: row.p1Name,
                    avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                    score: row.p1Score,
                    country: row.p1Country,
                    seed: row.p1Seed,
                    forfeit: row.p1Forfeit,
                    twitch: row.p1Twitch,
                    rank: row.p1Rank
                },
                p2: {
                    id: row.p2,
                    ssId: row.p2ssId,
                    name: row.p2Name,
                    avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                    score: row.p2Score,
                    country: row.p2Country,
                    seed: row.p2Seed,
                    forfeit: row.p2Forfeit,
                    twitch: row.p2Twitch,
                    rank: row.p2Rank
                },
                round: row.round,
                bye: row.bye,
                time: row.time,
                best_of: row.best_of
            };
            matches.push(match);
        }

        // set loser text
        if (settings.type == "double_elim") {
            const bracket = await this.bracketDataOld(id);
            let maxRound = Math.max.apply(
                Math,
                matches.map(x => x.round)
            );
            for (const match of matches) {
                if (match.round >= 0) {
                    let thisMatch = match;
                    let loserRound = -1;
                    let loserMatch = Math.floor(thisMatch.matchNum / 2);
                    let loserIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                    if (thisMatch.round > 0) {
                        loserIdentifier = "p1";
                        loserRound = thisMatch.round * -2;
                        if ((thisMatch.round % 3) % 2 == 0) {
                            loserMatch = thisMatch.matchNum % 2 == 0 ? thisMatch.matchNum + 1 : thisMatch.matchNum - 1;
                        } else {
                            loserMatch = bracket.filter((x: { round: number }) => x.round == 0).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1;
                        }
                        if (maxRound - 2 == thisMatch.round) {
                            loserMatch = 0;
                        }
                    }
                    let loserNextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == loserRound && x.matchNum == loserMatch);
                    while (loserNextMatch?.bye) {
                        loserRound--;
                        loserMatch = (loserRound * -1) % 2 == 0 ? loserMatch : Math.floor(loserMatch / 2);
                        if (loserRound == -3) loserIdentifier = loserIdentifier == "p1" ? "p2" : "p1";
                        loserNextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == loserRound && x.matchNum == loserMatch);
                    }
                    if (loserNextMatch) matches[matches.findIndex(x => x.id == loserNextMatch.id)][`${loserIdentifier}_prereq_identifier`] = match.id;
                }
            }
        }

        return matches;
    }

    private static async bracketDataOld(id: bigint) {
        const bracketData: any = await DatabaseService.query(
            `SELECT bracket.*,
        u1.globalRank as p1Rank,
        u2.globalRank as p2Rank,
        u1.ssId as p1ssId,
        u2.ssId as p2ssId,
        u1.name as p1Name,
        u2.name as p2Name,
        u1.country as p1Country,
        u2.country as p2Country,
        u1.avatar as p1Avatar,
        u2.avatar as p2Avatar,
        u1.twitchName as p1Twitch,
        u2.twitchName as p2Twitch,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.tournamentId = ? `,
            [id]
        );
        return bracketData;
    }

    static async updateBracketMatch(matchId: number, data: Prisma.bracketUpdateInput) {
        return await prisma.bracket.update({
            where: {
                id: matchId
            },
            data: data
        });
    }

    static async clearBracket(tourneyId: number | bigint) {
        return await prisma.bracket.deleteMany({
            where: {
                tournamentId: tourneyId
            }
        });
    }

    static async createBracket(bracket: Prisma.bracketCreateManyInput[]) {
        return await prisma.bracket.createMany({
            data: bracket
        });
    }
}
