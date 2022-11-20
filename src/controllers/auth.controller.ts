import * as express from "express";
import { authRequest } from "../models/models";

import { User } from "../models/user.model";
import DatabaseService from "../services/database";
import { controller } from "./controller";

export class authController extends controller {
    public userId: string | null = null;
    private apiKey: string | null = null;
    public tourneyId: string | null = null;

    // private db: database = new database();

    private adminRoles: number[] = [1];
    private staffRoles: number[] = [1, 2];
    private tournamentHostRoles: number[] = [1, 2, 3];
    // private mapPoolRoles: number[] = [1, 3];
    // private mapPoolHeadRoles: number[] = [1, -1];
    // private coordinatorRoles: number[] = [1, 2, 4];

    constructor(req: express.Request) {
        super();
        this.userId = req.session.user ? req.session?.user[0]?.discordId : undefined;
        this.tourneyId = req.params?.tourneyId;
        this.apiKey = req.headers?.authorization;
    }

    public async getUser(): Promise<User> {
        if (this.userId == undefined) return null;
        let user: any = await DatabaseService.query("SELECT * FROM users WHERE discordId = ?", [this.userId]);
        return user[0];
    }

    async getRoles() {
        if (this.userId != null) {
            let roleIds: any = await DatabaseService.queryFirst("SELECT roleId FROM roleassignment WHERE userId = ?", [this.userId]);
            roleIds = roleIds.map(x => x.roleId);
            return roleIds;
        }
        return null;
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
            let owner = await DatabaseService.queryFirst(`SELECT * FROM tournaments WHERE id = ? AND owner = ?`, [this.tourneyId, this.userId]);
            return !!owner;
        })();
    }

    // api
    public get validApiKey() {
        return (async () => {
            let key = await DatabaseService.queryFirst("SELECT * FROM api_keys WHERE tournamentId = ? AND api_key = ?", [this.tourneyId, this.apiKey]);
            return !!key;
        })();
    }

    // tournament Admin
    public get tournamentAdmin() {
        return (async () => {
            let adminRole = await DatabaseService.queryFirst(`SELECT * FROM tournament_role_assignment WHERE user_id = ? AND tournament_id = ? AND role_id = 1`, [this.userId, this.tourneyId]);
            return !!adminRole;
        })();
    }

    // tournament map pooler
    public get tournamentMapPool() {
        return (async () => {
            let mapPoolRole = await DatabaseService.queryFirst(`SELECT * FROM tournament_role_assignment WHERE user_id = ? AND tournament_id = ? AND role_id = 2`, [this.userId, this.tourneyId]);
            return !!mapPoolRole;
        })();
    }

    // tournament coordinator
    public get tournamentCoordinator() {
        return (async () => {
            let coordinatorRole = await DatabaseService.queryFirst(`SELECT * FROM tournament_role_assignment WHERE user_id = ? AND tournament_id = ? AND role_id = 3`, [this.userId, this.tourneyId]);
            return !!coordinatorRole;
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

    // old method
    public async admin(): Promise<boolean> {
        let userRoles = await this.getRoles();
        if (userRoles != null && userRoles.some(x => this.adminRoles.includes(x))) {
            return true;
        }
        return false;
    }

    public async staff(): Promise<boolean> {
        let userRoles = await this.getRoles();
        if (userRoles != null && userRoles.some(x => this.staffRoles.includes(x))) {
            return true;
        }
        return false;
    }

    // public async mapPool(): Promise<boolean> {
    //     let userRoles = await this.getRoles();
    //     if (userRoles != null && userRoles.some(x => this.mapPoolRoles.includes(x))) {
    //         return true;
    //     }
    //     return false;
    // }

    // public async poolHead(): Promise<boolean> {
    //     let userRoles = await this.getRoles();
    //     if (userRoles != null && userRoles.some(x => this.mapPoolHeadRoles.includes(x))) {
    //         return true;
    //     }
    //     return false;
    // }

    // public async coordinator(): Promise<boolean> {
    //     let userRoles = await this.getRoles();
    //     if (userRoles != null && userRoles.some(x => this.coordinatorRoles.includes(x))) {
    //         return true;
    //     }
    //     return false;
    // }

    public async owner(): Promise<boolean> {
        let owner = await DatabaseService.queryFirst(`SELECT * FROM tournaments WHERE id = ? AND owner = ?`, [this.tourneyId, this.userId]);
        return !!owner;
    }

    public async validKey(): Promise<boolean> {
        let key = await DatabaseService.queryFirst("SELECT * FROM api_keys WHERE tournamentId = ? AND api_key = ?", [this.tourneyId, this.apiKey]);
        return !!key;
    }
}

export function auth() {
    return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
        let original = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let req: express.Request = args[0].req;

            let auth = new authController(req);
            let newArgs: authRequest[] = [
                {
                    req: args[0].req,
                    res: args[0].res,
                    auth: auth
                }
            ];
            return original.apply(this, newArgs);
        };
        return descriptor;
    };
}
