import express from "express";
import sharp from "sharp";
import { staff } from "../models/tournament.models";
import { authController } from "./auth.controller";
import { controller } from "./controller";
// var newStaffRequestSchema = require('../schemas/newStaffRequest.json');

export class TournamentController extends controller {

    async getTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.tourneyId) return this.clientError(res, 'Not tournament Id provided');
        let user = await auth.getUser();
        let sqlWhere = "";
        let userRoles = "";
        switch (true) {
            case await auth.isAdmin || await auth.isStaff:
                sqlWhere = ``;
                break;
            case user != null:
                sqlWhere = `AND (ts.public = 1 OR owner = ? OR tra.role_id IS NOT NULL)`;
                userRoles = `LEFT JOIN tournament_role_assignment tra ON tra.tournament_id = t.id AND tra.user_id = ${user.discordId}`
                break;
            default:
                sqlWhere = `AND ts.public = 1`;
                break;
        }
        let tournament = await this.db.aQuery(`SELECT t.id as tournamentId,
        t.name,
        t.image,
        t.date as startDate,
        t.endDate,
        t.discord,
        t.twitchLink,
        t.prize,
        t.info,
        CAST(t.owner AS CHAR) as owner,
        t.archived,
        t.first,
        t.second,
        t.third,
        t.is_mini,
        ts.id as settingsId,
        ts.public_signups,
        ts.public,
        ts.state,
        ts.type,
        ts.has_bracket,
        ts.has_map_pool,
        ts.signup_comment,
        ts.comment_required,
        ts.show_signups,
        ts.bracket_sort_method,
        ts.bracket_limit,
        ts.quals_cutoff,
        ts.show_quals,
        ts.has_quals,
        ts.countries,
        ts.sort_method,
        ts.standard_cutoff,
        ts.ta_url
        FROM tournaments t
        LEFT JOIN tournament_settings ts ON ts.tournamentId = t.id  
        ${userRoles}
        WHERE t.id = ? ${sqlWhere}`, [auth.tourneyId, user?.discordId]);
        if (tournament.length == 0) return this.notFound(res, "Tournament Not Found");
        return res.send(tournament);
    }

    async createTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.isTournamentHost) return this.unauthorized(res);
        let data = req.body;
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let imgName = data.imgName;
        imgName = imgName.toLowerCase();
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
        let savePath = this.env == 'development' ? '../app/src/assets/images/' : '../public/assets/images/';

        let imgErr = false;

        if (!imgErr) {
            data.image = imgName;
            delete data.imgName;

            try {
                data.date = this.formatDate(data.date);
                data.endDate = this.formatDate(data.endDate);
            } catch (err) {
                return this.clientError(res, 'Invalid Date')
            }

            try {
                let result: any = await this.db.aQuery(`INSERT INTO tournaments SET ?`, [data]);
                const buf = Buffer.from(base64Img, 'base64');
                const webpData = await sharp(buf)
                    .resize({ width: 550 })
                    .webp({ lossless: true, quality: 50 })
                    .toBuffer();

                let hash = this.randHash(15);
                await sharp(webpData)
                    .toFile(savePath + `${result.insertId}_${hash}.webp`);

                await this.db.aQuery('UPDATE tournaments SET image = ? WHERE id = ?', [`${result.insertId}_${hash}.webp`, result.insertId]);
                await this.db.aQuery(`INSERT INTO tournament_settings SET tournamentId = ?`, [result.insertId]);
                return this.ok(res);
            } catch (error) {
                return this.fail(res, error);   
            }
        }
    }

    async deleteTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.isAdmin) return this.unauthorized(res);
        if (!auth.tourneyId) return this.clientError(res, "No tournament Id provided");
        try {
            await this.db.aQuery(`DELETE FROM tournaments WHERE id = ?`, [auth.tourneyId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async updateTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms || await auth.tournamentAdmin) return this.unauthorized(res);
        let data = { "tournament": req.body, "id": auth.tourneyId };
        let imgName: string = data.tournament.image;

        if (this.isBase64(data.tournament.image)) {

            let base64String = data.tournament.image;
            let base64Img = base64String.split(';base64,').pop();

            imgName = data.tournament.imgName;
            imgName = imgName.toLowerCase();
            imgName = imgName.replace(/\s/g, "");
            imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
            let savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/../public/assets/images/';

            // sharp
            const buf = await Buffer.from(base64Img, 'base64');
            const webpData = await sharp(buf)
                .resize({ width: 550 })
                .webp({ lossless: true, quality: 50 })
                .toBuffer()
            let hash = this.randHash(15);
            await sharp(webpData)
                .toFile(savePath + `${data.id}_${hash}.webp`);
            data.tournament.image = `${data.id}_${hash}.webp`;
        }

        delete data.tournament.imgName;
        data.tournament.date = this.formatDate(data.tournament.date);
        data.tournament.endDate = this.formatDate(data.tournament.endDate);

        try {
            await this.db.aQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', data.id]);
            return res.send({data: data.tournament});
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async updateSettings(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms || await auth.tournamentAdmin) return this.unauthorized(res);
        let data = req.body;
        let curSettings: any = await this.db.aQuery("SELECT * FROM tournament_settings WHERE id = ?", [data.settingsId]);
        if (data.settings.state == 'main_stage' && curSettings[0].state == "qualifiers") {
            let seeding: any = await this.seedPlayersByQuals(data.tournamentId, data.settings.quals_cutoff);
            if (!seeding) {
                return this.fail(res, "Error Creating Seeds");
            }
        } else if (data.settings.state == 'main_stage' && curSettings[0].state == "awaiting_start") {
            if (data.settings.type == 'battle_royale') {
                let seeding: any = await this.seedPlayers(data.tournamentId, data.settings.standard_cutoff, 'date');
                if (!seeding) {
                    return this.fail(res, "Error Creating Seeds");
                }
            }
        }
        try {
            let result = await this.db.aQuery(`UPDATE tournament_settings SET ? WHERE ?? = ?`, [data.settings, 'id', data.settingsId]);
            return res.send({data:result});
        } catch (error) {
            return this.fail(res, error);
        }
    }

    // non quals seed
     private async seedPlayers(tournamentId: string, cutoff, method: string) {
        if (method == 'date') {
            let updateErr = false;
            let participants: any = await this.allParticipants(tournamentId);
            participants.sort((a, b) => a.participantId - b.participantId);
            let qualified = participants.slice(0, cutoff + 1);
            for (const user of participants) {
                await this.db.asyncPreparedQuery("UPDATE participants SET seed = 0, position = 0 WHERE userId = ? AND tournamentId = ?", [user.userId, tournamentId])
                    .catch(err => {
                        console.error(err);
                        updateErr = true;
                    });
            }
            console.log(qualified.entries());
            for (let i = 0; i < qualified.length; i++) {
                const user = qualified[i];
                console.log(i, user.userId, tournamentId)
                await this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE userId = ? AND tournamentId = ?", [i, user.userId, tournamentId])
                    .catch(err => {
                        console.error(err);
                        updateErr = true;
                    });
            }
            return !updateErr;
        }
    }

    // quals seed
    async seedPlayersByQuals(tournamentId: string, cutoff) {
        const pools: any = await this.getMapPools(tournamentId);
        let qualsPool: any = Object.values(pools).find((x: any) => x.is_qualifiers == 1);
        let qualsScores = await this.getQualsScores(tournamentId);
        console.log(qualsScores);
        for (const user of qualsScores) {
            for (const score of user.scores) {
                if (qualsPool.songs.find(x => x.hash == score.songHash).numNotes != 0) {
                    score.percentage = score.score / (qualsPool.songs.find(x => x.hash == score.songHash).numNotes * 920 - 7245)
                } else {
                    score.percentage = 0;
                }
                score.score = Math.round(score.score / 2);
            }
        }
        qualsScores.sort((a, b) => {
            let sumA = this.sumProperty(a.scores, 'score');
            let sumB = this.sumProperty(b.scores, 'score');
            let sumAPer = this.sumProperty(a.scores, 'percentage');
            let sumBPer = this.sumProperty(b.scores, 'percentage');
            a.avgPercentage = isNaN(sumAPer / qualsPool.songs.length * 100) ? 0 : (sumAPer / qualsPool.songs.length * 100).toFixed(2);
            b.avgPercentage = isNaN(sumBPer / qualsPool.songs.length * 100) ? 0 : (sumBPer / qualsPool.songs.length * 100).toFixed(2);
            a.scoreSum = sumA;
            b.scoreSum = sumB;
            if (a.forfeit == 1) return 1;
            if (b.forfeit == 2) return -1;
            if (b.avgPercentage == a.avgPercentage) {
                if (sumB == sumA) {
                    if (a.globalRank == 0) return 1;
                    if (b.globalRank == 0) return -1;
                    return a.globalRank - b.globalRank;
                } else {
                    return sumB - sumA;
                }
            } else {
                return b.avgPercentage - a.avgPercentage;
            }
        });
        for (const user of qualsScores) {
            await this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE userId = ? AND tournamentId = ?", [user.discordId, tournamentId])
                .catch(err => {
                    console.error(err);
                    updateErr = true;
                });
        }
        let users = [];
        for (let i = 0; i < cutoff; i++) {
            const user = qualsScores[i];
            // user.seed = i;
            let temp = {
                discordId: user.discordId,
                seed: i + 1
            };
            users.push(temp);
        }
        let updateErr = false;
        for (const user of users) {
            await this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE userId = ? AND tournamentId = ?", [user.seed, user.discordId, tournamentId])
                .catch(err => {
                    console.error(err);
                    updateErr = true;
                });
        }
        return !updateErr;

    }

    async allParticipants(id) {
        let result = await this.db.aQuery(`SELECT p.id AS participantId,
        CAST(p.userId AS CHAR) as userId,
        p.forfeit,
        p.seed,
        p.position,
        p.comment,
        CAST(\`u\`.\`discordId\` AS CHAR) as discordId,
        CAST(\`u\`.\`ssId\` AS CHAR) as ssId,
        \`u\`.\`name\`,
        \`u\`.\`twitchName\`,
        \`u\`.\`avatar\`,
        \`u\`.\`globalRank\`,
        \`u\`.\`localRank\`,
        \`u\`.\`country\`,
        \`u\`.\`tourneyRank\`,
        \`u\`.\`TR\`,
        \`u\`.\`pronoun\`
        FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE p.tournamentId = ?`, [id]);
        return result;
    }

    // to move to map pool controller when made
    async getMapPools(tournamentId: string, isAuth: boolean = false) {
        let sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?`;
        if (isAuth) {
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
        }
        const poolsRes: any = await this.db.asyncPreparedQuery(sql, [tournamentId]);
        let mapPools = {};
        for (const song of poolsRes) {
            if (song.poolId in mapPools) {
                mapPools[song.poolId].songs.push(
                    {
                        id: song.songId,
                        hash: song.songHash,
                        name: song.songName,
                        songAuthor: song.songAuthor,
                        levelAuthor: song.levelAuthor,
                        diff: song.songDiff,
                        key: song.key,
                        ssLink: song.ssLink,
                        numNotes: song.numNotes
                    });
            } else {
                let songs = []
                if (song.songId != null) {
                    songs = [
                        {
                            id: song.songId,
                            hash: song.songHash,
                            name: song.songName,
                            songAuthor: song.songAuthor,
                            levelAuthor: song.levelAuthor,
                            diff: song.songDiff,
                            key: song.key,
                            ssLink: song.ssLink,
                            numNotes: song.numNotes
                        }
                    ]
                }
                mapPools[song.poolId] = {
                    id: song.poolId,
                    tournamentId: song.tournamentId,
                    poolName: song.poolName,
                    image: song.image,
                    description: song.description,
                    live: !!+song.live,
                    is_qualifiers: song.is_qualifiers,
                    songs: songs
                }
            }
        }
        return mapPools;
    }

    // to move to quals controller when done
    async getQualsScores(id: string) {
        const qualsScores: any = await this.db.asyncPreparedQuery(`SELECT p.userId as discordId, p.forfeit, q.score, q.percentage, pl.*, u.* FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN qualifier_scores q ON p.userId = q.userId 
        LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId
        LEFT JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND mp.is_qualifiers AND mp.tournamentId = ? AND (q.tournamentId IS NULL OR q.tournamentId = ?)`, [id, id, id]);
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

    async isSignedUp(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let user = await auth.getUser()
        if (!user) return this.clientError(res, "Not logged in");
        let tournamentId = req.params.tourneyId;
        if (!tournamentId) return this.clientError(res, "Not tournament ID provided");
        let data = await this.db.aQuery('SELECT * FROM participants WHERE tournamentId = ? AND userId = ?', [tournamentId, user.discordId]);
        if (data.length == 1) return res.send({ signedUp: true });
        if (data.length !== 1) return res.send({ signedUp: false });
    }

    // tournament role assignment
    async getStaff(req: express.Request, res: express.Response) {
        let data = await this.db.aQuery(`SELECT 
            u.discordId, 
            u.ssId, 
            u.name, 
            u.twitchName, 
            u.avatar, 
            u.globalRank, 
            u.localRank, 
            u.country, 
            u.tourneyRank, 
            u.TR, 
            u.pronoun,
            tr.role_name,
            tr.id as role_id
        FROM users u
        JOIN tournament_role_assignment tra ON tra.user_id = u.discordId AND tra.tournament_id = ?
        JOIN tournament_roles tr ON tr.id = tra.role_id`, [req.params.tourneyId]);
        let users: staff[] = [];
        for (const user of data) {
            let existingUser = users.find(x => x.discordId == user.discordId)
            if (existingUser) {
                existingUser.roles.push({ id: user.role_id, role: user.role_name })
            } else {
                users.push({
                    discordId: user.discordId,
                    ssId: user.ssId,
                    name: user.name,
                    twitchName: user.twitchName,
                    avatar: user.avatar,
                    globalRank: user.globalRank,
                    localRank: user.locaRank,
                    country: user.country,
                    tourneyRank: user.tourneyRank,
                    TR: user.TR,
                    pronoun: user.pronoun,
                    roles: [{
                        id: user.role_id,
                        role: user.role_name
                    }]
                });
            }
        }
        return res.send(users);
    }

    async addStaff(req?: express.Request, res?: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        if (!req.params.tourneyId) return this.clientError(res, "No tournament id provided");
        if (!req.body.users) return this.clientError(res, "No users provided");
        let insertData = [];
        for (const user of req.body.users) {
            let curUser = user.roleIds.map(x => [user.userId, x, req.params.tourneyId]);
            insertData = [...insertData, ...curUser]
        }
        try {
            await this.db.aQuery(`DELETE FROM tournament_role_assignment WHERE tournament_id = ?`, [req.params.tourneyId]);
            await this.db.aQuery(`INSERT INTO tournament_role_assignment (user_id, role_id, tournament_id) VALUES ?`, [insertData]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

}