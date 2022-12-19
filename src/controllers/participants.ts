import express from "express";
import { ParticipantService } from "../services/participant";
import { authController } from "./auth";
import { controller } from "./controller";

export class ParticipantsController extends controller {
    async getParticipants(req: express.Request, res: express.Response) {
        const auth = new authController(req);
        if (!auth.tourneyId) return this.clientError(res, "No tournament ID provided");
        const isAuth = await auth.hasAdminPerms;
        const userId = auth.userId;
        const result = await ParticipantService.getParticipants(auth.tourneyId, userId, isAuth);
        return res.send(result);
    }

    async updateAll(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let participants = req.body;
        try {
            await ParticipantService.updateTournamentParticipants(auth.tourneyId, {
                seed: 0,
                forfeit: false
            });
            let promises = [];
            for (const user of participants) {
                let participant = {
                    tournamentId: auth.tourneyId.toString(),
                    userId: user.discordId,
                    comment: user.comment,
                    forfeit: !!user.forfeit,
                    seed: user.seed,
                    position: user.position
                };
                promises.push(ParticipantService.updateParticipant({ tournamentId: auth.tourneyId, userId: user.discordId, data: participant }));
            }
            await Promise.all(promises);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getAllParticipants(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        return res.send(await ParticipantService.getParticipants(auth.tourneyId, undefined, true));
    }

    async updateParticipant(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(auth.userId || (await auth.validApiKey))) return this.clientError(res, "Not Logged in");
        let admin = await auth.hasAdminPerms;
        let data = req.body;
        try {
            if (admin) {
                await ParticipantService.updateParticipant({
                    tournamentId: auth.tourneyId,
                    participantId: +req.params.participantId,
                    data: {
                        comment: data.comment
                    }
                });
            } else {
                await ParticipantService.updateParticipant({
                    tournamentId: auth.tourneyId,
                    userId: auth.userId,
                    data: {
                        comment: data.comment
                    }
                });
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async removeParticipant(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        if (!req.body.participantId) return this.clientError(res, "No participant ID supplied");
        try {
            await ParticipantService.deleteParticipant(+req.body.participantId);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async eliminateParticipant(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        if (!req.body.participantId) return this.clientError(res, "Participant ID not provided");
        let settings = await this.getSettings(auth.tourneyId);
        let participants = await ParticipantService.getParticipants(auth.tourneyId);
        if (settings.type != "battle_royale") return this.clientError(res, "Tournament is not a battle royale");
        let minPos = Math.min.apply(null, participants.map(x => x.position).filter(Boolean));
        let nextPos = settings.standard_cutoff;
        if (minPos != Infinity) nextPos = minPos - 1;
        try {
            await ParticipantService.updateParticipant({
                tournamentId: auth.tourneyId,
                participantId: req.body.participantId,
                data: {
                    position: nextPos
                }
            });
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }
}
