import * as express from "express";
import { IUser } from "../models/user";
import { TournamentService } from "../services/tournament";
import { UserService } from "../services/user";
import { controller } from "./controller";

export class authController extends controller {
    public userId: string | null = null;
    private apiKey: string | null = null;
    public tourneyId: number | null = null;

    private adminRoles: number[] = [1];
    private staffRoles: number[] = [1, 2];
    private tournamentHostRoles: number[] = [1, 2, 3];

    constructor(req: express.Request) {
        super();
        this.userId = req.session.user ? req.session?.user[0]?.discordId : undefined;
        this.tourneyId = +req.params?.tourneyId ?? 0;
        this.apiKey = req.headers?.authorization ?? null;
    }

    public async getUser(): Promise<IUser.User> {
        if (this.userId == undefined) return null;
        return await UserService.getUser(this.userId);
    }

    async getRoles(): Promise<number[]> {
        if (this.userId === null) return [];
        const user = await UserService.getUser(this.userId);
        return user.roles ?? [];
    }

    // getters
    // admin
    public get isAdmin() {
        return (async () => {
            let userRoles = await this.getRoles();
            if (userRoles != null && userRoles.some(x => this.adminRoles.includes(x))) {
                return true;
            }
            return false;
        })();
    }

    // staff
    public get isStaff() {
        return (async () => {
            let userRoles = await this.getRoles();
            if (userRoles != null && userRoles.some(x => this.staffRoles.includes(x))) {
                return true;
            }
            return false;
        })();
    }

    public get isTournamentHost() {
        return (async () => {
            let userRoles = await this.getRoles();
            if (userRoles != null && userRoles.some(x => this.tournamentHostRoles.includes(x))) {
                return true;
            }
            return false;
        })();
    }

    // owner
    public get isOwner() {
        return (async () => {
            return (await TournamentService.getTournamentSimple(this.tourneyId)).owner === this.userId;
        })();
    }

    // api
    public get validApiKey() {
        return (async () => {
            return (await TournamentService.getTournamentAPIKey(this.tourneyId)) === this.apiKey;
        })();
    }

    // tournament Admin
    public get tournamentAdmin() {
        return (async () => {
            return (await TournamentService.getTournamentStaffIds(this.tourneyId, [1])).includes(this.userId);
        })();
    }

    // tournament map pooler
    public get tournamentMapPool() {
        return (async () => {
            return (await TournamentService.getTournamentStaffIds(this.tourneyId, [1, 2])).includes(this.userId);
        })();
    }

    // tournament coordinator
    public get tournamentCoordinator() {
        return (async () => {
            return (await TournamentService.getTournamentStaffIds(this.tourneyId, [1, 2, 3])).includes(this.userId);
        })();
    }

    // admin, owner, api or tournament admin
    public get hasAdminPerms() {
        return (async () => {
            return (await this.isAdmin) || (await this.isOwner) || (await this.validApiKey) || (await this.tournamentAdmin);
        })();
    }

    public isTournamentStaff() {
        return (async () => {
            return (await this.tournamentAdmin) || (await this.tournamentCoordinator) || (await this.tournamentMapPool);
        })();
    }
}
