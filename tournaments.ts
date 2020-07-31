import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';
// import jimp from 'jimp';
import sharp from 'sharp';

import * as rp from 'request-promise';
import cheerio from 'cheerio';
import { removeParticipant, tournamentSettings, tournamentUpdate, updateParticipant } from './models/tournament.models';



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
        ts.bracket_limit
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
        let savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/public/assets/images/';

        let imgErr = false;
        // sharp
        const buf = await Buffer.from(base64Img, 'base64');
        const webpData = await sharp(buf)
            .resize({ width: 550 })
            .webp({ lossless: true, quality: 50 })
            .toBuffer();

        await sharp(webpData)
            .toFile(savePath + imgName)
            // .then(info => { console.log(info) })
            .catch(err => {
                imgErr = true;
                return callback({
                    flag: true,
                    err: err
                });
            });

        if (!imgErr) {
            data.image = 'assets/images/' + imgName;
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
                .toBuffer();

            await sharp(webpData)
                .toFile(savePath + imgName)
                .catch(err => {
                    imgErr = true;
                    return callback({
                        flag: true,
                        err: err
                    });
                });
            data.tournament.image = 'assets/tournamentImages/' + imgName;
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

    updateSettings(data: any, callback: Function) {
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
        let sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?`;
        if (isAuth) {
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
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
        WHERE p.tournamentId = ? ORDER BY ${settings[0].bracket_sort_method}=0, ${settings[0].bracket_sort_method} LIMIT ?`, [id, settings[0].bracket_limit]);
        // console.log(participants.length);
        if(participants.length % 8 != 0) throw 'Uneven number of participants';
        let seeds = this.seeding(participants.length);
        let matches: Array<match> = [];
        let names = [];

        for (let i = 0; i < seeds.length; i+=2) {
            let p1Id: string, p1Name: string, p1Avatar: string = '';
            if(participants[seeds[i]-1] != undefined) {
                p1Id = participants[seeds[i]-1].discordId;
                p1Name = participants[seeds[i]-1].name;
                p1Avatar = participants[seeds[i]-1].avatar;
            }
            let p2Id: string, p2Name: string, p2Avatar: string = '';
            if(participants[seeds[i+1]-1] != undefined) {
                p2Id = participants[seeds[i+1]-1].discordId;
                p2Name = participants[seeds[i+1]-1].name;
                p2Avatar = participants[seeds[i+1]-1].avatar;
            }
            let temp: bslMatch = {
                id: i/2,
                round: 0,
                matchNum: i/2,
                p1: p1Id,
                p2: p2Id,
                p1Score: 0,
                p2Score: 0,
                status: '',
                p1Rank: 0,
                p2Rank: 0,
                p1Seed: seeds[i],
                p2Seed: seeds[i+1],
                p1Name: p1Name,
                p2Name: p2Name,
                p1Country: '',
                p2Country: '',
                p1Avatar: p1Avatar,
                p2Avatar: p2Avatar
            }
            matches.push(temp);
        }

        for (const user of participants) {
            names.push(user.name);
        }
        
        // return {
        //     participants: participants,
        //     matches: matches,
        //     seeds: seeds
        // };
        return matches;
    }

    private singleElimMatches() {
        
    }

    private doubleElimMatches() {

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
        let players = [1,2];
        for (let i = 0; i < rounds; i++) {
            players = nextPlayer(players);
        }
        return players;
    }
}

export interface match {
    round: number,
    matchNum: number,
    p1: string,
    p2: string
}
export interface bslMatch {
    id: number
    round: number,
    matchNum: number,
    p1: string,
    p2: string,
    p1Score: number, 
    p2Score: number, 
    status: string, 
    p1Rank: number, 
    p2Rank: number, 
    p1Seed: number, 
    p2Seed: number, 
    p1Name: string, 
    p2Name: string, 
    p1Country: string, 
    p2Country: string, 
    p1Avatar: string, 
    p2Avatar: string, 
}