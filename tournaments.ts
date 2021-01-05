import { database } from './database';
import mysql from 'mysql';
// import fs from 'fs';
// import jimp from 'jimp';
import sharp from 'sharp';
const AWS = require('aws-sdk');

import * as rp from 'request-promise';
import cheerio from 'cheerio';
import { bslMatch, match, qualScore, qualsScore, removeParticipant, tournamentSettings, tournamentUpdate, updateParticipant } from './models/tournament.models';
import { Observable, throwError } from 'rxjs';

const ID = 'AKIAJNEXL3RYO3HDJ5EA';
const SECRET = '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';
const BUCKET_NAME = 'beatkhanas3';
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});
const fs = require('fs');

export class tournaments {
    db = new database();
    env = process.env.NODE_ENV || 'production';
    constructor() {
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }

    getAll(callback: Function) {
        var data: any = [];

        const result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\` as startDate, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments", (err, result: any) => {
            return callback(result);
        });
    }

    getActive(callback: Function, userId = 0) {
        let sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = `AND (ts.public = 1 OR owner = ?)`;
                break;
            case userId < 0:
                sqlWhere = ``;
                break;
            case userId == 0:
                sqlWhere = `AND ts.public = 1`;
                break;
        }
        const result = this.db.preparedQuery(`SELECT \`tournaments\`.\`id\` as tournamentId,
        \`tournaments\`.\`name\`,
        \`tournaments\`.\`image\`,
        \`tournaments\`.\`date\` as startDate,
        \`tournaments\`.\`endDate\`,
        \`tournaments\`.\`discord\`,
        \`tournaments\`.\`twitchLink\`,
        \`tournaments\`.\`prize\`,
        \`tournaments\`.\`info\`,
        CAST(\`tournaments\`.\`owner\` AS CHAR) as owner,
        \`tournaments\`.\`archived\`,
        \`tournaments\`.\`first\`,
        \`tournaments\`.\`second\`,
        \`tournaments\`.\`third\`,
        ts.public
        FROM tournaments 
        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id 
        WHERE archived = 0 AND tournaments.is_mini = 0 ${sqlWhere}`, [userId], (err, result: any) => {
            return callback(result);
        });
    }

    getActiveMini(callback: Function, userId = 0) {
        let sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = `AND (ts.public = 1 OR owner = ?)`;
                break;
            case userId < 0:
                sqlWhere = ``;
                break;
            case userId == 0:
                sqlWhere = `AND ts.public = 1`;
                break;
        }
        const result = this.db.preparedQuery(`SELECT \`tournaments\`.\`id\` as tournamentId,
        \`tournaments\`.\`name\`,
        \`tournaments\`.\`image\`,
        \`tournaments\`.\`date\` as startDate,
        \`tournaments\`.\`endDate\`,
        \`tournaments\`.\`discord\`,
        \`tournaments\`.\`twitchLink\`,
        \`tournaments\`.\`prize\`,
        \`tournaments\`.\`info\`,
        CAST(\`tournaments\`.\`owner\` AS CHAR) as owner,
        \`tournaments\`.\`archived\`,
        \`tournaments\`.\`first\`,
        \`tournaments\`.\`second\`,
        \`tournaments\`.\`third\`,
        ts.public
        FROM tournaments 
        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id 
        WHERE archived = 0 AND tournaments.is_mini = 1 ${sqlWhere}`, [userId], (err, result: any) => {
            return callback(result);
        });
    }

    getArchived(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id as tournamentId, name, image, \`date\` as startDate, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1 ORDER BY endDate DESC", (err, result: any) => {
            return callback(result);
        });
    }

    getTournament(id: string, callback: Function, userId = 0) {
        let sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = `AND (ts.public = 1 OR owner = ?)`;
                break;
            case userId < 0:
                sqlWhere = ``;
                break;
            case userId == 0:
                sqlWhere = `AND ts.public = 1`;
                break;
        }
        const result = this.db.preparedQuery(`SELECT \`tournaments\`.\`id\` as tournamentId,
        \`tournaments\`.\`name\`,
        \`tournaments\`.\`image\`,
        \`tournaments\`.\`date\` as startDate,
        \`tournaments\`.\`endDate\`,
        \`tournaments\`.\`discord\`,
        \`tournaments\`.\`twitchLink\`,
        \`tournaments\`.\`prize\`,
        \`tournaments\`.\`info\`,
        CAST(\`tournaments\`.\`owner\` AS CHAR) as owner,
        \`tournaments\`.\`archived\`,
        \`tournaments\`.\`first\`,
        \`tournaments\`.\`second\`,
        \`tournaments\`.\`third\`,
        \`tournaments\`.\`is_mini\`,
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
        FROM tournaments 
        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id 
        WHERE tournaments.id = ? ${sqlWhere}`, [id, userId], (err, result: any) => {
            return callback(result);
        });
    }

    async participants(id, isAuth = false, userId?: string) {
        const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        let battleRoyale = settings[0].state == 'main_stage' && settings[0].type == 'battle_royale';
        const result = await this.db.asyncPreparedQuery(`SELECT p.id AS participantId,
        CAST(p.userId AS CHAR) as userId,
        p.forfeit,
        p.seed,
        p.position,
        ${isAuth ? 'p.comment,' : ''}
        ${userId != null ? 'IF(p.userId = "' + userId + '", p.comment, null) as comment,' : ''}
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
        WHERE p.tournamentId = ? ${!battleRoyale ? '' : 'AND p.seed != 0'} ${isAuth ? '' : 'AND ts.show_signups = 1'}`, [id]);
        return result;
    }

    async allParticipants(id) {
        const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        const result = await this.db.asyncPreparedQuery(`SELECT p.id AS participantId,
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

    updateParticipant(data: updateParticipant, auth = false, callback: Function) {
        let sql = "UPDATE participants SET comment = ? WHERE tournamentId = ? AND userId = ?";
        let params = [data.comment, data.tournamentId, data.discordId];
        if (auth) {
            params = [data.comment, data.participantId];
            sql = "UPDATE participants SET comment = ? WHERE id = ?";
        }
        const result = this.db.preparedQuery(sql, params, (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    }

    removeParticipant(data: removeParticipant, callback: Function) {
        const result = this.db.preparedQuery("DELETE FROM participants WHERE id = ?", [data.participantId], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    }

    async elimParticipant(participantId: string, tournamentId: string) {
        const settings = await this.getSettings(tournamentId);
        const curParticipants: any = await this.participants(tournamentId, true);
        if (settings[0].type == 'battle_royale') {
            let minpos = Math.min.apply(null, curParticipants.map(x => x.position).filter(Boolean));
            let nextPos = settings[0].quals_cutoff;
            if (minpos != Infinity) nextPos = minpos - 1;

            try {
                const result: any = await this.db.asyncPreparedQuery("UPDATE participants SET position = ? WHERE id = ?", [nextPos, participantId]);
                return {
                    data: result,
                    flag: false
                }
            } catch (error) {
                return {
                    err: error,
                    flag: true
                }
            }

        }
    }

    async save(data: any, callback: Function) {
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let imgName = data.imgName;
        imgName = imgName.toLowerCase();
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
        // imgName = 
        let savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/public/assets/images/';

        let imgErr = false;

        if (!imgErr) {
            data.image = imgName;
            delete data.imgName;

            try {
                data.date = this.formatDate2(data.date);
                data.endDate = this.formatDate2(data.endDate);
            } catch (err) {
                return callback({
                    flag: true,
                    err: err
                });
            }

            const result = this.db.preparedQuery(`INSERT INTO tournaments SET ?`, [data], async (err, result: any) => {
                let flag = false;
                if (err) flag = true;
                if (!err) {
                    const buf = await Buffer.from(base64Img, 'base64');
                    const webpData = await sharp(buf)
                        .resize({ width: 550 })
                        .webp({ lossless: true, quality: 50 })
                        .toBuffer()

                    // console.debug(savePath+data.id+'.webp');
                    let hash = this.randHash(15);
                    await sharp(webpData)
                        .toFile(savePath + `${result.insertId}_${hash}.webp`);
                    await this.db.aQuery('UPDATE tournaments SET image = ? WHERE id = ?', [`${result.insertId}_${hash}.webp`, result.insertId]);
                    this.db.preparedQuery('INSERT INTO tournament_settings SET tournamentId = ?', [result.insertId], (err, result2: any) => {
                        let flag = false;
                        if (err) flag = true;
                        return callback({
                            data: result,
                            flag: flag,
                            err: err
                        });
                    });
                } else {
                    return callback({
                        data: result,
                        flag: flag,
                        err: err
                    });
                }
            });
        }

    }

    delete(id: number, callback: Function) {
        const result = this.db.preparedQuery(`DELETE FROM tournaments WHERE id = ?`, [id], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    }

    async update(data: tournamentUpdate, callback: Function) {
        let imgErr = false;
        let imgName: string = data.tournament.image;

        if (this.isBase64(data.tournament.image)) {

            let base64String = data.tournament.image;
            let base64Img = base64String.split(';base64,').pop();

            imgName = data.tournament.imgName;
            imgName = imgName.toLowerCase();
            imgName = imgName.replace(/\s/g, "");
            imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
            let savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/public/assets/images/';
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

        if (!imgErr) {
            delete data.tournament.imgName;
            try {
                data.tournament.date = this.formatDate2(data.tournament.date);
                data.tournament.endDate = this.formatDate2(data.tournament.endDate);
            } catch (err) {
                return callback({
                    flag: true,
                    err: err
                });
            }

            const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', data.id], (err, result: any) => {
                let flag = false;
                if (err) flag = true;
                return callback({
                    data: data.tournament,
                    flag: flag,
                    err: err
                });
            });
        }
    }

    async updateSettings(data: any, callback: Function) {
        const curSettings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE id = ?", [data.settingsId]);
        if (data.settings.state == 'main_stage' && curSettings[0].state == "qualifiers") {
            let seeding: any = await this.seedPlayersByQuals(data.tournamentId, data.settings.quals_cutoff);
            if (!seeding) {
                return callback({
                    err: 'error creating seeds',
                    flag: true
                })
            }
        } else if (data.settings.state == 'main_stage' && curSettings[0].state == "awaiting_start") {
            if (data.settings.type == 'battle_royale') {
                let seeding: any = await this.seedPlayers(data.tournamentId, data.settings.standard_cutoff, 'date');
                if (!seeding) {
                    return callback({
                        err: 'error creating seeds',
                        flag: true
                    })
                }
            }
        }
        const result = this.db.preparedQuery(`UPDATE tournament_settings SET ? WHERE ?? = ?`, [data.settings, 'id', data.settingsId], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
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

    async signUp(data: any, callback: Function) {
        this.db.preparedQuery(`SELECT public_signups FROM tournament_settings WHERE tournamentId = ?`, [data.tournamentId], async (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId]);
            let countries = null;
            if (settings[0].countries != '') countries = settings[0].countries.toLowerCase().replace(' ', '').split(',');
            const user: any = await this.db.asyncPreparedQuery(`SELECT * FROM users WHERE discordId = ?`, [data.userId])
            if (countries != null && !countries.includes(user[0].country.toLowerCase())) {
                callback(401);
                return null;
            }
            if (result[0].public_signups = 1) {
                const result = this.db.preparedQuery(`INSERT INTO participants SET ?`, [data], (err, result: any) => {
                    let flag = false;
                    if (err) flag = true;
                    return callback({
                        data: result,
                        flag: flag,
                        err: err
                    });
                });
            } else {
                return callback({
                    data: result,
                    flag: true,
                    err: err
                });
            }
        });
    }

    archive(data: any, callback: Function) {
        try {
            data.tournament = {
                first: data.first,
                second: data.second,
                third: data.third,
                archived: 1
            };
        } catch (err) {
            return callback({
                flag: true,
                err: err
            });
        }
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', data.id], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    }

    isOwner(userId, tournamentId, callback: Function) {
        const result = this.db.query(`SELECT CAST(owner AS CHAR) as owner FROM tournaments WHERE id = ${tournamentId}`, (err, result: any) => {
            if (!err && result[0].owner == userId) {
                return callback(true);
            } else {
                return callback(false);
            }
        });
    }

    events(callback: Function, isAuth = false) {
        const result = this.db.query(`SELECT tournaments.id as tournamentId, tournaments.name, tournaments.date as startDate, tournaments.endDate FROM tournaments LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id WHERE (ts.public = ${+!isAuth} OR ts.public = 1) ORDER BY date`, (err, result: any) => {
            return callback(result);
        });
    }

    // Map Pools
    addPool(data: any, callback: Function) {
        this.db.preparedQuery(`INSERT INTO map_pools SET ?`, [data], (err, result) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        })
    }

    updatePool(data: any, callback: Function) {
        let poolId = data.poolId;
        delete data.poolId;
        this.db.preparedQuery(`UPDATE map_pools SET ? WHERE id = ?`, [data, poolId], (err, result) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        })
    }

    async getMapPools(tournamentId: string, isAuth: boolean = false) {
        let sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?`;
        if (isAuth) {
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
        }
        const poolsRes: any = await this.db.asyncPreparedQuery(sql, [tournamentId]);
        let mapPools = {};
        // console.log(result)
        // if (poolsRes == undefined) return callback({});
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

    async downloadPool(id: string, auth: boolean) {
        let pool: any = await this.db.asyncPreparedQuery(`SELECT map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, pool_link.songHash FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE (map_pools.live = ? OR map_pools.live = 1) AND map_pools.id = ?`, [+auth, id]);
        let tournamentName = await this.db.asyncPreparedQuery(`SELECT name FROM tournaments WHERE id = ?`, [pool[0].tournamentId]);
        let curSongs = pool.map(e => { return { hash: e.songHash } });
        let playlist = {
            playlistTitle: `${tournamentName[0].name}_${pool[0].poolName}`,
            playlistAuthor: 'BeatKhana!',
            playlistDescription: pool[0].description,
            image: pool[0].image,
            songs: curSongs
        }

        return playlist;
    }

    addSong(data: any, callback: Function) {
        // console.log(data);
        rp.get(data.ssLink)
            .then(html => {
                let hash: string = cheerio('.box.has-shadow > b', html).text();
                let diff: string = cheerio('li.is-active > a > span', html).text();
                let diffSearch = diff.toLowerCase();
                if (diffSearch == 'expert+') diffSearch = 'expertPlus';

                let songInfo = this.getBSData(hash, diffSearch, songInfo => {
                    // console.log(songInfo)
                    songInfo.songDiff = diff;
                    songInfo.ssLink = data.ssLink;
                    let values = [];
                    for (const id of data.poolIds) {
                        songInfo.poolId = id;
                        values.push(Object.values(songInfo))
                    }
                    this.saveSong(values, res => {
                        callback(res);
                    });
                    return null;
                });
                return null;
            })
            .catch(function (err) {
                return callback({
                    flag: true,
                    err: err
                });
            });
    }

    deleteSong(data: any, callback: Function) {
        this.db.preparedQuery(`DELETE FROM pool_link WHERE id = ?`, [data], (err, result) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag
            });
        })
    }

    saveSong(data, callback: Function) {
        this.db.preparedQuery(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, numNotes, songDiff, ssLink, poolId) VALUES ?`, [data], (err, result) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        })
    }

    async songByKey(data) {
        let key = data.ssLink.split('beatmap/')[1];
        let diff = data.diff;
        let bsData = await rp.get('https://beatsaver.com/api/maps/detail/' + key, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
            },
            json: true
        })
            .catch(err => console.log(err));
        let songName = bsData.metadata.songName.replace(" ", "+");
        let songHash = bsData.hash;



        let ssData = await rp.get(`https://scoresaber.com/?search=${songName}`)
            .then(async html => {
                let $ = cheerio.load(html);

                let defaultLeaderboard = "";
                let defaultDiff = "";

                let ssLink = "";

                await $("table.ranking tr").each((i, e) => {
                    // console.log($(e).find('img').attr('src'));
                    if ($(e).find('img').attr('src')) {
                        let curHash = $(e).find('img').attr('src').replace("/imports/images/songs/", "").replace(".png", "");
                        if (curHash.toLowerCase() == songHash.toLowerCase()) {
                            // songElem = e;
                            if (defaultLeaderboard == "") {
                                defaultDiff = $(e).find('td.difficulty>span').text();
                                defaultLeaderboard = $(e).find('td.song>a').attr('href');
                            }
                            if ($(e).find('td.difficulty>span').text().toLowerCase() == diff.toLowerCase()) {
                                ssLink = $(e).find('td.song>a').attr('href');
                            }
                        }
                    }
                });

                let response = {
                    ssLink: ssLink != "" ? ssLink : defaultLeaderboard,
                    diff: ssLink != "" ? diff : defaultDiff,
                }
                return response;

            })
            .catch(function (err) {
                console.log(err);
            });

        let diffSearch = ssData.diff.toLowerCase();
        if (diffSearch == 'expert+') diffSearch = 'expertPlus';
        let diffInfo = bsData.metadata.characteristics.find(x => x.name == 'Standard').difficulties[diffSearch];
        let info = {
            songHash: bsData.hash.toUpperCase(),
            songName: bsData.metadata.songName,
            songAuthor: bsData.metadata.songAuthorName,
            levelAuthor: bsData.metadata.levelAuthorName,
            key: bsData.key,
            numNotes: (diffInfo ? diffInfo.notes : 0),
            songDiff: ssData.diff,
            ssLink: `https://scoresaber.com${ssData.ssLink}`,
            poolId: 0
        }
        let values = [];
        for (const id of data.poolIds) {
            info.poolId = id;
            values.push(Object.values(info))
        }
        // let res = await this.saveSong(values, res => {
        //     return res;
        // });
        // return res;
        try {
            let res = await this.db.asyncPreparedQuery(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, numNotes, songDiff, ssLink, poolId) VALUES ?`, [values]);
            return {
                data: res,
                flag: false,
                err: null
            }
        } catch (err) {
            return {
                data: null,
                flag: true,
                err: err
            }
        }
    }

    async getBracket(id: string) {
        const bracketData: any = await this.db.asyncPreparedQuery(`SELECT bracket.*,
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
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.tournamentId = ? `, [id]);
        return bracketData;
    }

    async updateBracket(id: string, data: any) {
        let err = null;
        if (data.status == 'update') {
            try {
                await this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "in_progress" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId]);
            } catch (error) {
                err = error;
                throw error;
            }
            return { flag: !!err, err: err };
        } else if (data.status == 'complete') {
            try {
                await this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "complete" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId]);
            } catch (error) {
                err = error;
                throw error;
            }

            const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
            const bracket = await this.getBracket(id);
            let thisMatch: bslMatch = bracket.find(x => x.id == data.matchId);
            let winner = '';
            let loser = '';
            if (data.p1Score > data.p2Score) {
                winner = thisMatch.p1;
                loser = thisMatch.p2;
            } else {
                winner = thisMatch.p2;
                loser = thisMatch.p1;
            }
            if (settings[0].type == 'single_elim') {
                let winnersRound = thisMatch.round + 1;
                let maxRound = Math.max.apply(Math, bracket.map(x => x.round))
                if (winnersRound <= maxRound) {
                    let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                    let playerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                    let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                    try {
                        await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [playerIdentifier, winner, nextMatch.id])
                    } catch (error) {
                        err = error;
                        throw error;
                    }
                }
                return { flag: !!err, err: err };
            } else if (settings[0].type == 'double_elim') {


                if (thisMatch.round >= 0) {
                    // winner
                    let winnersRound = thisMatch.round + 1;
                    let maxRound = Math.max.apply(Math, bracket.map(x => x.round));
                    if (winnersRound < maxRound) {
                        let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                        let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])
                        } catch (error) {
                            err = error;
                            throw error;
                        }

                        // loser
                        let loserRound = -1;
                        let loserMatch = Math.floor(thisMatch.matchNum / 2);
                        let loserIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        if (thisMatch.round > 0) {
                            loserIdentifier = 'p1';
                            loserRound = thisMatch.round * -2;
                            if ((thisMatch.round % 3) % 2 == 0) {
                                loserMatch = thisMatch.matchNum % 2 == 0 ? thisMatch.matchNum + 1 : thisMatch.matchNum - 1;
                            } else {
                                loserMatch = bracket.filter(x => x.round == 0).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1
                            }
                            if (maxRound - 2 == thisMatch.round) {
                                loserMatch = 0;
                            }
                        }
                        let loserNextMatch = bracket.find(x => x.round == loserRound && x.matchNum == loserMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [loserIdentifier, loser, loserNextMatch.id])
                        } catch (error) {
                            err = error;
                            throw error;
                        }
                    } else if (winnersRound == maxRound && data.p1Score < data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET p1 = ?, p2 = ?, bye = 0 WHERE id = ?', [winner, loser, nextMatch.id])
                        } catch (error) {
                            err = error;
                            throw error;
                        }
                    } else if (winnersRound == maxRound && data.p1Score > data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET bye = 1 WHERE id = ?', [nextMatch.id])
                        } catch (error) {
                            err = error;
                            throw error;
                        }
                    }
                } else if (thisMatch.round < 0) {
                    let winnersRound = thisMatch.round - 1;
                    let minRound = Math.min.apply(Math, bracket.map(x => x.round));
                    let maxRound = Math.max.apply(Math, bracket.map(x => x.round));
                    let winnersMatch = 0;
                    let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                    if (winnersRound > minRound) {
                        winnersMatch = thisMatch.round * -1 % 2 == 1 ? thisMatch.matchNum : Math.floor(thisMatch.matchNum / 2);
                    } else if (winnersRound == minRound - 1) {
                        winnersRound = maxRound - 1;
                        winnersMatch = 0;
                        winnerIdentifier = 'p2';
                    }
                    let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                    if (thisMatch.round * -1 % 2 == 1) winnerIdentifier = 'p2';
                    try {
                        await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])
                    } catch (error) {
                        err = error;
                        throw error;
                    }
                    return { flag: !!err, err: err };
                }


            }
            return { flag: !!err, err: err };
        }

        return [];
    }

    async saveBracket(id: string, data?: any) {
        let matches: Array<match> = [];
        console.log(data);
        if (data.data == null || (data.data.length == 0 || Object.keys(data.data).length == 0)) {
            let tempMatches = await this.generateBracket(id);
            // console.log(tempMatches);
            for (const match of tempMatches) {
                matches.push({
                    tournamentId: id,
                    round: match.round,
                    matchNum: match.matchNum,
                    p1: match.p1,
                    p2: match.p2,
                    bye: +match.bye || 0
                });
            }
        } else if (data.data.length > 0) {
            let tempMatches = await this.generateBracket(id, data.data);
            // console.log(tempMatches);
            for (const match of tempMatches) {
                matches.push({
                    tournamentId: id,
                    round: match.round,
                    matchNum: match.matchNum,
                    p1: match.p1,
                    p2: match.p2,
                    bye: +match.bye || 0
                });
            }
        }
        let err = null;
        let sqlMatches = [];
        for (const match of matches) {
            sqlMatches.push(Object.values(match))
        }
        try {
            await this.db.asyncPreparedQuery('DELETE FROM bracket WHERE tournamentId = ?', [id]);
            await this.db.asyncPreparedQuery('INSERT INTO bracket (tournamentId, round, matchNum, p1, p2, bye) VALUES ?', [sqlMatches])
        } catch (error) {
            err = error;
            throw error;
        }
        return { flag: !!err, err: err };
    }

    async generateBracket(id: string, players?: string[]) {
        const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        // console.log(settings);
        let rand = false;
        if (settings[0].bracket_sort_method == 'random') {
            settings[0].bracket_sort_method = 'discordId';
            rand = true;
        }
        let participants: any = [];
        // console.log(players)
        if (!players) {
            participants = await this.db.asyncPreparedQuery(`SELECT p.id AS participantId,
            CAST(p.userId AS CHAR) as userId,
            p.forfeit,
            p.seed as seed,
            CAST(\`u\`.\`discordId\` AS CHAR) as discordId,
            CAST(\`u\`.\`ssId\` AS CHAR) as ssId,
            \`u\`.\`name\`,
            \`u\`.\`twitchName\`,
            \`u\`.\`avatar\`,
            \`u\`.\`globalRank\` as globalRank,
            \`u\`.\`localRank\`,
            \`u\`.\`country\`,
            \`u\`.\`tourneyRank\` as tournamentRank,
            \`u\`.\`TR\`,
            \`u\`.\`pronoun\`
            FROM participants p
            LEFT JOIN users u ON u.discordId = p.userId
            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
            WHERE p.tournamentId = ? ORDER BY ${settings[0].bracket_sort_method}=0, ${settings[0].bracket_sort_method} ${rand ? '' : 'LIMIT ?'}`, [id, settings[0].bracket_limit])
                .catch(err => {
                    console.error(err);
                });

        } else {
            participants = players;
        }

        if (rand) {
            this.shuffle(participants);
        }
        participants.length = settings[0].bracket_limit;
        await this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id])
        if (settings[0].bracket_sort_method != 'seed' && !players) {
            let i = 1;
            for (const participant of participants) {
                await this.db.asyncPreparedQuery(`UPDATE participants SET seed = ? WHERE id = ?`, [i, participant.participantId]);
                i++;
            }
        }
        // console.log(participants);

        let matches: any[];
        // console.log(settings)
        if (settings[0].type == 'single_elim') {
            matches = await this.winnersRoundMatches(settings, participants, !!players);
        } else if (settings[0].type == 'double_elim') {
            matches = await this.doubleElimMatches(settings, participants, !!players);
        }

        return matches;
    }

    private async winnersRoundMatches(settings: tournamentSettings, participants: any, custom = false): Promise<any[]> {
        let numParticipants = participants.length;
        let seeds = this.seeding(numParticipants);
        let matches: Array<match> = [];

        let rounds = Math.log2(numParticipants);
        let byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
        let numMatches = numParticipants - 1;

        let byePlayers = [];
        let roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
        let totalMatches = roundMatches;
        console.log(custom);
        // First Round
        for (let i = 0; i < seeds.length; i += 2) {
            let p1Id: string, p1Name: string, p1Avatar: string = '';
            let isBye = true;
            if (participants[seeds[i] - 1] != undefined && !custom) {
                p1Id = participants[seeds[i] - 1].discordId;
                p1Name = participants[seeds[i] - 1].name;
                p1Avatar = participants[seeds[i] - 1].avatar;
            } else if (participants[seeds[i] - 1] != undefined && custom) {
                p1Id = participants[seeds[i] - 1];
                p1Name = participants[seeds[i] - 1];
                p1Avatar = '';
            }
            console.log(p1Id, p1Name);

            let p2Id: string, p2Name: string, p2Avatar: string = '';
            if (participants[seeds[i + 1] - 1] != undefined && !custom) {
                p2Id = participants[seeds[i + 1] - 1].discordId;
                p2Name = participants[seeds[i + 1] - 1].name;
                p2Avatar = participants[seeds[i + 1] - 1].avatar;
            } else if (participants[seeds[i + 1] - 1] != undefined && custom) {
                p2Id = participants[seeds[i + 1] - 1];
                p2Name = participants[seeds[i + 1] - 1];
                p2Avatar = '';
            }

            if (participants[seeds[i + 1] - 1] != undefined && participants[seeds[i] - 1] != undefined) {
                isBye = false;
            }
            if (isBye) {
                let nextMatch = Math.floor((i / 2) / 2) + roundMatches + 1;
                byePlayers.push({ match: nextMatch, player: p1Id != "" ? p1Id : p2Id });
            }
            let temp: bslMatch = {
                id: i / 2 + 1,
                round: 0,
                matchNum: i / 2,
                p1: p1Id,
                p2: p2Id,
                p1Score: 0,
                p2Score: 0,
                status: '',
                p1Rank: 0,
                p2Rank: 0,
                p1Seed: seeds[i],
                p2Seed: seeds[i + 1],
                p1Name: p1Name,
                p2Name: p2Name,
                p1Country: '',
                p2Country: '',
                p1Avatar: p1Avatar,
                p2Avatar: p2Avatar,
                bye: isBye
            }
            matches.push(temp);
        }
        // console.log(byePlayers);
        for (let i = 1; i < rounds; i++) {
            let x = i + 1;
            roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
            for (let j = 0; j < roundMatches; j++) {
                let p1Id: string, p1Name: string, p1Avatar: string = '';
                let p2Id: string, p2Name: string, p2Avatar: string = '';
                if (byePlayers.some(x => x.match == totalMatches + j + 1)) {
                    let players = byePlayers.filter(x => x.match == totalMatches + j + 1);
                    // console.log(players);
                    if (players[0] != undefined && !custom) {
                        p1Id = participants.find(x => x.discordId == players[0].player).discordId;
                        p1Name = participants.find(x => x.discordId == players[0].player).name;
                        p1Avatar = participants.find(x => x.discordId == players[0].player).avatar;
                    }
                    if (players[1] != undefined && !custom) {
                        p2Id = participants.find(x => x.discordId == players[1].player).discordId;
                        p2Name = participants.find(x => x.discordId == players[1].player).name;
                        p2Avatar = participants.find(x => x.discordId == players[1].player).avatar;
                    }
                }
                let temp: bslMatch = {
                    id: totalMatches + j + 1,
                    round: i,
                    matchNum: j,
                    p1: p1Id,
                    p2: p2Id,
                    p1Score: 0,
                    p2Score: 0,
                    status: '',
                    p1Rank: 0,
                    p2Rank: 0,
                    p1Seed: seeds[i],
                    p2Seed: seeds[i + 1],
                    p1Name: p1Name,
                    p2Name: p2Name,
                    p1Country: '',
                    p2Country: '',
                    p1Avatar: p1Avatar,
                    p2Avatar: p2Avatar,
                }
                matches.push(temp);
            }
            if (settings[0].type == 'double_elim' && roundMatches == 1) {
                let temp: bslMatch = {
                    id: totalMatches + 2,
                    round: i + 1,
                    matchNum: 0,
                    p1: null,
                    p2: null,
                    p1Score: 0,
                    p2Score: 0,
                    status: '',
                    p1Rank: 0,
                    p2Rank: 0,
                    p1Seed: 0,
                    p2Seed: 0,
                    p1Name: '',
                    p2Name: '',
                    p1Country: '',
                    p2Country: '',
                    p1Avatar: '',
                    p2Avatar: ''
                }
                matches.push(temp);
            }
            totalMatches += Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
        }
        if (settings[0].type == 'double_elim') {
            let temp: bslMatch = {
                id: totalMatches + 2,
                round: rounds + 1,
                matchNum: 0,
                p1: null,
                p2: null,
                p1Score: 0,
                p2Score: 0,
                status: '',
                p1Rank: 0,
                p2Rank: 0,
                p1Seed: 0,
                p2Seed: 0,
                p1Name: '',
                p2Name: '',
                p1Country: '',
                p2Country: '',
                p1Avatar: '',
                p2Avatar: ''
            }
            matches.push(temp);
        }
        return matches;
    }

    private async doubleElimMatches(settings: tournamentSettings, participants: any, custom = false): Promise<any[]> {
        let numParticipants = participants.length;
        let seeds = this.seeding(numParticipants);
        let matches: Array<match> = [];

        let rounds = Math.log2(numParticipants);
        let byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
        let numMatches = numParticipants - 1;

        let byePlayers = [];
        let roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
        let totalMatches = roundMatches;

        // Winners round
        let winnersMatches = await this.winnersRoundMatches(settings, participants, custom);



        let losersMatchesCount = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 4;
        let loserIndex = -1;
        let losersMatches: Array<match> = [];
        while (losersMatchesCount > 0) {
            for (let i = 0; i < losersMatchesCount; i++) {
                let temp: bslMatch = {
                    id: winnersMatches.length + i + 1,
                    round: loserIndex,
                    matchNum: i,
                    p1: '',
                    p2: '',
                    p1Score: 0,
                    p2Score: 0,
                    status: '',
                    p1Rank: 0,
                    p2Rank: 0,
                    p1Seed: 0,
                    p2Seed: 0,
                    p1Name: '',
                    p2Name: '',
                    p1Country: '',
                    p2Country: '',
                    p1Avatar: '',
                    p2Avatar: ''
                }
                losersMatches.push(temp);
            }
            if (loserIndex % 2 == 0) {
                losersMatchesCount = Math.floor(losersMatchesCount / 2);
            }
            loserIndex--;
        }
        let allMatches = winnersMatches.concat(losersMatches);
        return allMatches;
    }

    async saveQualScore(data: qualsScore) {
        const tournamentSettings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId]);
        if (tournamentSettings.length <= 0 || (tournamentSettings[0].state != 'qualifiers' && !!tournamentSettings[0].public)) return { error: 'invalid tournament settings' };
        const userInfo: any = await this.db.asyncPreparedQuery("SELECT p.*, u.discordId FROM participants p LEFT JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?", [data.ssId, data.tournamentId]);
        if (userInfo.length <= 0) return { error: "invalid user" };
        delete data.ssId;
        data.userId = userInfo[0].discordId;
        const mapPool: any = await this.db.asyncPreparedQuery("SELECT pl.songHash FROM pool_link pl LEFT JOIN map_pools mp ON pl.poolId = mp.id WHERE mp.tournamentId = ? AND is_qualifiers = 1 AND live = 1", [data.tournamentId]);
        // console.log(mapPool.some(x=> x.songHash == data.songHash));
        if (!mapPool.some(x => x.songHash.toLowerCase() == data.songHash.toLowerCase())) return { error: "invalid song hash" };
        data.percentage = +data.score / +data.totalScore;
        if (data.percentage >= 1) return { error: "invalid score" };
        data.maxScore = data.totalScore;
        delete data.totalScore;
        let savedData: any = await this.db.asyncPreparedQuery(`INSERT INTO qualifier_scores SET ?
        ON DUPLICATE KEY UPDATE
        score = GREATEST(score, VALUES(score)),
        percentage = GREATEST(percentage, VALUES(percentage)),
        maxScore = GREATEST(maxScore, VALUES(maxScore))`, [data, +data.score, data.percentage, data.maxScore]);
        if (savedData.insertId == 0) return { error: 'Did not beat score' };
        return { data: "score saved successfully", flag: false };
    }

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

    async checkKey(id: string, key: string) {
        const keyData: any = await this.db.asyncPreparedQuery("SELECT * FROM api_keys WHERE tournamentId = ?", [id]);
        if (keyData[0].api_key == key) return true;
        return false
    }

    private getBSData(hash, diff, callback: Function): any {
        rp.get('https://beatsaver.com/api/maps/by-hash/' + hash, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
            },
            json: true
        })
            .then(res => {
                let info = {
                    songHash: hash,
                    songName: res.metadata.songName,
                    songAuthor: res.metadata.songAuthorName,
                    levelAuthor: res.metadata.levelAuthorName,
                    key: res.key,
                    numNotes: res.metadata.characteristics.find(x => x.name == 'Standard').difficulties[diff].notes
                }
                callback(info);
                return null;
            });
    }

    private async getSettings(id: string) {
        return await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
    }

    private formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getUTCMonth() + 1),
            day = '' + d.getUTCDate(),
            year = d.getUTCFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }
    private formatDate2(date) {
        var d = new Date(date);
        return d.toISOString().slice(0, 19).replace('T', ' ');
    }


    private isBase64(str) {
        const base64regex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i;
        return base64regex.test(str);
    }

    private seeding(numPlayers: number): Array<number> {
        const nextPlayer = (player) => {
            let out = [];
            let length = player.length * 2 + 1;
            for (const value of player) {
                out.push(value);
                out.push(length - value);
            }
            return out;
        }
        let rounds = Math.log(numPlayers) / Math.log(2) - 1;
        let players = [1, 2];
        for (let i = 0; i < rounds; i++) {
            players = nextPlayer(players);
        }
        return players;
    }

    private sumProperty(items, prop) {
        if (items == null) {
            return 0;
        }
        return items.reduce(function (a, b) {
            return b[prop] == null ? a : a + b[prop];
        }, 0);
    }

    private shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    private randHash(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}