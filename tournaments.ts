import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';
// import jimp from 'jimp';
import sharp from 'sharp';

import * as rp from 'request-promise';
import cheerio from 'cheerio';



export class tournaments {
    db = new database();

    constructor() {
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }

    getAll(callback: Function) {
        var data: any = [];

        const result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments", (err, result: any) => {
            return callback(result);
        });
    }

    getActive(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 0", (err, result: any) => {
            return callback(result);
        });
    }

    getArchived(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1", (err, result: any) => {
            return callback(result);
        });
    }

    getTournament(id: string, callback: Function) {
        var data: any = [];
        const result = this.db.query(`SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments WHERE id = ${id}`, (err, result: any) => {
            return callback(result);
        });
    }

    save(data: any, callback: Function) {
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let imgName = data.imgName;
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';

        // jimp
        const buf = Buffer.from(base64Img, 'base64');
        sharp(buf)
            .resize({ width: 550 })
            .toFile('./public/assets/images/' + imgName)
            .catch(err => { console.log(err) });


        data.image = 'assets/images/' + imgName;
        delete data.imgName;
        console.log(data);

        const result = this.db.preparedQuery(`INSERT INTO tournaments SET ?`, [data], (err, result: any) => {
            return callback(result);
        });
    }

    delete(id: number, callback: Function) {
        const result = this.db.preparedQuery(`DELETE FROM tournaments WHERE id = ?`, [id], (err, result: any) => {
            if (err) return callback({ 'error': err });
            return callback({ 'message': "success" });
        });
    }

    update(data: any, callback: Function) {
        // console.log(data);
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', data.id], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag
            });
        });
    }

    archive(data: any, callback: Function) {
        // console.log(data);
        let id = data.tournament.id;
        delete data.tournament.id;
        data.tournament.archived = 1;
        // console.log(data);
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', id], (err, result: any) => {
            return callback(result);
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
        const result = this.db.query(`SELECT id, name, date as startDate, endDate FROM tournaments ORDER BY date`, (err, result: any) => {
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
                flag: flag
            });
        })
    }

    updatePool(data:any, callback:Function) {
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
        if(isAuth){
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
        }
        this.db.preparedQuery(sql, [tournamentId], (err, result: any) => {
            let mapPools = {};
            // console.log(result)
            if(result == undefined) return callback({});
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
        console.log(data);
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
                //handle error
                // no
            });
    }

    deleteSong(data:any, callback:Function) {
        this.db.preparedQuery(`DELETE FROM pool_link WHERE ?`, [data], (err, result) => {
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
                flag: flag
            });
        })
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

}