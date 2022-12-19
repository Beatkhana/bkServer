import express from "express";
import sharp from "sharp";
import { MapPoolService } from "../services/mapPool";
import { ParticipantService } from "../services/participant";
import { QualifiersService } from "../services/qualifiers";
import { TournamentService } from "../services/tournament";
import { TournamentSettingsService } from "../services/tournament_settings";
import { authController } from "./auth";
import { controller } from "./controller";
import { QualifiersController } from "./qualifiers";
import { TAController } from "./TA/ta.controller";

export class TournamentController extends controller {
    async getTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.tourneyId) return this.clientError(res, "Not tournament Id provided");
        const tournament = await TournamentService.getTournament({
            id: auth.tourneyId,
            auth: (await auth.isAdmin) || (await auth.isStaff),
            userId: auth.userId
        });
        if (!tournament) return this.notFound(res, "Tournament Not Found");
        return res.send([tournament]);
    }

    async createTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.isTournamentHost)) return this.unauthorized(res);
        let data = req.body;
        let base64String = data.image;
        let base64Img = base64String.split(";base64,").pop();

        let imgName = data.imgName;
        imgName = imgName.toLowerCase();
        imgName = imgName.substring(0, imgName.indexOf(".")) + ".webp";
        let savePath = this.env == "development" ? "../app/src/assets/images/" : __dirname + "/../public/assets/images/";

        data.image = imgName;
        delete data.imgName;

        try {
            data.date = this.formatDate(data.date);
            data.endDate = this.formatDate(data.endDate);
        } catch (err) {
            return this.clientError(res, "Invalid Date");
        }

        try {
            const result = await TournamentService.createTournament(data);
            let hash = this.randHash(15);

            await TournamentService.setImage(result.id, `${result.id}_${hash}.webp`);
            await TournamentSettingsService.createBlank(result.id);

            const buf = Buffer.from(base64Img, "base64");
            const webpData = await sharp(buf).resize({ width: 550 }).webp({ lossless: true, quality: 50 }).toBuffer();

            await sharp(webpData).toFile(savePath + `${result.id}_${hash}.webp`);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deleteTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.isAdmin)) return this.unauthorized(res);
        if (!auth.tourneyId) return this.clientError(res, "No tournament Id provided");
        try {
            await TournamentService.deleteTournament(BigInt(auth.tourneyId));
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async updateTournament(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let data = { tournament: req.body, id: auth.tourneyId };
        let imgName: string = data.tournament.image;

        if (this.isBase64(data.tournament.image)) {
            let base64String = data.tournament.image;
            let base64Img = base64String.split(";base64,").pop();

            imgName = data.tournament.imgName;
            imgName = imgName.toLowerCase();
            imgName = imgName.replace(/\s/g, "");
            imgName = imgName.substring(0, imgName.indexOf(".")) + ".webp";
            let savePath = this.env == "development" ? "../app/src/assets/images/" : __dirname + "/../public/assets/images/";

            // sharp
            const buf = Buffer.from(base64Img, "base64");
            const webpData = await sharp(buf).resize({ width: 550 }).webp({ lossless: true, quality: 50 }).toBuffer();
            let hash = this.randHash(15);
            await sharp(webpData).toFile(savePath + `${data.id}_${hash}.webp`);
            data.tournament.image = `${data.id}_${hash}.webp`;
        }

        delete data.tournament.imgName;
        data.tournament.date = this.formatDate(data.tournament.date);
        data.tournament.endDate = this.formatDate(data.tournament.endDate);

        try {
            await TournamentService.updateTournament(BigInt(data.id), data.tournament);
            return res.send({ data: data.tournament });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async archive(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.isAdmin) || (await auth.isStaff))) return this.unauthorized(res);
        let data = req.body;
        try {
            data.tournament = {
                first: data.first,
                second: data.second,
                third: data.third
            };
            await TournamentService.archiveTournament(BigInt(data.id), data.tournament);
            return this.ok(res);
        } catch (err) {
            return this.fail(res, err);
        }
    }

    async updateSettings(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let data = req.body;
        let curSettings = await TournamentSettingsService.getSettings(BigInt(auth.tourneyId));
        if (data.settings.state == "main_stage" && curSettings.state == "qualifiers") {
            let seeding: any = await this.seedPlayersByQuals(data.tournamentId, data.settings.quals_cutoff);
            if (!seeding) {
                return this.fail(res, "Error Creating Seeds");
            }
        } else if (data.settings.state == "main_stage" && curSettings.state == "awaiting_start") {
            if (data.settings.type == "battle_royale") {
                let seeding: any = await this.seedPlayers(data.tournamentId, data.settings.standard_cutoff, "date");
                if (!seeding) {
                    return this.fail(res, "Error Creating Seeds");
                }
            }
        }
        if (data.settings.ta_url == "") data.settings.ta_url = null;
        if (data.settings.ta_url != null && data.settings.ta_url != curSettings.ta_url) {
            TAController.updateConnection(data.tournamentId, data.settings.ta_url, data.settings.ta_password);
        }

        try {
            let result = await TournamentSettingsService.updateSettings(BigInt(auth.tourneyId), data.settings);
            if (data.settings.quals_method == "ta_quals") {
                if (data.settings.state == "qualifiers" && curSettings.state == "awaiting_start") {
                    QualifiersController.createEvent(data.tournamentId);
                } else if (data.settings.state != "qualifiers") {
                    TAController.deleteEvent(data.tournamentId);
                } else if (data.settings.state == "qualifiers") {
                    QualifiersController.updateEvent(data.tournamentId);
                }
            }
            return res.send({ data: result });
        } catch (error) {
            return this.fail(res, error);
        }
    }

    // TODO
    // async recalcQuals(req: express.Request, res: express.Response) {
    //     let auth = new authController(req);
    //     if (!await auth.hasAdminPerms) return this.unauthorized(res);
    //     let data = req.body;
    //     let curSettings: any = await DatabaseService.query("SELECT * FROM tournament_settings WHERE id = ?", [data.settingsId]);
    //     let seeding: any = await this.seedPlayersByQuals(data.tournamentId, data.settings.quals_cutoff);
    //     if (data.settings.state == 'main_stage' && curSettings[0].state == "qualifiers") {
    //         if (!seeding) {
    //             return this.fail(res, "Error Creating Seeds");
    //         }
    //     } else if (data.settings.state == 'main_stage' && curSettings[0].state == "awaiting_start") {
    //         if (data.settings.type == 'battle_royale') {
    //             let seeding: any = await this.seedPlayers(data.tournamentId, data.settings.standard_cutoff, 'date');
    //             if (!seeding) {
    //                 return this.fail(res, "Error Creating Seeds");
    //             }
    //         }
    //     }
    //     return this.ok(res);
    // }

    // non quals seed
    private async seedPlayers(tournamentId: bigint, cutoff: number, method: string) {
        if (method == "date") {
            let updateErr = false;
            let participants = await ParticipantService.getParticipants(tournamentId);
            participants.sort((a, b) => a.participantId - b.participantId);
            let qualified = participants.slice(0, cutoff + 1);
            for (const user of participants) {
                try {
                    await ParticipantService.updateParticipant({ tournamentId, userId: user.userId, data: { seed: 0, position: 0 } });
                } catch (error) {
                    console.error(error);
                    updateErr = true;
                }
            }
            for (let i = 0; i < qualified.length; i++) {
                const user = qualified[i];
                console.log(i, user.userId, tournamentId);
                try {
                    await ParticipantService.updateParticipant({ tournamentId, userId: user.userId, data: { seed: i + 1 } });
                } catch (error) {
                    console.error(error);
                    updateErr = true;
                }
            }
            return !updateErr;
        }
    }

    // quals seed
    async seedPlayersByQuals(tournamentId: bigint, cutoff: number) {
        const pools = await MapPoolService.getMapPools(tournamentId);
        let qualsPool = Array.from(pools.values()).find(x => x.is_qualifiers);
        let qualsScores = await QualifiersService.getScores(tournamentId);
        for (const user of qualsScores) {
            for (const score of user.scores) {
                if (qualsPool.songs.find(x => x.hash == score.songHash).numNotes != 0) {
                    score.percentage = score.score / (qualsPool.songs.find(x => x.hash == score.songHash).numNotes * 920 - 7245);
                } else {
                    score.percentage = 0;
                }
                score.score = Math.round(score.score / 2);
            }
        }
        qualsScores.sort((a, b) => {
            let sumA = this.sumProperty(a.scores, "score");
            let sumB = this.sumProperty(b.scores, "score");
            let sumAPer = this.sumProperty(a.scores, "percentage");
            let sumBPer = this.sumProperty(b.scores, "percentage");
            a.avgPercentage = isNaN((sumAPer / qualsPool.songs.length) * 100) ? 0 : ((sumAPer / qualsPool.songs.length) * 100).toFixed(2);
            b.avgPercentage = isNaN((sumBPer / qualsPool.songs.length) * 100) ? 0 : ((sumBPer / qualsPool.songs.length) * 100).toFixed(2);
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
        let updateErr = false;
        for (const user of qualsScores) {
            try {
                await ParticipantService.updateParticipant({ tournamentId, userId: user.userId, data: { seed: 0 } });
            } catch (error) {
                console.error(error);
                updateErr = true;
            }
        }
        let users = [];
        for (let i = 0; i < cutoff; i++) {
            const user = qualsScores[i];
            let temp = {
                discordId: user.discordId,
                seed: i + 1
            };
            users.push(temp);
        }
        for (const user of users) {
            try {
                await ParticipantService.updateParticipant({ tournamentId, userId: user.userId, data: { seed: user.seed } });
            } catch (error) {
                console.error(error);
                updateErr = true;
            }
        }
        return !updateErr;
    }

    async signUp(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        // if (!auth.userId) return this.clientError(res, "No user logged in");
        if (!auth.tourneyId) return this.clientError(res, "No Tournament ID provided");
        let isAdmin = await auth.hasAdminPerms;
        let settings = await this.getSettings(auth.tourneyId);
        if (!settings.public_signups && !isAdmin) return this.unauthorized(res, "Signups are not enabled for this tournament.");
        let curUser = await auth.getUser();
        let countries = null;
        if (settings.countries != "") countries = settings.countries.toLowerCase().replace(" ", "").split(",");
        if (countries != null && !countries.includes(curUser.country.toLowerCase())) return this.unauthorized(res, "Signups are country restricted");
        // if (!req.body.userId && !await auth.hasAdminPerms) req.body.userId = auth.userId;
        if (req.body.userId && !isAdmin) req.body.userId = auth.userId;
        if (!req.body.userId && auth.userId) req.body.userId = auth.userId;
        try {
            let result = await ParticipantService.createParticipant({
                tournamentId: auth.tourneyId,
                userId: req.body.userId,
                comment: req.body.comment
            });
            if (settings.show_signups) this.emitter.emit("newParticipant", [auth.tourneyId, req.body]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async isSignedUp(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let user = await auth.getUser();
        if (!user) return this.clientError(res, "Not logged in");
        let tournamentId = BigInt(auth.tourneyId);
        if (!tournamentId) return this.clientError(res, "Not tournament ID provided");
        let data = await ParticipantService.getParticipant(tournamentId, user.discordId);
        if (data) return res.send({ signedUp: true });
        return res.send({ signedUp: false });
    }

    // tournament role assignment
    async getStaff(req: express.Request, res: express.Response) {
        const auth = new authController(req);
        const users = await TournamentService.getStaff(BigInt(auth.tourneyId));
        return res.send(users);
    }

    async addStaff(req?: express.Request, res?: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        if (!auth.tourneyId) return this.clientError(res, "No tournament id provided");
        if (!req.body.users) return this.clientError(res, "No users provided");
        let insertData: { user_id: string; role_id: number; tournament_id: bigint }[] = [];
        for (const user of req.body.users) {
            let curUsers: { user_id: string; role_id: number; tournament_id: bigint }[] = user.roleIds.map(x => {
                return { user_id: user.userId, role_id: x, tournament_id: auth.tourneyId };
            });
            insertData = [...insertData, ...curUsers];
        }
        try {
            await TournamentService.clearStaff(BigInt(auth.tourneyId));
            await TournamentService.addStaff(insertData);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }
}
