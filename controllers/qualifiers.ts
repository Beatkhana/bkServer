import express from "express";
import { database } from "../database";
import { qualifierSession } from "../models/qualifiers";
import { GameplayModifiers, GameOptions } from "../models/taProto/gameplayModifiers";
import { GameplayParameters } from "../models/taProto/gameplayParameters";
import { SubmitScore } from "../models/taProto/submitScore";
import * as SubmitScoreWS from "../models/TA/submitScore";
import { qualsScore } from "../models/tournament.models";
import { authController } from "./auth.controller";
import { controller } from "./controller";
import { TAController } from "./ta.controller";

export class QualifiersController extends controller {

    // legacy method
    async saveScore(req: express.Request, res: express.Response) {
        // let auth = new authController(req);
        // let data: qualsScore = req.body;
        // if (!await auth.validApiKey) return this.unauthorized(res);
        // const tournamentSettings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId]);
        // if (tournamentSettings.length <= 0 || (tournamentSettings[0].state != 'qualifiers' && !!tournamentSettings[0].public)) return res.send({ error: 'invalid tournament settings' });
        // const userInfo: any = await this.db.asyncPreparedQuery("SELECT p.*, u.discordId FROM participants p LEFT JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?", [data.ssId, data.tournamentId]);
        // if (userInfo.length <= 0) return res.send({ error: "invalid user" });
        // delete data.ssId;
        // data.userId = userInfo[0].discordId;
        // const mapPool: any = await this.db.asyncPreparedQuery("SELECT pl.songHash FROM pool_link pl LEFT JOIN map_pools mp ON pl.poolId = mp.id WHERE mp.tournamentId = ? AND is_qualifiers = 1 AND live = 1", [data.tournamentId]);
        // // console.log(mapPool.some(x=> x.songHash == data.songHash));
        // if (!mapPool.some(x => x.songHash.toLowerCase() == data.songHash.toLowerCase())) return res.send({ error: "invalid song hash" });
        // data.percentage = +data.score / +data.totalScore;
        // if (data.percentage >= 1) return res.send({ error: "invalid score" });
        // data.maxScore = data.totalScore;
        // delete data.totalScore;
        // let savedData: any = await this.db.asyncPreparedQuery(`INSERT INTO qualifier_scores SET ?
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
        const qualsScores: any = await this.db.aQuery(`
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
            (q.tournamentId IS NULL OR q.tournamentId = ?)`, [id, id, id]);
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
                })
            } else {
                let curScore = []
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
                    ]
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
                    scores: curScore,
                }
                scores.push(temp);
            }
        }
        return res.send(scores);
    }

    // TA intergration
    async updateFlags(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        try {
            await QualifiersController.updateMaps(auth.tourneyId);
            for (const song of req.body) {
                if (!song.flags) song.flags = 0;
                await this.db.aQuery(`UPDATE event_map_options SET flags = ?, playerOptions = ?, difficulty = ?, selCharacteristic = ? WHERE tournament_id = ? AND map_id = ?`, [song.flags, song.playerOptions, song.difficulty, song.selectedCharacteristic, auth.tourneyId, song.id]);
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    static async taScoreProto(score: SubmitScore, tournamentId: string) {
        let db = new database();
        let settings: any = await db.aQuery(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId]);
        if (settings.length < 1) return;
        settings = settings[0];
        if (settings.state != 'qualifiers') return;
        let user: any;
        if (score.score.userId.includes('quest_')) {
            let tmpId = await db.aQuery(`SELECT * FROM quest_ids WHERE qId = ?`, [score.score.userId.split('_')[1]]);
            user = await db.aQuery(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.discordId = ? AND p.tournamentId = ?`, [tmpId[0].userId, tournamentId]);
        } else {
            user = await db.aQuery(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.score.userId, tournamentId]);
        }
        if (user.length < 1) return;
        user = user[0];
        let levelHash = score.score.parameters.beatmap.levelId.replace(`custom_level_`, "").toUpperCase();
        let map = await db.aQuery(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId]);
        if (map.length < 1) return;
        // console.log(user);
        let curScore = await db.aQuery(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
        if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
        let attempt = 1;
        if (curScore[0] && curScore[0].attempt) attempt = curScore[0].attempt + 1;
        let qualScore = {
            tournamentId: tournamentId,
            userId: user.discordId,
            songHash: levelHash,
            score: score.score.score | 0,
            percentage: 0,
            maxScore: 0,
            attempt: attempt
        }
        // console.log(qualScore);
        try {
            await db.aQuery(`INSERT INTO qualifier_scores SET ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, VALUES(score)),
            percentage = GREATEST(percentage, VALUES(percentage)),
            maxScore = GREATEST(maxScore, VALUES(maxScore)),
            attempt = GREATEST(attempt, VALUES(attempt))`, [qualScore]);
        } catch (error) {
            console.error(error);
        }
    }

    static async taScore(score: SubmitScoreWS.SubmitScore, tournamentId: string) {
        let db = new database();
        let settings: any = await db.aQuery(`SELECT * FROM tournament_settings WHERE tournamentId = ?`, [tournamentId]);
        if (settings.length < 1) return;
        settings = settings[0];
        if (settings.state != 'qualifiers') return;
        let user: any;
        user = await db.aQuery(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?`, [score.Score.UserId, tournamentId]);
        if (user.length < 1) return;
        user = user[0];
        let levelHash = score.Score.Parameters.Beatmap.LevelId.replace(`custom_level_`, "").toUpperCase();
        let map = await db.aQuery(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId]);
        if (map.length < 1) return;
        // console.log(user);
        let curScore = await db.aQuery(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
        if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
        let attempt = 1;
        if (curScore[0] && curScore[0].attempt) attempt = curScore[0].attempt + 1;
        let qualScore = {
            tournamentId: tournamentId,
            userId: user.discordId,
            songHash: levelHash,
            score: score.Score.Score | 0,
            percentage: 0,
            maxScore: 0,
            attempt: attempt
        }
        // console.log(qualScore);
        try {
            await db.aQuery(`INSERT INTO qualifier_scores SET ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, VALUES(score)),
            percentage = GREATEST(percentage, VALUES(percentage)),
            maxScore = GREATEST(maxScore, VALUES(maxScore)),
            attempt = GREATEST(attempt, VALUES(attempt))`, [qualScore]);
        } catch (error) {
            console.error(error);
        }
    }

    static async updateMaps(tournamentId: string) {
        let db = new database();
        let maps = await db.aQuery(`SELECT pl.id FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE mp.is_qualifiers = 1 AND tournamentId = ?`, [tournamentId]);
        if (maps.length > 0) {
            await db.aQuery(`DELETE FROM event_map_options WHERE tournament_id = ?`, [tournamentId]);
            await db.aQuery(`INSERT INTO event_map_options (tournament_id, map_id) VALUES ?`, [maps.map(x => [tournamentId, x.id])]);
        }
    }

    static async createEvent(tournamentId) {
        let db = new database();
        let tournament = await db.aQuery(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
        let settings = await db.aQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [tournamentId]);

        let songs = await db.aQuery(`SELECT s.*, emo.* FROM pool_link s 
        JOIN map_pools mp ON mp.id = s.poolId 
        JOIN event_map_options emo ON emo.map_id = s.id 
        WHERE mp.tournamentId = ? AND mp.is_qualifiers = 1`, [tournamentId]);
        let qualMaps = [];
        // console.log(songs);
        for (const song of songs) {
            let gm: GameplayModifiers = { options: song.flags };
            let map: GameplayParameters = {
                beatmap: {
                    name: song.songName,
                    levelId: `custom_level_${song.songHash.toUpperCase()}`,
                    characteristic: {
                        serializedName: song.selCharacteristic,
                        difficulties: [song.difficulty]
                    },
                    difficulty: song.difficulty,
                },
                playerSettings: {
                    options: song.playerOptions,
                },
                gameplayModifiers: gm,
            };
            qualMaps.push(map);
        }
        // console.log(qualMaps);
        TAController.createEvent(tournamentId, qualMaps, `${tournament[0].name} Qualifiers`, settings[0].ta_event_flags);
    }

    static async updateEvent(tournamentId) {
        let db = new database();
        let tournament = await db.aQuery(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
        let settings = await db.aQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [tournamentId]);

        let songs = await db.aQuery(`SELECT s.*, emo.* FROM pool_link s 
        JOIN map_pools mp ON mp.id = s.poolId 
        JOIN event_map_options emo ON emo.map_id = s.id 
        WHERE mp.tournamentId = ? AND mp.is_qualifiers = 1`, [tournamentId]);
        let qualMaps = [];

        for (const song of songs) {
            let gm: GameplayModifiers = { options: song.flags };
            let map: GameplayParameters = {
                beatmap: {
                    name: song.songName,
                    levelId: `custom_level_${song.songHash.toUpperCase()}`,
                    characteristic: {
                        serializedName: song.selCharacteristic,
                        difficulties: [song.difficulty]
                    },
                    difficulty: song.difficulty,
                },
                playerSettings: {
                    options: song.playerOptions,
                },
                gameplayModifiers: gm,
            };
            qualMaps.push(map);
        }
        TAController.updateEvent(tournamentId, qualMaps, `${tournament[0].name} Qualifiers`, settings[0].ta_event_flags);
    }

    static async getQualsScores(tourneyId: string) {
        let db = new database();
        const qualsScores: any = await db.asyncPreparedQuery(`SELECT p.userId as discordId, p.forfeit, q.score, q.percentage, pl.*, u.* FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN qualifier_scores q ON p.userId = q.userId 
        LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId
        LEFT JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND mp.is_qualifiers AND mp.tournamentId = ? AND (q.tournamentId IS NULL OR q.tournamentId = ?)`, [tourneyId, tourneyId, tourneyId]);
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
                })
            } else {
                let curScore = []
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
                    ]
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
                    scores: curScore,
                }
                scores.push(temp);
            }
        }
        return scores;
    }

    async getSessions(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let settings = await this.getSettings(auth.tourneyId);
        // if (!settings.public) return this.clientError(res);
        let sessions: qualifierSession[] = await this.db.aQuery(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? GROUP BY qs.id`, [auth.tourneyId]);
        return res.send(sessions);
    }

    async addSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        let data = req.body as qualifierSession[];
        try {
            for (const session of data) {
                delete session.allocated;
                session.time = new Date(session.time).toISOString().slice(0, 19).replace('T', ' ');
                await this.db.aQuery(`INSERT INTO qual_sessions SET ?`, [session]);
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deleteSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        let reqData = req.body as qualifierSession;
        console.log(req.params.id);
        try {
            await this.db.aQuery(`DELETE FROM qual_sessions WHERE id = ?`, [req.params.id]);
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
        let data = await this.db.aQuery('SELECT * FROM participants WHERE tournamentId = ? AND userId = ?', [auth.tourneyId, auth.userId]);
        if (data.length < 1) return this.clientError(res, "Not signed up for tournament");
        let curSession: qualifierSession[] = await this.db.aQuery(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? && qs.id = ? GROUP BY qs.id`, [auth.tourneyId, req.body.sessionId]);
        if (curSession[0].allocated >= curSession[0].limit) return this.clientError(res, "Session full");
        try {
            await this.db.aQuery(`DELETE FROM session_assignment WHERE participantId = ? AND sessionId = ?`, [data[0].id, req.body.sessionId]);
            await this.db.aQuery(`INSERT INTO session_assignment SET participantId = ?, sessionId = ?`, [data[0].id, req.body.sessionId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async userSession(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.userId) return this.clientError(res, "Not Logged in");
        if (!auth.tourneyId) return this.clientError(res, "Not tournament ID provided");
        let data = await this.db.aQuery('SELECT * FROM participants WHERE tournamentId = ? AND userId = ?', [auth.tourneyId, auth.userId]);
        if (data.length < 1) return this.clientError(res, "Not signed up for tournament");
        let curSession: qualifierSession[] = await this.db.aQuery(`SELECT qs.id, qs.time, qs.limit, COUNT(sa.id) as allocated FROM qual_sessions qs LEFT JOIN session_assignment sa ON sa.sessionId = qs.id WHERE qs.tournamentId = ? && sa.participantId = ? GROUP BY qs.id`, [auth.tourneyId, data[0].id]);
        return res.send(curSession[0]);
    }

    async sessions(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        let sessionsData: any = await this.db.aQuery(`SELECT qs.id, qs.time, qs.limit, qs.tournamentId, u.discordId, u.name, u.avatar FROM qual_sessions qs 
        LEFT JOIN session_assignment sa ON sa.sessionId = qs.id
        LEFT JOIN participants p ON p.id = sa.participantId 
        LEFT JOIN users u ON u.discordId = p.userId
        WHERE qs.tournamentId = ?`, [auth.tourneyId]);
        let sessions: qualifierSession[] = [];
        for (let row of sessionsData) {
            let sIndex = sessions.findIndex(x => x.id == row.id);
            if (sIndex > -1 && row.discordId) {
                sessions[sIndex].users.push({
                    userId: row.discordId,
                    name: row.name,
                    avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == 'a_' ? '.gif' : '.webp') : null
                });
                sessions[sIndex].allocated++;
            } else if (row.discordId) {
                sessions.push({
                    id: row.id,
                    time: row.time,
                    limit: row.limit,
                    tournamentId: row.tournamentId,
                    users: [{
                        userId: row.discordId,
                        name: row.name,
                        avatar: row.avatar ? `/${row.avatar}` + (row.avatar?.substring(0, 2) == 'a_' ? '.gif' : '.webp') : null
                    }],
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