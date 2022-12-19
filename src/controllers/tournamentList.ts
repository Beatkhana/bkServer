import express from "express";
import { TournamentService } from "../services/tournament";
import { authController } from "./auth";
import { controller } from "./controller";

export class tournamentListController extends controller {
    async getActive(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        const user = await auth.getUser();
        const isAuth = (await auth.isAdmin) || (await auth.isStaff);
        const tournaments = await TournamentService.getTournaments({ auth: isAuth, userId: user?.discordId });
        return res.send(tournaments);
    }

    async getActiveMini(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        const user = await auth.getUser();
        const isAuth = (await auth.isAdmin) || (await auth.isStaff);
        const tournaments = await TournamentService.getTournaments({ auth: isAuth, userId: user?.discordId, mini: true });
        return res.send(tournaments);
    }

    async getArchive(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        const user = await auth.getUser();
        const isAuth = (await auth.isAdmin) || (await auth.isStaff);
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (parseInt(req.query.page as string) || 0) * limit;
        const tournaments = await TournamentService.getTournaments({ auth: isAuth, userId: user?.discordId, archived: true, limit, offset });
        return res.send(tournaments);
    }
}
