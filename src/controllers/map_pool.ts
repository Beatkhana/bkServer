import axios from "axios";
import express from "express";
import { Beatsaver } from "../models/beatsaver.model";
import { Scoresaber } from "../models/scoresaber.model";
// import DatabaseService from "../services/database";
import { MapPoolService } from "../services/mapPool";
import { TournamentService } from "../services/tournament";
import { authController } from "./auth";
import { controller } from "./controller";

export class MapPoolController extends controller {
    async addPool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.hasAdminPerms) || (await auth.tournamentMapPool))) return this.unauthorized(res);
        try {
            if (req.body.is_qualifiers == 1) {
                await MapPoolService.clearQualsPool(auth.tourneyId);
            }
            await MapPoolService.createPool(req.body);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getPools(req: express.Request, res: express.Response) {
        const auth = new authController(req);
        const isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);

        const mapPools = await MapPoolService.getMapPools(auth.tourneyId, isAuth);
        return res.send(Object.fromEntries(mapPools));
    }

    async updatePool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let poolId = data.poolId;
        delete data.poolId;
        try {
            await MapPoolService.updatePool(poolId, data);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async downloadPool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || (await auth.tournamentMapPool);
        if (!req.params.id) return this.clientError(res, "Please provide a map pool ID");
        const pool = await MapPoolService.getPool(+req.params.id, isAuth);

        if (!pool) return this.clientError(res, "Invalid Map Pool ID");
        const tournament = await TournamentService.getTournament({ id: auth.tourneyId });
        let curSongs = pool.songs.map(e => {
            return { hash: e.hash, difficulties: [{ characteristic: "Standard", name: e.diff == "Expert+" ? "expertPlus" : e.diff.toLowerCase() }] };
        });

        let playlist = {
            AllowDuplicates: false,
            playlistTitle: `${tournament.name}_${pool.poolName}`,
            playlistAuthor: `${tournament.name} Through BeatKhana!`,
            playlistDescription: pool.description,
            image: pool.image,
            songs: curSongs,
            syncURL: `https://beatkhana.com/api/tournament/${pool.tournamentId}/download-pool/${pool.id}`
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
                let ssReq = await axios.get<Scoresaber.LeaderboardInfo>(`https://scoresaber.com/api/leaderboard/by-id/${leaderboardId}/info`);
                if (ssReq.status != 200) throw new Error("Invalid SS Link");
                ssSong = ssReq.data;
            } catch (error) {
                console.error("Scoresaber Song Error: ", error);
                return this.clientError(res, "Can't find song on scoresaber");
            }
            let diffSearch = Scoresaber.getDifficultyLabel(ssSong.difficulty.difficulty);
            if (diffSearch == "Expert+") diffSearch = "ExpertPlus";

            let songInfo = await this.getBSData(ssSong.songHash, diffSearch);

            let values: {
                poolId: any;
                songDiff: string;
                ssLink: any;
                songHash: string;
                songName: string;
                songAuthor: string;
                levelAuthor: string;
                key: string;
                numNotes: number;
            }[] = [];
            for (const id of data.poolIds) {
                const temp = {
                    ...songInfo,
                    poolId: id,
                    songDiff: Scoresaber.getDifficultyLabel(ssSong.difficulty.difficulty),
                    ssLink: data.ssLink
                };
                values.push(temp);
            }
            await MapPoolService.addSongsToPool(values);

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
        let bsData: Beatsaver.map;

        try {
            const bsReq = await axios.get<Beatsaver.map>("https://beatsaver.com/api/maps/id/" + key, {
                headers: {
                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                }
            });
            if (bsReq.status != 200) throw new Error("Invalid BS Link");
            bsData = bsReq.data;
        } catch (error) {
            console.error("Beatsaver Song Error: ", error);
            return this.clientError(res, "Can't find song on beatsaver");
        }

        let curVersion = bsData.versions.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
        let songHash = curVersion.hash;
        let ssInfo: Scoresaber.LeaderboardInfo;
        let ssDiff = Scoresaber.getDifficultyNumber(diff);
        try {
            let ssReq = await axios.get<Scoresaber.LeaderboardInfo>(`https://scoresaber.com/api/leaderboard/by-hash/${songHash}/info?difficulty=${ssDiff}`);
            if (!ssReq.data) throw new Error("Invalid SS Link");
            ssInfo = ssReq.data;
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

        let values: {
            poolId: number;
            songDiff: string;
            ssLink: string;
            songHash: string;
            songName: string;
            songAuthor: string;
            levelAuthor: string;
            key: string;
            numNotes: number;
        }[] = [];
        for (const id of data.poolIds) {
            const temp = {
                ...info,
                poolId: id
            };
            values.push(temp);
        }
        try {
            await MapPoolService.addSongsToPool(values);
            return this.ok(res);
        } catch (err) {
            return this.fail(res, err);
        }
    }

    private async getBSData(hash: string, diff: string) {
        try {
            let res = await axios.get<Beatsaver.map>("https://beatsaver.com/api/maps/hash/" + hash, {
                headers: {
                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                }
            });
            if (!res.data) throw new Error("Invalid BS Link");
            let map = res.data;
            let curVersion = map.versions.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
            console.log(diff);
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
            await MapPoolService.removeSong(req.body.id);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deletePool(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.hasAdminPerms) || (await auth.tournamentMapPool))) return this.unauthorized(res);
        try {
            await MapPoolService.removePool(+req.params.poolId);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }
}
