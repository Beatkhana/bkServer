import express from "express";
import { Models, Packets } from "tournament-assistant-client";
import { qualifierSession } from "../models/qualifiers";
import { settings } from "../models/settings.model";
import { qualsScore } from "../models/tournament.models";
import DatabaseService from "../services/database";
import { authController } from "./auth.controller";
import { controller } from "./controller";
import { emitter } from "./event.controller";
import { TAController } from "./TA/ta.controller";

export class QualifiersController extends controller {
    // legacy method
    async saveScore(req: express.Request, res: express.Response) {
        // let auth = new authController(req);
        // let data: qualsScore = req.body;
        // if (!await auth.validApiKey) return this.unauthorized(res);
        // const tournamentSettings: any = await this.DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId]);
        // if (tournamentSettings.length <= 0 || (tournamentSettings[0].state != 'qualifiers' && !!tournamentSettings[0].public)) return res.send({ error: 'invalid tournament settings' });
        // const userInfo: any = await this.DatabaseService.query("SELECT p.*, u.discordId FROM participants p LEFT JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?", [data.ssId, data.tournamentId]);
        // if (userInfo.length <= 0) return res.send({ error: "invalid user" });
        // delete data.ssId;
        // data.userId = userInfo[0].discordId;
        // const mapPool: any = await this.DatabaseService.query("SELECT pl.songHash FROM pool_link pl LEFT JOIN map_pools mp ON pl.poolId = mp.id WHERE mp.tournamentId = ? AND is_qualifiers = 1 AND live = 1", [data.tournamentId]);
        // // console.log(mapPool.some(x=> x.songHash == data.songHash));
        // if (!mapPool.some(x => x.songHash.toLowerCase() == data.songHash.toLowerCase())) return res.send({ error: "invalid song hash" });
        // data.percentage = +data.score / +data.totalScore;
        // if (data.percentage >= 1) return res.send({ error: "invalid score" });
        // data.maxScore = data.totalScore;
        // delete data.totalScore;
        // let savedData: any = await this.DatabaseService.query(`INSERT INTO qualifier_scores SET ?
        // ON DUPLICATE KEY UPDATE
        // score = GREATEST(score, VALUES(score)),
        // percentage = GREATEST(percentage, VALUES(percentage)),
        // maxScore = GREATEST(maxScore, VALUES(maxScore))`, [data, +data.score, data.percentage, data.maxScore]);
        // if (savedData.insertId == 0) return res.send({ error: 'Did not beat score' });
        // return res.send({ data: "score saved successfully", flag: false });
    }

    async getScores(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let id = auth.tourneyId;
        const qualsScores: any = await DatabaseService.query(
            `
        SELECT 
            p.userId as discordId, 
            p.forfeit, 
            q.score, 
            q.percentage, 
            pl.*, 
            u.* 
        FROM participants p
            LEFT JOIN users u ON u.discordId = p.userId
            LEFT JOIN qualifier_scores q ON p.userId = q.userId 
            LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId
            JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)
            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE 
            ts.show_quals = 1 AND
            p.tournamentId = ? AND 
            mp.live = 1 AND 
            mp.is_qualifiers AND 
            mp.tournamentId = ? AND 
            (q.tournamentId IS NULL OR q.tournamentId = ?)`,
            [id, id, id]
        );
        // WHERE ts.public = 1 AND ts.show_quals = 1 AND p.tournamentId = ?`, [id]);
        let scores = [];
        for (const score of qualsScores) {
            if (!score.discordId) continue;
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
        return res.send(scores);
    }

    // TA intergration
    async updateFlags(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        try {
            await QualifiersController.updateMaps(auth.tourneyId.toString());
            for (const song of req.body) {
                if (!song.flags) song.flags = 0;
                await DatabaseService.query(`UPDATE event_map_options SET flags = ?, playerOptions = ?, difficulty = ?, selCharacteristic = ? WHERE tournament_id = ? AND map_id = ?`, [song.flags, song.playerOptions, song.difficulty, song.selectedCharacteristic, auth.tourneyId, song.id]);
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    static async taScoreProto(score: Models.LeaderboardScore, tournamentId: string) {
        let settings: any = await DatabaseService.query(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId]);
        if (settings.length < 1) return;
        settings = settings[0];
        if (settings.state != "qualifiers") return;
        let user: any;
        if (score.user_id.includes("quest_")) {
            let tmpId = await DatabaseService.query(`SELECT * FROM quest_ids WHERE qId = ?`, [score.user_id.split("_")[1]]);
            user = await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.discordId = ? AND p.tournamentId = ?`, [tmpId[0].userId, tournamentId]);
        } else {
            user = await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.user_id, tournamentId]);
        }
        if (user.length < 1) return;
        user = user[0];
        let levelHash = score.parameters.beatmap.level_id.replace(`custom_level_`, "").toUpperCase();
        let map = (await DatabaseService.query(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId])) as any[];
        if (map.length < 1) return;
        // console.log(user);
        let curScore = await DatabaseService.query(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
        if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
        let attempt = 1;
        if (curScore[0] && curScore[0].attempt) attempt = curScore[0].attempt + 1;
        let qualScore = {
            tournamentId: tournamentId,
            userId: user.discordId,
            songHash: levelHash,
            score: score.score | 0,
            percentage: 0,
            maxScore: 0,
            attempt: attempt
        };
        // console.log(qualScore);
        try {
            await DatabaseService.query(
                `INSERT INTO qualifier_scores SET ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, VALUES(score)),
            percentage = GREATEST(percentage, VALUES(percentage)),
            maxScore = GREATEST(maxScore, VALUES(maxScore)),
            attempt = GREATEST(attempt, VALUES(attempt))`,
                [qualScore]
            );
        } catch (error) {
            console.error(error);
        }
    }

    static async taScore(score: Models.LeaderboardScore, tournamentId: string) {
        let settings: any = (await DatabaseService.query(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId])) as any[];
        if (settings.length < 1) return;
        settings = settings[0];
        if (settings.state != "qualifiers") return;
        let user: any;
        user = (await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.user_id, tournamentId])) as any[];
        if (user.length < 1) return;
        user = user[0];
        let levelHash = score.parameters.beatmap.level_id.replace(`custom_level_`, "").toUpperCase();
        let map = (await DatabaseService.query(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId])) as any[];
        if (map.length < 1) return;
        // console.log(user);
        let curScore = await DatabaseService.query(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
        if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
        let attempt = 1;
        if (curScore[0] && curScore[0].attempt) attempt = curScore[0].attempt + 1;
        let qualScore = {
            tournamentId: tournamentId,
            userId: user.discordId,
            songHash: levelHash,
            score: score.score | 0,
            percentage: 0,
            maxScore: 0,
            attempt: attempt
        };
        // console.log(qualScore);
        try {
            await DatabaseService.query(
                `INSERT INTO qualifier_scores SET ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, VALUES(score)),
            percentage = GREATEST(percentage, VALUES(percentage)),
            maxScore = GREATEST(maxScore, VALUES(maxScore)),
            attempt = GREATEST(attempt, VALUES(attempt))`,
                [qualScore]
            );
        } catch (error) {
            console.error(error);
        }
    }

    static async taLiveScore(score: Packets.Push.SongFinished, tournamentId: string) {
        let settings: settings[] | settings = await DatabaseService.query(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId]);
        console.log(settings);
        if (settings.length < 1) return;
        settings = settings[0];
        if (settings.state != "qualifiers") return;
        if (settings.quals_method != "live_quals") return;
        let user: any;
        user = await DatabaseService.query(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.player.user_id, tournamentId]);
        if (user.length < 1) return;
        user = user[0];
        let levelHash = score.beatmap.level_id.replace(`custom_level_`, "").toUpperCase();
        let map = (await DatabaseService.query(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId])) as any[];
        if (map.length < 1) return;
        // session check
        // let sessions: qualifierSession[] = await DatabaseService.query(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? GROUP BY qs.id`, [tournamentId]);
        let sessionsData: any = await DatabaseService.query(
            `SELECT qs.id, qs.time, qs.limit, qs.tournamentId, u.discordId, u.name, u.avatar FROM qual_sessions qs 
        LEFT JOIN session_assignment sa ON sa.sessionId = qs.id
        LEFT JOIN participants p ON p.id = sa.participantId 
        LEFT JOIN users u ON u.discordId = p.userId
        WHERE qs.tournamentId = ?`,
            [tournamentId]
        );
        let sessions: qualifierSession[] = [];
        for (let row of sessionsData) {
            let sIndex = sessions.findIndex(x => x.id == row.id);
            if (sIndex > -1 && row.discordId) {
                sessions[sIndex].users.push({
                    userId: row.discordId,
                    name: row.name,
                    avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
                });
                sessions[sIndex].allocated++;
            } else if (row.discordId) {
                sessions.push({
                    id: row.id,
                    time: row.time,
                    limit: row.limit,
                    tournamentId: row.tournamentId,
                    users: [
                        {
                            userId: row.discordId,
                            name: row.name,
                            avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
                        }
                    ],
                    allocated: 1
                });
            } else {
                sessions.push({
                    id: row.id,
                    time: row.time,
                    limit: row.limit,
                    tournamentId: row.tournamentId,
                    users: [],
                    allocated: 0
                });
            }
        }
        let curSession: qualifierSession = sessions.find(x => x.users?.find(y => y.userId == user.discordId));
        // user not in session
        if (!curSession) return;
        let now = new Date();
        let sessionTime = new Date(curSession.time);
        if (Math.abs(now.getTime() - sessionTime.getTime()) / 36e5 > 2) {
            console.log(now, sessionTime);
            return;
        }
        // console.log(user);
        let curScore = await DatabaseService.query(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
        if (curScore[0]) return;
        let attempt = 1;
        // if (score.Type == CompletionType.Failed) score.Score *= 2;
        let qualScore = {
            tournamentId: tournamentId,
            userId: user.discordId,
            songHash: levelHash,
            score: score.score | 0,
            percentage: 0,
            maxScore: 0,
            attempt: attempt
        };
        try {
            await DatabaseService.query(
                `INSERT INTO qualifier_scores SET ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, VALUES(score)),
            percentage = GREATEST(percentage, VALUES(percentage)),
            maxScore = GREATEST(maxScore, VALUES(maxScore)),
            attempt = GREATEST(attempt, VALUES(attempt))`,
                [qualScore]
            );
        } catch (error) {
            console.error(error);
        }
    }

    static async updateMaps(tournamentId: string) {
        let maps = (await DatabaseService.query(`SELECT pl.id FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE mp.is_qualifiers = 1 AND tournamentId = ?`, [tournamentId])) as any[];
        if (maps.length > 0) {
            await DatabaseService.query(`DELETE FROM event_map_options WHERE tournament_id = ?`, [tournamentId]);
            await DatabaseService.query(`INSERT INTO event_map_options (tournament_id, map_id) VALUES ?`, [maps.map(x => [tournamentId, x.id])]);
        }
    }

    static async createEvent(tournamentId) {
        let tournament = await DatabaseService.query(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
        let settings = await DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [tournamentId]);

        let songs = (await DatabaseService.query(
            `SELECT s.*, emo.* FROM pool_link s 
        JOIN map_pools mp ON mp.id = s.poolId 
        JOIN event_map_options emo ON emo.map_id = s.id 
        WHERE mp.tournamentId = ? AND mp.is_qualifiers = 1`,
            [tournamentId]
        )) as any[];
        let qualMaps = [];
        // console.log(songs);
        for (const song of songs) {
            let gm: Models.GameplayModifiers = Models.GameplayModifiers.fromObject({ options: song.flags });
            let map: Models.GameplayParameters = Models.GameplayParameters.fromObject({
                beatmap: {
                    name: song.songName,
                    level_id: `custom_level_${song.songHash.toUpperCase()}`,
                    characteristic: {
                        serialized_name: song.selCharacteristic,
                        difficulties: [song.difficulty]
                    },
                    difficulty: song.difficulty
                },
                player_settings: {
                    options: song.playerOptions
                },
                gameplay_modifiers: gm
            });
            qualMaps.push(map);
        }
        // console.log(qualMaps);
        TAController.createEvent(tournamentId, qualMaps, `${tournament[0].name} Qualifiers`, settings[0].ta_event_flags);
    }

    async getTAScores(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms) || !auth.tourneyId) return this.clientError(res);
        let tournamentId = auth.tourneyId;
        let songs = (await DatabaseService.query(
            `SELECT s.*, emo.* FROM pool_link s 
        JOIN map_pools mp ON mp.id = s.poolId 
        JOIN event_map_options emo ON emo.map_id = s.id 
        WHERE mp.tournamentId = ? AND mp.is_qualifiers = 1`,
            [tournamentId]
        )) as any[];
        let qualMaps = [];
        let i = 0;
        for (const song of songs) {
            let gm: Models.GameplayModifiers = Models.GameplayModifiers.fromObject({ options: song.flags });
            let map: Models.GameplayParameters = Models.GameplayParameters.fromObject({
                beatmap: {
                    name: song.songName,
                    level_id: `custom_level_${song.songHash.toUpperCase()}`,
                    characteristic: {
                        serialized_name: song.selCharacteristic,
                        difficulties: [song.difficulty]
                    },
                    difficulty: song.difficulty
                },
                player_settings: {
                    options: song.playerOptions
                },
                gameplay_modifiers: gm
            });
            // TAController.getScores(tournamentId, map);
            i++;
        }
        if (i > 0) {
            await DatabaseService.query(`DELETE FROM qualifier_scores WHERE tournamentId = ?`, [tournamentId]);
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

    static async updateEvent(tournamentId) {
        let tournament = await DatabaseService.query(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
        let settings = await DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [tournamentId]);

        let songs = (await DatabaseService.query(
            `SELECT s.*, emo.* FROM pool_link s 
        JOIN map_pools mp ON mp.id = s.poolId 
        JOIN event_map_options emo ON emo.map_id = s.id 
        WHERE mp.tournamentId = ? AND mp.is_qualifiers = 1`,
            [tournamentId]
        )) as any[];
        let qualMaps = [];

        for (const song of songs) {
            let gm: Models.GameplayModifiers = Models.GameplayModifiers.fromObject({ options: song.flags });
            let map: Models.GameplayParameters = Models.GameplayParameters.fromObject({
                beatmap: {
                    name: song.songName,
                    level_id: `custom_level_${song.songHash.toUpperCase()}`,
                    characteristic: {
                        serialized_name: song.selCharacteristic,
                        difficulties: [song.difficulty]
                    },
                    difficulty: song.difficulty
                },
                player_settings: {
                    options: song.playerOptions
                },
                gameplay_modifiers: gm
            });
            qualMaps.push(map);
        }
        TAController.updateEvent(tournamentId, qualMaps, `${tournament[0].name} Qualifiers`, settings[0].ta_event_flags);
    }

    static async getQualsScores(tourneyId: string) {
        const qualsScores: any = await DatabaseService.query(
            `SELECT p.userId as discordId, p.forfeit, q.score, q.percentage, pl.*, u.* FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN qualifier_scores q ON p.userId = q.userId 
        LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId
        LEFT JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND mp.is_qualifiers AND mp.tournamentId = ? AND (q.tournamentId IS NULL OR q.tournamentId = ?)`,
            [tourneyId, tourneyId, tourneyId]
        );
        // WHERE ts.public = 1 AND ts.show_quals = 1 AND p.tournamentId = ?`, [id]);
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

    async getSessions(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let settings = await this.getSettings(auth.tourneyId);
        // if (!settings.public) return this.clientError(res);
        let sessions: qualifierSession[] = await DatabaseService.query(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? GROUP BY qs.id`, [auth.tourneyId]);
        return res.send(sessions);
    }

    async addSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let data = req.body as qualifierSession[];
        try {
            for (const session of data) {
                delete session.allocated;
                session.time = new Date(session.time).toISOString().slice(0, 19).replace("T", " ");
                await DatabaseService.query(`INSERT INTO qual_sessions SET ?`, [session]);
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deleteSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let reqData = req.body as qualifierSession;
        console.log(req.params.id);
        try {
            await DatabaseService.query(`DELETE FROM qual_sessions WHERE id = ?`, [req.params.id]);
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
        let data = (await DatabaseService.query("SELECT * FROM participants WHERE tournamentId = ? AND userId = ?", [auth.tourneyId, auth.userId])) as any[];
        if (data.length < 1) return this.clientError(res, "Not signed up for tournament");
        let curSession: qualifierSession[] = await DatabaseService.query(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? && qs.id = ? GROUP BY qs.id`, [
            auth.tourneyId,
            req.body.sessionId
        ]);
        if (curSession[0].allocated >= curSession[0].limit) return this.clientError(res, "Session full");
        try {
            await DatabaseService.query(`DELETE sa FROM session_assignment sa INNER JOIN qual_sessions qs ON qs.id = sa.sessionId WHERE sa.participantId = ? AND qs.tournamentId = ?`, [data[0].id, auth.tourneyId]);
            await DatabaseService.query(`INSERT INTO session_assignment SET participantId = ?, sessionId = ?`, [data[0].id, req.body.sessionId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async userSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.userId) return this.clientError(res, "Not Logged in");
        if (!auth.tourneyId) return this.clientError(res, "Not tournament ID provided");
        let data = (await DatabaseService.query("SELECT * FROM participants WHERE tournamentId = ? AND userId = ?", [auth.tourneyId, auth.userId])) as any[];
        if (data.length < 1) return this.clientError(res, "Not signed up for tournament");
        let curSession: qualifierSession[] = await DatabaseService.query(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? && sa.participantId = ? GROUP BY qs.id`, [
            auth.tourneyId,
            data[0].id
        ]);
        return res.send(curSession[0]);
    }

    async sessions(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let sessionsData: any = await DatabaseService.query(
            `SELECT qs.id, qs.time, qs.limit, qs.tournamentId, u.discordId, u.name, u.avatar FROM qual_sessions qs 
        LEFT JOIN session_assignment sa ON sa.sessionId = qs.id
        LEFT JOIN participants p ON p.id = sa.participantId 
        LEFT JOIN users u ON u.discordId = p.userId
        WHERE qs.tournamentId = ?`,
            [auth.tourneyId]
        );
        let sessions: qualifierSession[] = [];
        for (let row of sessionsData) {
            let sIndex = sessions.findIndex(x => x.id == row.id);
            if (sIndex > -1 && row.discordId) {
                sessions[sIndex].users.push({
                    userId: row.discordId,
                    name: row.name,
                    avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
                });
                sessions[sIndex].allocated++;
            } else if (row.discordId) {
                sessions.push({
                    id: row.id,
                    time: row.time,
                    limit: row.limit,
                    tournamentId: row.tournamentId,
                    users: [
                        {
                            userId: row.discordId,
                            name: row.name,
                            avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null
                        }
                    ],
                    allocated: 1
                });
            } else {
                sessions.push({
                    id: row.id,
                    time: row.time,
                    limit: row.limit,
                    tournamentId: row.tournamentId,
                    users: [],
                    allocated: 0
                });
            }
        }
        return res.send(sessions);
    }
}
