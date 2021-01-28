import express from "express";
import { database } from "../database";
import { GameplayModifiers, GameOptions } from "../models/TA/gameplayModifiers";
import { GameplayParameters } from "../models/TA/gameplayParameters";
import { SubmitScore } from "../models/TA/submitScore";
import { qualsScore } from "../models/tournament.models";
import { authController } from "./auth.controller";
import { controller } from "./controller";
import { TAController } from "./ta.controller";

export class QualifiersController extends controller {

    // legacy method
    async saveScore(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let data: qualsScore = req.body;
        if (!await auth.validApiKey) return this.unauthorized(res);
        const tournamentSettings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId]);
        if (tournamentSettings.length <= 0 || (tournamentSettings[0].state != 'qualifiers' && !!tournamentSettings[0].public)) return res.send({ error: 'invalid tournament settings' });
        const userInfo: any = await this.db.asyncPreparedQuery("SELECT p.*, u.discordId FROM participants p LEFT JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?", [data.ssId, data.tournamentId]);
        if (userInfo.length <= 0) return res.send({ error: "invalid user" });
        delete data.ssId;
        data.userId = userInfo[0].discordId;
        const mapPool: any = await this.db.asyncPreparedQuery("SELECT pl.songHash FROM pool_link pl LEFT JOIN map_pools mp ON pl.poolId = mp.id WHERE mp.tournamentId = ? AND is_qualifiers = 1 AND live = 1", [data.tournamentId]);
        // console.log(mapPool.some(x=> x.songHash == data.songHash));
        if (!mapPool.some(x => x.songHash.toLowerCase() == data.songHash.toLowerCase())) return res.send({ error: "invalid song hash" });
        data.percentage = +data.score / +data.totalScore;
        if (data.percentage >= 1) return res.send({ error: "invalid score" });
        data.maxScore = data.totalScore;
        delete data.totalScore;
        let savedData: any = await this.db.asyncPreparedQuery(`INSERT INTO qualifier_scores SET ?
        ON DUPLICATE KEY UPDATE
        score = GREATEST(score, VALUES(score)),
        percentage = GREATEST(percentage, VALUES(percentage)),
        maxScore = GREATEST(maxScore, VALUES(maxScore))`, [data, +data.score, data.percentage, data.maxScore]);
        if (savedData.insertId == 0) return res.send({ error: 'Did not beat score' });
        return res.send({ data: "score saved successfully", flag: false });
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
            for (const song of req.body) {
                if (!song.flags) song.flags = 0;
                await this.db.aQuery(`UPDATE event_map_options SET flags = ?, playerOptions = ?, difficulty = ?, selCharacteristic = ? WHERE tournament_id = ? AND map_id = ?`, [song.flags, song.playerOptions, song.difficulty, song.selectedCharacteristic, auth.tourneyId, song.id]);
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    static async taScore(score: SubmitScore, tournamentId: string) {
        let db = new database();
        let settings: any = await db.aQuery(`SELECT * FROM settings WHERE tournamentId = ?`, [tournamentId]);
        if (settings.length < 1) return;
        settings = settings[0];
        if (settings.state !='qualifiers') return;
        let user: any = await db.aQuery(`SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ?`, [score.Score.UserId]);
        if (user.length < 1) return;
        user = user[0];
        let levelHash = score.Score.Parameters.Beatmap.LevelId.replace(`custom_level_`, "");
        let map = await db.aQuery(`SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?`, [levelHash, tournamentId]);
        if (map.length < 1) return;
        // console.log(user);
        let curScore = await db.aQuery(`SELECT * FROM qualifier_scores WHERE tournamentId = ? AND userId = ? AND songHash = ?`, [tournamentId, user.discordId, levelHash]);
        if (curScore[0] && curScore[0].attempt >= settings.qual_attempts && settings.qual_attempts != 0) return;
        let qualScore = {
            tournamentId: tournamentId,
            userId: user.discordId,
            songHash: levelHash,
            score: score.Score._Score,
            percentage: 0,
            maxScore: 0
        }
        // console.log(qualScore);
        try {
            await db.aQuery(`INSERT INTO qualifier_scores SET ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, VALUES(score)),
            percentage = GREATEST(percentage, VALUES(percentage)),
            maxScore = GREATEST(maxScore, VALUES(maxScore))`, [qualScore]);
        } catch (error) {
            console.error(error);
        }
    }

    static async updateMaps(tournamentId: string) {
        let db = new database();
        let maps = db.aQuery(`SELECT pl.id FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE mp.is_qualifiers = 1 AND tournamentId = ?`, [tournamentId]);
        if ((await maps).length > -1) {
            await db.aQuery(`DELETE FROM event_map_options WHERE tournament_id = ?`, [tournamentId]);
            await db.aQuery(`INSERT INTO event_map_options (tournament_id, map_id) VALUES ?`, [(await maps).map(x => [tournamentId, x.id])]);
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

        for (const song of songs) {
            let gm: GameplayModifiers = { Options: song.flags };
            let map: GameplayParameters = {
                Beatmap: {
                    Name: song.songName,
                    LevelId: `custom_level_${song.songHash.toUpperCase()}`,
                    Characteristic: {
                        SerializedName: song.selCharacteristic,
                        Difficulties: [song.difficulty]
                    },
                    Difficulty: song.difficulty,
                },
                PlayerSettings: {
                    Options: song.playerOptions,
                },
                GameplayModifiers: gm,
            };
            qualMaps.push(map);
        }
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
            let gm: GameplayModifiers = { Options: song.flags };
            let map: GameplayParameters = {
                Beatmap: {
                    Name: song.songName,
                    LevelId: `custom_level_${song.songHash.toUpperCase()}`,
                    Characteristic: {
                        SerializedName: song.selCharacteristic,
                        Difficulties: [song.difficulty]
                    },
                    Difficulty: song.difficulty,
                },
                PlayerSettings: {
                    Options: song.playerOptions,
                },
                GameplayModifiers: gm,
            };
            qualMaps.push(map);
        }
        TAController.updateEvent(tournamentId, qualMaps, `${tournament[0].name} Qualifiers`, settings[0].ta_event_flags);
    }

}