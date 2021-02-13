import express from "express";
import { authController } from "./auth.controller";
import { controller } from "./controller";
import * as rp from 'request-promise';
import cheerio from 'cheerio';

export class MapPoolController extends controller {

    async addPool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms || await auth.tournamentMapPool)) return this.unauthorized(res);
        try {
            if (req.body.is_qualifiers == 1) {
                await this.db.aQuery(`UPDATE map_pools SET is_qualifiers = 0 WHERE tournamentId = ?`, [auth.tourneyId]);
            }
            await this.db.aQuery(`INSERT INTO map_pools SET ?`, [req.body]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getPools(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = await auth.hasAdminPerms || await auth.tournamentMapPool;

        let mapOptions = [];
        let sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?`;
        if (isAuth) {
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
            mapOptions = await this.db.aQuery(`SELECT * FROM event_map_options WHERE tournament_id = ?`, [auth.tourneyId]);
        }
        const poolsRes: any = await this.db.aQuery(sql, [auth.tourneyId]);
        let mapPools = {};
        // console.log(result)
        // if (poolsRes == undefined) return callback({});
        for (const song of poolsRes) {
            if (song.poolId in mapPools) {
                let tmpSong: any = {
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
                if (isAuth && mapOptions.find(x => x.map_id == song.songId)) {
                    let map = mapOptions.find(x => x.map_id == song.songId)
                    tmpSong.flags = map.flags;
                    tmpSong.playerOptions = map.playerOptions;
                    tmpSong.selectedCharacteristic = map.selCharacteristic;
                    tmpSong.difficulty = map.difficulty;
                }
                mapPools[song.poolId].songs.push(tmpSong);
            } else {
                let songs = []
                if (song.songId != null) {
                    let tmpSong: any = {
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
                    if (isAuth && mapOptions.find(x => x.map_id == song.songId)) {
                        let map = mapOptions.find(x => x.map_id == song.songId)
                        tmpSong.flags = map.flags;
                        tmpSong.playerOptions = map.playerOptions;
                        tmpSong.selectedCharacteristic = map.selCharacteristic;
                        tmpSong.difficulty = map.difficulty;
                    }
                    songs = [tmpSong];
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
        return res.send(mapPools);
    }

    async updatePool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = await auth.hasAdminPerms || await auth.tournamentMapPool;
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let poolId = data.poolId;
        delete data.poolId;
        try {
            if (req.body.is_qualifiers == 1) {
                await this.db.aQuery(`UPDATE map_pools SET is_qualifiers = 0 WHERE tournamentId = ?`, [auth.tourneyId]);
                // await this.db.aQuery(`DELETE FROM event_map_options WHERE tournament_id = ?`, [auth.tourneyId]);
                // let mapIds = await this.db.aQuery(`SELECT id FROM pool_link WHERE poolId = ?`)
            }
            await this.db.aQuery(`UPDATE map_pools SET ? WHERE id = ?`, [data, poolId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async downloadPool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = await auth.hasAdminPerms || await auth.tournamentMapPool;
        if (!req.params.id) return this.clientError(res, "Please provide a map pool ID");
        let pool: any = await this.db.aQuery(`SELECT map_pools.id, map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, pool_link.songHash FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE (map_pools.live = ? OR map_pools.live = 1) AND map_pools.id = ?`, [+!isAuth, req.params.id]);
        if (!pool[0]) return this.clientError(res, "Invalid Map Pool ID");
        let tournamentName = await this.db.aQuery(`SELECT name FROM tournaments WHERE id = ?`, [pool[0].tournamentId]);
        let curSongs = pool.map(e => { return { hash: e.songHash } });
        // console.log(pool[0]);
        let playlist = {
            playlistTitle: `${tournamentName[0].name}_${pool[0].poolName}`,
            playlistAuthor: `${tournamentName[0].name} Through BeatKhana!`,
            playlistDescription: pool[0].description,
            image: pool[0].image,
            songs: curSongs,
            syncURL: `https://beatkhana.com/api/download-pool/${pool[0].id}`
        }

        var data = JSON.stringify(playlist);
        let filename = playlist.playlistTitle.replace(/[<>:"\/\\|?*]+/g, '').replace(/ /g, '_');
        res.setHeader('Content-disposition', `attachment; filename= ${filename}.json`);
        res.setHeader('Content-type', 'application/json');
        return res.send(data);
    }

    async addSongSS(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = await auth.hasAdminPerms || await auth.tournamentMapPool;
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        try {
            let html = await rp.get(data.ssLink);
            let hash: string = cheerio('.box.has-shadow > b', html).text();
            let diff: string = cheerio('li.is-active > a > span', html).text();
            let diffSearch = diff.toLowerCase();
            if (diffSearch == 'expert+') diffSearch = 'expertPlus';

            let songInfo = await this.getBSData(hash, diffSearch);
            songInfo.songDiff = diff;
            songInfo.ssLink = data.ssLink;
            let values = [];
            for (const id of data.poolIds) {
                songInfo.poolId = id;
                values.push(Object.values(songInfo))
            }
            await this.db.aQuery(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, numNotes, songDiff, ssLink, poolId) VALUES ?`, [values]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async addSongBS(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = await auth.hasAdminPerms || await auth.tournamentMapPool;
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let key = data.ssLink.split('beatmap/')[1];
        let diff = data.diff;
        let bsData = await rp.get('https://beatsaver.com/api/maps/detail/' + key, {
            headers: {
                "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
            },
            json: true
        })
            .catch(err => console.log(err));
        let songName = bsData.metadata.songName.replace(" ", "+");
        let songHash = bsData.hash;

        let ssData = await rp.get(`https://scoresaber.com/?search=${encodeURI(songName)}`)
            .then(async (html: string | Buffer) => {
                let $ = cheerio.load(html);

                let defaultLeaderboard = "";
                let defaultDiff = "";

                let ssLink = "";

                $("table.ranking tr").each((i, e) => {
                    if ($(e).find('img').attr('src')) {
                        let curHash = $(e).find('img').attr('src').replace("/imports/images/songs/", "").replace(".png", "");
                        if (curHash.toLowerCase() == songHash.toLowerCase()) {
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
        try {
            await this.db.aQuery(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, numNotes, songDiff, ssLink, poolId) VALUES ?`, [values]);
            return this.ok(res);
        } catch (err) {
            return this.fail(res, err);
        }
    }

    private async getBSData(hash, diff): Promise<any> {
        try {
            let res = await rp.get('https://beatsaver.com/api/maps/by-hash/' + hash, {
                headers: {
                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                }
            });
            res = JSON.parse(res);
            let info = {
                songHash: hash,
                songName: res.metadata.songName,
                songAuthor: res.metadata.songAuthorName,
                levelAuthor: res.metadata.levelAuthorName,
                key: res.key,
                numNotes: res.metadata.characteristics.find(x => x.name == 'Standard').difficulties[diff].notes
            }
            return info;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async deleteSong(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = await auth.hasAdminPerms || await auth.tournamentMapPool;
        if (!isAuth) return this.unauthorized(res);
        if (!req.body.id) return this.clientError(res, "No song id provided");
        try {
            await this.db.aQuery(`DELETE FROM pool_link WHERE id = ?`, [req.body.id]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

}