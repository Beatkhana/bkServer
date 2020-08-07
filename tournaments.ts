import { database } from './database';
import mysql from 'mysql';
// import fs from 'fs';
// import jimp from 'jimp';
import sharp from 'sharp';
const AWS = require('aws-sdk');

import * as rp from 'request-promise';
import cheerio from 'cheerio';
import { bslMatch, match, qualScore, qualsScore, removeParticipant, tournamentSettings, tournamentUpdate, updateParticipant } from './models/tournament.models';
import { Observable } from 'rxjs';

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
        WHERE archived = 0 ${sqlWhere}`, [userId], (err, result: any) => {
            return callback(result);
        });
    }

    getArchived(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id as tournamentId, name, image, \`date\` as startDate, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1", (err, result: any) => {
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
        ts.has_quals
        FROM tournaments 
        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id 
        WHERE tournaments.id = ? ${sqlWhere}`, [id, userId], (err, result: any) => {
            return callback(result);
        });
    }

    participants(id, callback: Function, isAuth = false, userId?: string) {
        const result = this.db.preparedQuery(`SELECT p.id AS participantId,
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
        WHERE p.tournamentId = ? ${isAuth ? '' : 'AND ts.show_signups = 1'}`, [id], (err, result: any) => {
            return callback(result);
        });
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

    async save(data: any, callback: Function) {
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let imgName = data.imgName;
        imgName = imgName.toLowerCase();
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
        let savePath = this.env == 'development' ? '../app/src/assets/tournamentImages/' : __dirname + '/public/assets/tournamentImages/';

        let imgErr = false;
        // sharp
        const buf = await Buffer.from(base64Img, 'base64');
        const webpData = await sharp(buf)
            .resize({ width: 550 })
            .webp({ lossless: true, quality: 50 })
            .toBuffer()
            .then(buffer => {
                let params = {
                    Bucket: BUCKET_NAME,
                    Key: imgName, // File name you want to save as in S3
                    Body: buffer,
                    ACL: 'public-read'
                };
                s3.upload(params, (err, data) => {
                    if (err) {
                        console.log(err)
                        imgErr = true;
                    }
                    console.log(`File uploaded successfully. ${data.Location}`);
                });
            })
        // const fileContent = fs.readFileSync(savePath + imgName);
        // const params = {
        //     Bucket: BUCKET_NAME,
        //     Key: imgName, // File name you want to save as in S3
        //     Body: fileContent,
        //     ACL: 'public-read'
        // };
        // let s3Img = await new Promise<string>((resolve, reject) => {
        //     s3.upload(params, (err, data) => {
        //         if (err) {
        //             console.log(err)
        //             imgErr = true;
        //         }
        //         console.log(`File uploaded successfully. ${data.Location}`);
        //         resolve(data.Location);
        //     });
        // });
        // const s3Img = await 

        if (!imgErr) {
            data.image = imgName;
            delete data.imgName;

            try {
                data.date = this.formatDate(data.date);
                data.endDate = this.formatDate(data.endDate);
            } catch (err) {
                return callback({
                    flag: true,
                    err: err
                });
            }

            const result = this.db.preparedQuery(`INSERT INTO tournaments SET ?`, [data], (err, result: any) => {
                let flag = false;
                if (err) flag = true;
                if (!err) {
                    this.db.preparedQuery('INSERT INTO tournament_settings SET tournamentId = ?', [result.insertId], (err, result2: any) => {
                        let flag = false;
                        if (err) flag = true;
                        return callback({
                            data: result,
                            flag: flag,
                            err: err
                        });
                    })
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
            let savePath = this.env == 'development' ? '../app/src/assets/tournamentImages/' : __dirname + '/public/assets/tournamentImages/';
            // // sharp
            const buf = await Buffer.from(base64Img, 'base64');

            // jimp.read(buf, (err, image) => {
            //     if (err) throw err;
            //     else {
            //         image.resize(550, jimp.AUTO)
            //             .quality(50)
            //     }
            // })

            // jimp.read(buf)
            //     .then(image => {
            //         image.resize(550, jimp.AUTO)
            //             .quality(50)
            //             .write(savePath + imgName);
            //     })
            //     .catch(err => {
            //         imgErr = true;
            //         return callback({
            //             flag: true,
            //             err: err
            //         });
            //     })
            const webpData = await sharp(buf)
                .resize({ width: 550 })
                .webp({ lossless: true, quality: 50 })
                .toBuffer()
                .then(buffer => {
                    let params = {
                        Bucket: BUCKET_NAME,
                        Key: imgName, // File name you want to save as in S3
                        Body: buffer,
                        ACL: 'public-read'
                    };
                    s3.upload(params, (err, data) => {
                        if (err) {
                            console.log(err)
                            imgErr = true;
                        }
                        console.log(`File uploaded successfully. ${data.Location}`);
                    });
                })

            // await sharp(webpData)
            //     .toFile(savePath + imgName)

            //     // .then(info => { console.log(info) })
            //     .catch(err => {
            //         imgErr = true;
            //         return callback({
            //             flag: true,
            //             err: err
            //         });
            //     });
            // await sharp(webpData)
            //     .toFile(savePath + imgName)
            //     .catch(err => {
            //         imgErr = true;
            //         return callback({
            //             flag: true,
            //             err: err
            //         });
            //     });
            // const fileContent = fs.readFileSync(savePath + imgName);
            // const params = {
            //     Bucket: BUCKET_NAME,
            //     Key: imgName, // File name you want to save as in S3
            //     Body: fileContent,
            //     ACL: 'public-read'
            // };
            // let s3Img = await new Promise<string>((resolve, reject) => {
            //     s3.upload(params, (err, data) => {
            //         if (err) {
            //             console.log(err)
            //             imgErr = true;
            //         }
            //         console.log(`File uploaded successfully. ${data.Location}`);
            //         resolve(data.Location);
            //     });
            // });
            // console.log(location);
            data.tournament.image = imgName;
        }

        if (!imgErr) {
            delete data.tournament.imgName;

            try {
                data.tournament.date = this.formatDate(data.tournament.date);
                data.tournament.endDate = this.formatDate(data.tournament.endDate);
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

    async seedPlayersByQuals(tournamentId: string, cutoff) {
        let qualsScores = await this.getQualsScores(tournamentId);
        // console.log(qualsScores);
        qualsScores.sort((a, b) => {
            let sumA = this.sumProperty(a.scores, 'score');
            let sumB = this.sumProperty(b.scores, 'score');
            let sumAPer = this.sumProperty(a.scores, 'percentage');
            let sumBPer = this.sumProperty(b.scores, 'percentage');
            a.avgPercentage = isNaN(sumAPer / a.scores.length * 100) ? 0 : (sumAPer / a.scores.length * 100).toFixed(2);
            b.avgPercentage = isNaN(sumBPer / b.scores.length * 100) ? 0 : (sumBPer / b.scores.length * 100).toFixed(2);
            a.scoreSum = sumA;
            b.scoreSum = sumB;
            if (sumB == sumA) {
                if (a.globalRank == 0) return 1;
                if (b.globalRank == 0) return -1;
                return a.globalRank - b.globalRank;
            }
            return sumB - sumA;
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

    signUp(data: any, callback: Function) {

        this.db.preparedQuery(`SELECT public_signups FROM tournament_settings WHERE tournamentId = ?`, [data.tournamentId], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
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

    events(callback: Function) {
        const result = this.db.query(`SELECT tournaments.id as tournamentId, tournaments.name, tournaments.date as startDate, tournaments.endDate FROM tournaments LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id WHERE ts.public = 1 ORDER BY date`, (err, result: any) => {
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

    getMapPools(tournamentId: string, callback: Function, isAuth: boolean = false) {
        let sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?`;
        if (isAuth) {
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
        }
        this.db.preparedQuery(sql, [tournamentId], (err, result: any) => {
            let mapPools = {};
            // console.log(result)
            if (result == undefined) return callback({});
            for (const song of result) {
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
                            ssLink: song.ssLink
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
                                ssLink: song.ssLink
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
            return callback(mapPools);
        });
    }

    addSong(data: any, callback: Function) {
        // console.log(data);
        rp.get(data.ssLink)
            .then(html => {
                let hash = cheerio('.box.has-shadow > b', html).text();
                let diff = cheerio('li.is-active > a > span', html).text();
                let songInfo = this.getBSData(hash, songInfo => {
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
        this.db.preparedQuery(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, songDiff, ssLink, poolId) VALUES ?`, [data], (err, result) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        })
    }

    async generateBracket(id: string) {
        const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        // console.log(settings);
        const participants: any = await this.db.asyncPreparedQuery(`SELECT p.id AS participantId,
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
        WHERE p.tournamentId = ? ORDER BY ${settings[0].bracket_sort_method}=0, ${settings[0].bracket_sort_method} LIMIT ?`, [id, settings[0].bracket_limit])
            .catch(err => {
                console.error(err);
            });
        // console.log(participants.length);
        // if (participants.length % 8 != 0) throw 'Uneven number of participants';

        let matches: any[];
        // console.log(settings)
        if (settings[0].type == 'single_elim') {
            matches = await this.winnersRoundMatches(settings, participants);
        } else if (settings[0].type == 'double_elim') {
            matches = await this.doubleElimMatches(settings, participants);
        }

        return matches;
    }

    private async winnersRoundMatches(settings: tournamentSettings, participants: any): Promise<any[]> {
        let numParticipants = participants.length;
        let seeds = this.seeding(numParticipants);
        let matches: Array<match> = [];

        let rounds = Math.log2(numParticipants);
        let byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
        let numMatches = numParticipants - 1;

        let byePlayers = [];
        let roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
        let totalMatches = roundMatches;

        // First Round
        for (let i = 0; i < seeds.length; i += 2) {
            let p1Id: string, p1Name: string, p1Avatar: string = '';
            let isBye = true;
            if (participants[seeds[i] - 1] != undefined) {
                p1Id = participants[seeds[i] - 1].discordId;
                p1Name = participants[seeds[i] - 1].name;
                p1Avatar = participants[seeds[i] - 1].avatar;
            }
            let p2Id: string, p2Name: string, p2Avatar: string = '';
            if (participants[seeds[i + 1] - 1] != undefined) {
                p2Id = participants[seeds[i + 1] - 1].discordId;
                p2Name = participants[seeds[i + 1] - 1].name;
                p2Avatar = participants[seeds[i + 1] - 1].avatar;
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
                    if (players[0] != undefined) {
                        p1Id = participants.find(x => x.discordId == players[0].player).discordId;
                        p1Name = participants.find(x => x.discordId == players[0].player).name;
                        p1Avatar = participants.find(x => x.discordId == players[0].player).avatar;
                    }
                    if (players[1] != undefined) {
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
                matches.push(temp);
            }
            totalMatches += Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
        }
        return matches;
    }

    private async doubleElimMatches(settings: tournamentSettings, participants: any): Promise<any[]> {
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
        let winnersMatches = await this.winnersRoundMatches(settings, participants);



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
        delete data.totalScore;
        let savedData: any = await this.db.asyncPreparedQuery(`INSERT INTO qualifier_scores SET ?
        ON DUPLICATE KEY UPDATE
        score = GREATEST(score, VALUES(score)),
        percentage = GREATEST(percentage, VALUES(percentage))`, [data, +data.score, data.percentage]);
        if (savedData.insertId == 0) return { error: 'Did not beat score' };
        return { data: "score saved successfully", flag: false };
    }

    async getQualsScores(id: string) {
        const qualsScores: any = await this.db.asyncPreparedQuery(`SELECT p.userId as discordId, q.score, q.percentage, pl.*, u.* FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN qualifier_scores q ON p.userId = q.userId 
        LEFT JOIN pool_link pl ON pl.songHash = q.songHash
        LEFT JOIN map_pools mp ON (mp.tournamentId = p.tournamentId AND mp.id = pl.poolId)
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND (q.tournamentId IS NULL OR q.tournamentId = ?)`, [id, id]);
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
                    scores: curScore
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

    private getBSData(hash, callback: Function): any {
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
                    key: res.key
                }
                return callback(info);
            })
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
}