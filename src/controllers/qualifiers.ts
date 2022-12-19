import express from "express";
import { Models } from "tournament-assistant-client";
import { qualifierSession } from "../models/qualifiers";
import { MapPoolService } from "../services/mapPool";
import { ParticipantService } from "../services/participant";
import { QualifiersService } from "../services/qualifiers";
import { TournamentService } from "../services/tournament";
import { authController } from "./auth";
import { controller } from "./controller";
import { TAController } from "./TA/ta.controller";

export class QualifiersController extends controller {
    async getScores(req: express.Request, res: express.Response) {
        const auth = new authController(req);
        const id = auth.tourneyId;
        return res.send(await QualifiersService.getScores(id));
    }

    // TA intergration
    async updateFlags(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        try {
            await QualifiersController.updateMaps(auth.tourneyId);
            for (const song of req.body) {
                if (!song.flags) song.flags = 0;
                await QualifiersService.setTAFlags(auth.tourneyId, song.id, song.flags, song.playerOptions, song.difficulty, song.selectedCharacteristic);
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    // TODO: Redo at some point
    // static async taScoreProto(score: Models.LeaderboardScore, tournamentId: bigint) {
    //     let settings = await TournamentSettingsService.getSettings(tournamentId);
    //     if (settings.state != "qualifiers") return;
    //     let user: any;
    //     if (score.user_id.includes("quest_")) {
    //         let tmpId = await DatabaseService.query(`SELECT * FROM quest_ids WHERE qId = ?`, [score.user_id.split("_")[1]]);
    //         user = await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.discordId = ? AND p.tournamentId = ?`, [tmpId[0].userId, tournamentId]);
    //     } else {
    //         user = await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.user_id, tournamentId]);
    //     }
    //     if (user.length < 1) return;
    //     user = user[0];
    //     let levelHash = score.parameters.beatmap.level_id.replace(`custom_level_`, "").toUpperCase();
    //     let map = (await DatabaseService.query(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId])) as any[];
    //     if (map.length < 1) return;
    //     // console.log(user);
    //     let curScore = await DatabaseService.query(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
    //     if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
    //     let attempt = 1;
    //     if (curScore[0] && curScore[0].attempt) attempt = curScore[0].attempt + 1;
    //     let qualScore = {
    //         tournamentId: tournamentId,
    //         userId: user.discordId,
    //         songHash: levelHash,
    //         score: score.score | 0,
    //         percentage: 0,
    //         maxScore: 0,
    //         attempt: attempt
    //     };
    //     // console.log(qualScore);
    //     try {
    //         await DatabaseService.query(
    //             `INSERT INTO qualifier_scores SET ?
    //         ON DUPLICATE KEY UPDATE
    //         score = GREATEST(score, VALUES(score)),
    //         percentage = GREATEST(percentage, VALUES(percentage)),
    //         maxScore = GREATEST(maxScore, VALUES(maxScore)),
    //         attempt = GREATEST(attempt, VALUES(attempt))`,
    //             [qualScore]
    //         );
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // static async taScore(score: Models.LeaderboardScore, tournamentId: string) {
    //     let settings: any = (await DatabaseService.query(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId])) as any[];
    //     if (settings.length < 1) return;
    //     settings = settings[0];
    //     if (settings.state != "qualifiers") return;
    //     let user: any;
    //     user = (await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.user_id, tournamentId])) as any[];
    //     if (user.length < 1) return;
    //     user = user[0];
    //     let levelHash = score.parameters.beatmap.level_id.replace(`custom_level_`, "").toUpperCase();
    //     let map = (await DatabaseService.query(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId])) as any[];
    //     if (map.length < 1) return;
    //     // console.log(user);
    //     let curScore = await DatabaseService.query(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
    //     if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
    //     let attempt = 1;
    //     if (curScore[0] && curScore[0].attempt) attempt = curScore[0].attempt + 1;
    //     let qualScore = {
    //         tournamentId: tournamentId,
    //         userId: user.discordId,
    //         songHash: levelHash,
    //         score: score.score | 0,
    //         percentage: 0,
    //         maxScore: 0,
    //         attempt: attempt
    //     };
    //     // console.log(qualScore);
    //     try {
    //         await DatabaseService.query(
    //             `INSERT INTO qualifier_scores SET ?
    //         ON DUPLICATE KEY UPDATE
    //         score = GREATEST(score, VALUES(score)),
    //         percentage = GREATEST(percentage, VALUES(percentage)),
    //         maxScore = GREATEST(maxScore, VALUES(maxScore)),
    //         attempt = GREATEST(attempt, VALUES(attempt))`,
    //             [qualScore]
    //         );
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // static async taLiveScore(score: Packets.Push.SongFinished, tournamentId: string) {
    //     let settings: settings[] | settings = await DatabaseService.query(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId]);
    //     console.log(settings);
    //     if (settings.length < 1) return;
    //     settings = settings[0];
    //     if (settings.state != "qualifiers") return;
    //     if (settings.quals_method != "live_quals") return;
    //     let user: any;
    //     user = await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.player.user_id, tournamentId]);
    //     if (user.length < 1) return;
    //     user = user[0];
    //     let levelHash = score.beatmap.level_id.replace(`custom_level_`, "").toUpperCase();
    //     let map = (await DatabaseService.query(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId])) as any[];
    //     if (map.length < 1) return;
    //     // session check
    //     // let sessions: qualifierSession[] = await DatabaseService.query(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? GROUP BY qs.id`, [tournamentId]);
    //     let sessionsData: any = await DatabaseService.query(
    //         `SELECT qs.id, qs.time, qs.limit, qs.tournamentId, u.discordId, u.name, u.avatar FROM qual_sessions qs
    //     LEFT JOIN session_assignment sa ON sa.sessionId = qs.id
    //     LEFT JOIN participants p ON p.id = sa.participantId
    //     LEFT JOIN users u ON u.discordId = p.userId
    //     WHERE qs.tournamentId = ?`,
    //         [tournamentId]
    //     );
    //     let sessions: qualifierSession[] = [];
    //     for (let row of sessionsData) {
    //         let sIndex = sessions.findIndex(x => x.id == row.id);
    //         if (sIndex > -1 && row.discordId) {
    //             sessions[sIndex].users.push({
    //                 userId: row.discordId,
    //                 name: row.name,
    //                 avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
    //             });
    //             sessions[sIndex].allocated++;
    //         } else if (row.discordId) {
    //             sessions.push({
    //                 id: row.id,
    //                 time: row.time,
    //                 limit: row.limit,
    //                 tournamentId: row.tournamentId,
    //                 users: [
    //                     {
    //                         userId: row.discordId,
    //                         name: row.name,
    //                         avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
    //                     }
    //                 ],
    //                 allocated: 1
    //             });
    //         } else {
    //             sessions.push({
    //                 id: row.id,
    //                 time: row.time,
    //                 limit: row.limit,
    //                 tournamentId: row.tournamentId,
    //                 users: [],
    //                 allocated: 0
    //             });
    //         }
    //     }
    //     let curSession: qualifierSession = sessions.find(x => x.users?.find(y => y.userId == user.discordId));
    //     // user not in session
    //     if (!curSession) return;
    //     let now = new Date();
    //     let sessionTime = new Date(curSession.time);
    //     if (Math.abs(now.getTime() - sessionTime.getTime()) / 36e5 > 2) {
    //         console.log(now, sessionTime);
    //         return;
    //     }
    //     // console.log(user);
    //     let curScore = await DatabaseService.query(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
    //     if (curScore[0]) return;
    //     let attempt = 1;
    //     // if (score.Type == CompletionType.Failed) score.Score *= 2;
    //     let qualScore = {
    //         tournamentId: tournamentId,
    //         userId: user.discordId,
    //         songHash: levelHash,
    //         score: score.score | 0,
    //         percentage: 0,
    //         maxScore: 0,
    //         attempt: attempt
    //     };
    //     try {
    //         await DatabaseService.query(
    //             `INSERT INTO qualifier_scores SET ?
    //         ON DUPLICATE KEY UPDATE
    //         score = GREATEST(score, VALUES(score)),
    //         percentage = GREATEST(percentage, VALUES(percentage)),
    //         maxScore = GREATEST(maxScore, VALUES(maxScore)),
    //         attempt = GREATEST(attempt, VALUES(attempt))`,
    //             [qualScore]
    //         );
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    static async updateMaps(tournamentId: bigint) {
        let maps = [...(await MapPoolService.getMapPools(tournamentId)).values()].find(x => x.is_qualifiers);
        if (maps) {
            await QualifiersService.clearTAFlagsForTournament(tournamentId);
            await QualifiersService.createTAFlags(
                tournamentId,
                maps.songs.map(x => x.id)
            );
        }
    }

    static async createEvent(tournamentId: bigint) {
        const tournament = await TournamentService.getTournament({ id: tournamentId, auth: true });

        const qualsPool = [...(await MapPoolService.getMapPools(tournamentId, true)).values()].find(x => x.is_qualifiers);
        let qualMaps = [];
        for (const song of qualsPool.songs) {
            let gm: Models.GameplayModifiers = Models.GameplayModifiers.fromObject({ options: song.options.flags });
            let map: Models.GameplayParameters = Models.GameplayParameters.fromObject({
                beatmap: {
                    name: song.name,
                    level_id: `custom_level_${song.hash.toUpperCase()}`,
                    characteristic: {
                        serialized_name: song.options.selectedCharacteristics,
                        difficulties: [song.options.difficulty]
                    },
                    difficulty: song.options.difficulty
                },
                player_settings: {
                    options: song.options.playerOptions
                },
                gameplay_modifiers: gm
            });
            qualMaps.push(map);
        }
        TAController.createEvent(tournamentId.toString(), qualMaps, `${tournament[0].name} Qualifiers`, tournament.tournament_settings.ta_event_flags);
    }

    async getTAScores(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms) || !auth.tourneyId) return this.clientError(res);
        let tournamentId = auth.tourneyId;
        const qualsPool = [...(await MapPoolService.getMapPools(tournamentId, true)).values()].find(x => x.is_qualifiers);
        let qualMaps = [];
        let i = 0;
        for (const song of qualsPool.songs) {
            let gm: Models.GameplayModifiers = Models.GameplayModifiers.fromObject({ options: song.options.flags });
            let map: Models.GameplayParameters = Models.GameplayParameters.fromObject({
                beatmap: {
                    name: song.name,
                    level_id: `custom_level_${song.hash.toUpperCase()}`,
                    characteristic: {
                        serialized_name: song.options.selectedCharacteristics,
                        difficulties: [song.options.difficulty]
                    },
                    difficulty: song.options.difficulty
                },
                player_settings: {
                    options: song.options.playerOptions
                },
                gameplay_modifiers: gm
            });
            // TODO: fix this
            // TAController.getScores(tournamentId, map);
            i++;
        }
        if (i > 0) {
            await QualifiersService.deleteTournamentScores(tournamentId);
        }
        return this.ok(res);
    }

    // static async runMatch(tournamentId) {
    //     let db = new database();
    //     let tournament = await DatabaseService.query(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
    //     let settings = await DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [tournamentId]);

    //     let songs = await DatabaseService.query(`SELECT s.* FROM pool_link s
    //     JOIN map_pools mp ON mp.id = s.poolId
    //     WHERE mp.tournamentId = ? AND mp.is_qualifiers = 1`, [tournamentId]);
    //     let qualMaps = [];
    //     // console.log(songs);
    //     for (const song of songs) {
    //         let map: gameplayParametersWS.GameplayParameters = {
    //             Beatmap: {
    //                 Name: song.songName,
    //                 LevelId: `custom_level_${song.songHash.toUpperCase()}`,
    //                 Characteristic: {
    //                     SerializedName: song.selCharacteristic,
    //                     Difficulties: [song.songDiff == "Expert+" ? "ExpertPlus" : song.songDiff]
    //                 },
    //                 Difficulty: song.songDiff == "Expert+" ? "ExpertPlus" : song.songDiff,
    //             },
    //             PlayerSettings: {
    //                 Options: song.playerOptions,
    //             },
    //             GameplayModifiers: null,
    //         };
    //         qualMaps.push(map);
    //     }
    //     console.log(qualMaps);
    //     let matchId = TAController.createMatch(tournamentId, qualMaps, `${tournament[0].name} Qualifiers`, settings[0].ta_event_flags);
    // }

    static async updateEvent(tournamentId: bigint) {
        const tournament = await TournamentService.getTournament({ id: tournamentId, auth: true });

        const qualsPool = [...(await MapPoolService.getMapPools(tournamentId, true)).values()].find(x => x.is_qualifiers);
        let qualMaps = [];

        for (const song of qualsPool.songs) {
            let gm: Models.GameplayModifiers = Models.GameplayModifiers.fromObject({ options: song.options.flags });
            let map: Models.GameplayParameters = Models.GameplayParameters.fromObject({
                beatmap: {
                    name: song.name,
                    level_id: `custom_level_${song.hash.toUpperCase()}`,
                    characteristic: {
                        serialized_name: song.options.selectedCharacteristics,
                        difficulties: [song.options.difficulty]
                    },
                    difficulty: song.options.difficulty
                },
                player_settings: {
                    options: song.options.playerOptions
                },
                gameplay_modifiers: gm
            });
            qualMaps.push(map);
        }
        TAController.updateEvent(tournamentId.toString(), qualMaps, `${tournament[0].name} Qualifiers`, tournament.tournament_settings.ta_event_flags);
    }

    async getSessions(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let settings = await this.getSettings(auth.tourneyId);
        if (!settings.public) return this.clientError(res);
        const sessions = await QualifiersService.getSessions(auth.tourneyId);
        return res.send(sessions);
    }

    async addSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let data = req.body as qualifierSession[];
        try {
            for (const session of data) {
                await QualifiersService.createSession({
                    time: new Date(session.time),
                    limit: session.limit,
                    tournamentId: BigInt(session.tournamentId)
                });
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deleteSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        try {
            await QualifiersService.deleteSession(+req.params.id);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async assignSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.userId) return this.clientError(res, "Not Logged in");
        if (!auth.tourneyId) return this.clientError(res, "Not tournament ID provided");
        if (!req.body.sessionId) return this.clientError(res, "Session not provided");
        const participant = await ParticipantService.getParticipant(auth.tourneyId, auth.userId);
        if (!participant) return this.clientError(res, "Not signed up for tournament");
        const curSession = await QualifiersService.getSession(auth.tourneyId, +req.body.sessionId);
        if (curSession.allocated >= curSession.limit) return this.clientError(res, "Session full");
        try {
            await QualifiersService.removeFromTournamentSessions(auth.tourneyId, participant.userId);
            await QualifiersService.addToTournamentSessions(auth.tourneyId, participant.participantId, +req.body.sessionId);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async userSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.userId) return this.clientError(res, "Not Logged in");
        if (!auth.tourneyId) return this.clientError(res, "Not tournament ID provided");
        const participant = await ParticipantService.getParticipant(auth.tourneyId, auth.userId);
        if (!participant) return this.clientError(res, "Not signed up for tournament");
        const curSession = await QualifiersService.getUserSession(auth.tourneyId, participant.participantId);
        return res.send(curSession);
    }

    async sessions(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        const sessions = await QualifiersService.getSessions(auth.tourneyId, true);
        return res.send(sessions);
    }
}
