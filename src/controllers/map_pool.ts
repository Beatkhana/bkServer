import express from "express";
import * as rp from "request-promise";
import { Beatsaver } from "../models/beatsaver.model";
import { Scoresaber } from "../models/scoresaber.model";
import DatabaseService from "../services/database";
import { authController } from "./auth.controller";
import { controller } from "./controller";

export class MapPoolController extends controller {
    async addPool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.hasAdminPerms) || (await auth.tournamentMapPool))) return this.unauthorized(res);
        try {
            if (req.body.is_qualifiers == 1) {
                await DatabaseService.query(`UPDATE map_pools SET is_qualifiers = 0 WHERE tournamentId = ?`, [auth.tourneyId]);
            }
            await DatabaseService.query(`INSERT INTO map_pools SET ?`, [req.body]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getPools(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);

        let mapOptions = [];
        let sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?`;
        if (isAuth) {
            sql = `SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?`;
            mapOptions = (await DatabaseService.query(`SELECT * FROM event_map_options WHERE tournament_id = ?`, [auth.tourneyId])) as any[];
        }
        const poolsRes: any = await DatabaseService.query(sql, [auth.tourneyId]);
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
                };
                if (isAuth && mapOptions.find(x => x.map_id == song.songId)) {
                    let map = mapOptions.find(x => x.map_id == song.songId);
                    tmpSong.flags = map.flags;
                    tmpSong.playerOptions = map.playerOptions;
                    tmpSong.selectedCharacteristic = map.selCharacteristic;
                    tmpSong.difficulty = map.difficulty;
                }
                mapPools[song.poolId].songs.push(tmpSong);
            } else {
                let songs = [];
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
                    };
                    if (isAuth && mapOptions.find(x => x.map_id == song.songId)) {
                        let map = mapOptions.find(x => x.map_id == song.songId);
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
                };
            }
        }
        return res.send(mapPools);
    }

    async updatePool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let poolId = data.poolId;
        delete data.poolId;
        try {
            // if (req.body.is_qualifiers == 1) {
            //     await DatabaseService.query(`UPDATE map_pools SET is_qualifiers = 0 WHERE tournamentId = ?`, [auth.tourneyId]);
            //     // await DatabaseService.query(`DELETE FROM event_map_options WHERE tournament_id = ?`, [auth.tourneyId]);
            //     // let mapIds = await DatabaseService.query(`SELECT id FROM pool_link WHERE poolId = ?`)
            // }
            await DatabaseService.query(`UPDATE map_pools SET ? WHERE id = ?`, [data, poolId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async downloadPool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!req.params.id) return this.clientError(res, "Please provide a map pool ID");
        let pool: any = await DatabaseService.query(
            `SELECT map_pools.id, map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, pool_link.songHash, pool_link.songDiff FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE (map_pools.live = ? OR map_pools.live = 1) AND map_pools.id = ? AND map_pools.tournamentId = ?`,
            [+!isAuth, req.params.id, auth.tourneyId]
        );
        if (!pool[0]) return this.clientError(res, "Invalid Map Pool ID");
        let tournamentName = await DatabaseService.query(`SELECT name FROM tournaments WHERE id = ?`, [pool[0].tournamentId]);
        let curSongs = pool.map(e => {
            return { hash: e.songHash, difficulties: [{ characteristic: "Standard", name: e.songDiff == "Expert+" ? "expertPlus" : e.songDiff.toLowerCase() }] };
        });
        // console.log(pool[0]);
        let playlist = {
            AllowDuplicates: false,
            playlistTitle: `${tournamentName[0].name}_${pool[0].poolName}`,
            playlistAuthor: `${tournamentName[0].name} Through BeatKhana!`,
            playlistDescription: pool[0].description,
            image: pool[0].image,
            songs: curSongs,
            syncURL: `https://beatkhana.com/api/tournament/${pool[0].tournamentId}/download-pool/${pool[0].id}`
        };
        playlist.image = playlist.image.replace(`data:`, "");
        var data = JSON.stringify(playlist);
        let filename = playlist.playlistTitle.replace(/[<>:"\/\\|?*]+/g, "").replace(/ /g, "_");
        res.setHeader("Content-disposition", `attachment; filename= ${filename}.bplist`);
        res.setHeader("Content-type", "application/json");
        return res.send(data);
    }

    async addSongSS(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        try {
            let leaderboardId = data.ssLink.split("/").pop()?.split("?")[0];
            let ssSong: Scoresaber.LeaderboardInfo;
            try {
                let ssReq = await rp.get<Scoresaber.LeaderboardInfo>(`https://scoresaber.com/api/leaderboard/by-id/${leaderboardId}/info`, {
                    json: true
                });
                ssSong = ssReq;
            } catch (error) {
                console.error("Scoresaber Song Error: ", error);
                return this.clientError(res, "Can't find song on scoresaber");
            }
            let diffSearch = Scoresaber.getDifficultyLabel(ssSong.difficulty);
            if (diffSearch == "Expert+") diffSearch = "ExpertPlus";
            let hash = ssSong.songHash;
            let songInfo = await this.getBSData(ssSong.songHash, diffSearch);
            songInfo.songDiff = Scoresaber.getDifficultyLabel(ssSong.difficulty);
            songInfo.ssLink = data.ssLink;
            let values = [];
            for (const id of data.poolIds) {
                songInfo.poolId = id;
                values.push(Object.values(songInfo));
            }
            await DatabaseService.query(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, numNotes, songDiff, ssLink, poolId) VALUES ?`, [values]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async addSongBS(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let key = data.ssLink.split("maps/")[1];
        let diff = data.diff;
        let bsData: Beatsaver.map = await rp
            .get<Beatsaver.map>("https://beatsaver.com/api/maps/id/" + key, {
                headers: {
                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                },
                json: true
            })
            .catch(err => console.log(err));
        let songName = bsData.metadata.songName.replace(" ", "+");
        let curVersion = bsData.versions.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
        let songHash = curVersion.hash;
        let ssInfo: Scoresaber.LeaderboardInfo;
        let ssDiff = Scoresaber.getDifficultyNumber(diff);
        try {
            let ssReq = await rp.get<Scoresaber.LeaderboardInfo>(`https://scoresaber.com/api/leaderboard/by-hash/${songHash}/info?difficulty=${ssDiff}`, {
                json: true
            });
            ssInfo = ssReq;
        } catch (error) {
            console.error("Scoresaber Song Error: ", error);
            return this.clientError(res, "Can't find song on scoresaber");
        }

        let diffSearch = diff;
        if (diffSearch == "Expert+") diffSearch = "ExpertPlus";
        let diffInfo = curVersion.diffs.find(x => x.characteristic === "Standard" && x.difficulty === diffSearch);
        let info = {
            songHash: curVersion.hash.toUpperCase(),
            songName: bsData.metadata.songName,
            songAuthor: bsData.metadata.songAuthorName,
            levelAuthor: bsData.metadata.levelAuthorName,
            key: bsData.id,
            numNotes: diffInfo ? diffInfo.notes : 0,
            songDiff: diff,
            ssLink: `https://scoresaber.com/leaderboard/${ssInfo.id}`,
            poolId: 0
        };
        let values = [];
        for (const id of data.poolIds) {
            info.poolId = id;
            values.push(Object.values(info));
        }
        try {
            await DatabaseService.query(`INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, \`key\`, numNotes, songDiff, ssLink, poolId) VALUES ?`, [values]);
            return this.ok(res);
        } catch (err) {
            return this.fail(res, err);
        }
    }

    private async getBSData(hash: string, diff: string): Promise<any> {
        try {
            let res: string = await rp.get("https://beatsaver.com/api/maps/hash/" + hash, {
                headers: {
                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                }
            });
            let map = JSON.parse(res) as Beatsaver.map;
            let curVersion = map.versions.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
            let info = {
                songHash: hash,
                songName: map.metadata.songName,
                songAuthor: map.metadata.songAuthorName,
                levelAuthor: map.metadata.levelAuthorName,
                key: map.id,
                numNotes: curVersion.diffs.find(x => x.characteristic === "Standard" && x.difficulty === diff).notes
            };
            return info;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async deleteSong(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!isAuth) return this.unauthorized(res);
        if (!req.body.id) return this.clientError(res, "No song id provided");
        try {
            await DatabaseService.query(`DELETE FROM pool_link WHERE id = ?`, [req.body.id]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deletePool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.hasAdminPerms) || (await auth.tournamentMapPool))) return this.unauthorized(res);
        try {
            await DatabaseService.query(`DELETE FROM map_pools WHERE id = ?`, [req.params.poolId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }
}
