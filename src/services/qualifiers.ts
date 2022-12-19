import { Prisma } from "@prisma/client";
import DatabaseService, { prisma } from "./database";

export class QualifiersService {
    public static async getScores(tournamentId: bigint) {
        const qualsScores: any = await DatabaseService.query(
            `SELECT p.userId as discordId, p.forfeit, q.score, q.percentage, pl.*, u.* FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN qualifier_scores q ON p.userId = q.userId 
        LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId
        LEFT JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND mp.is_qualifiers AND mp.tournamentId = ? AND (q.tournamentId IS NULL OR q.tournamentId = ?)`,
            [tournamentId, tournamentId, tournamentId]
        );
        let scores = [];
        for (const score of qualsScores) {
            if (scores.some(x => x.discordId == score.discordId)) {
                //do thing
                let pIndex = scores.findIndex(x => x.discordId == score.discordId);
                scores[pIndex].scores.push({
                    score: +score.score,
                    percentage: +score.percentage,
                    poolId: score.poolId,
                    songHash: score.songHash,
                    songName: score.songName,
                    songAuthor: score.songAuthor,
                    levelAuthor: score.levelAuthor,
                    songDiff: score.songDiff,
                    key: score.key,
                    ssLink: score.ssLink
                });
            } else {
                let curScore = [];
                if (score.score != null) {
                    curScore = [
                        {
                            score: +score.score,
                            percentage: +score.percentage,
                            poolId: score.poolId,
                            songHash: score.songHash,
                            songName: score.songName,
                            songAuthor: score.songAuthor,
                            levelAuthor: score.levelAuthor,
                            songDiff: score.songDiff,
                            key: score.key,
                            ssLink: score.ssLink
                        }
                    ];
                }
                let temp = {
                    discordId: score.discordId,
                    ssId: score.ssId,
                    name: score.name,
                    twitchName: score.twitchName,
                    avatar: score.avatar,
                    globalRank: score.globalRank,
                    localRank: score.localRank,
                    country: score.country,
                    tourneyRank: score.tourneyRank,
                    TR: score.TR,
                    pronoun: score.pronoun,
                    forfeit: score.forfeit,
                    scores: curScore
                };
                scores.push(temp);
            }
        }
        return scores;
    }

    static async setTAFlags(tournamentId: bigint, mapId: number, flags: number, playerOptions: number, diff: number, selCharacteristic: string) {
        return await prisma.event_map_options.updateMany({
            where: {
                tournament_id: tournamentId,
                map_id: mapId
            },
            data: {
                flags: flags,
                difficulty: diff,
                playerOptions: playerOptions,
                selCharacteristic: selCharacteristic
            }
        });
    }

    static async clearTAFlagsForTournament(tournamentId: bigint) {
        return await prisma.event_map_options.deleteMany({
            where: {
                tournament_id: tournamentId
            }
        });
    }

    static async createTAFlags(tournamentId: bigint, mapIds: number[]) {
        let data = [];
        for (const mapId of mapIds) {
            data.push({
                tournament_id: tournamentId,
                map_id: mapId
            });
        }
        return await prisma.event_map_options.createMany({
            data: data
        });
    }

    static async deleteTournamentScores(tournamentId: bigint) {
        return await prisma.qualifier_scores.deleteMany({
            where: {
                tournamentId: tournamentId
            }
        });
    }

    // QUALIFIER SESSIONS
    static async getSessions(tournamentId: bigint, isAuth: boolean = false) {
        const data = await prisma.qual_sessions.findMany({
            where: {
                tournamentId: tournamentId
            },
            include: {
                _count: {
                    select: {
                        session_assignment: true
                    }
                },
                ...(isAuth && {
                    session_assignment: {
                        include: {
                            participants: {
                                include: {
                                    users: true
                                }
                            }
                        }
                    }
                })
            }
        });
        if (!data) return [];
        return data.map(x => {
            return {
                id: x.id,
                time: x.time,
                limit: x.limit,
                allocated: x._count.session_assignment,
                users: isAuth
                    ? x.session_assignment.map(y => {
                          return {
                              userId: y.participants.users.discordId,
                              name: y.participants.users.name,
                              avatar: y.participants.users.avatar ? `/${y.participants.users.avatar}` + (y.participants.users.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
                          };
                      })
                    : []
            };
        });
    }

    static async getSession(tournamentId: bigint, sessionId: number, isAuth: boolean = false) {
        const data = await prisma.qual_sessions.findFirst({
            where: {
                tournamentId: tournamentId,
                id: sessionId
            },
            include: {
                _count: {
                    select: {
                        session_assignment: true
                    }
                },
                ...(isAuth && {
                    session_assignment: {
                        include: {
                            participants: {
                                include: {
                                    users: true
                                }
                            }
                        }
                    }
                })
            }
        });
        if (!data) return null;
        return {
            id: data.id,
            time: data.time,
            limit: data.limit,
            allocated: data._count.session_assignment,
            users: isAuth
                ? data.session_assignment.map(y => {
                      return {
                          userId: y.participants.users.discordId,
                          name: y.participants.users.name,
                          avatar: y.participants.users.avatar ? `/${y.participants.users.avatar}` + (y.participants.users.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
                      };
                  })
                : []
        };
    }

    static async createSession(sessions: Prisma.qual_sessionsCreateArgs["data"]) {
        return await prisma.qual_sessions.create({
            data: sessions
        });
    }

    static async deleteSession(id: number) {
        return await prisma.qual_sessions.delete({
            where: {
                id: id
            }
        });
    }

    static async removeFromTournamentSessions(tournamentId: bigint, userId: string) {
        return await prisma.session_assignment.deleteMany({
            where: {
                participants: {
                    userId: userId,
                    tournamentId: tournamentId
                }
            }
        });
    }

    static async addToTournamentSessions(tournamentId: bigint, participantId: number, sessionId: number) {
        return await prisma.session_assignment.create({
            data: {
                participantId: participantId,
                sessionId: sessionId
            }
        });
    }

    static async getUserSession(tournamentId: bigint, participantId: number) {
        const data = await prisma.qual_sessions.findFirst({
            where: {
                tournamentId: tournamentId,
                session_assignment: {
                    some: {
                        participantId: participantId
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        session_assignment: true
                    }
                }
            }
        });
        if (!data) return null;
        return {
            id: data.id,
            time: data.time,
            limit: data.limit,
            allocated: data._count.session_assignment,
            users: []
        };
    }
}
