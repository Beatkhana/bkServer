// import { User } from "../models/user.models";
// import { mapPoolRouter } from "../routers/mapPool.router";
// import database from "../services/db.service";
import * as express from 'express';
import { authRequest } from '../models/models';

import { User } from "../models/user.model";
import { controller } from "./controller";

export class authController extends controller {

    public userId: string | null = null;
    private apiKey: string | null = null;
    private tourneyId: string | null = null;

    // private db: database = new database();

    private adminRoles: number[] = [1];
    private staffRoles: number[] = [1, 2];
    private mapPoolRoles: number[] = [1, 3];
    private mapPoolHeadRoles: number[] = [1, -1];
    private coordinatorRoles: number[] = [1, 2, 4];


    constructor (req: express.Request) {
        super()
        this.userId = req.session.user ? req.session?.user[0]?.discordId : undefined;
        this.tourneyId = req.params?.tourneyId;
        this.apiKey = req.headers?.authorization;
    }

    public async getUser(): Promise<User> {
        let user: any = await this.db.aQuery("SELECT * FROM users WHERE discordId = ?", [this.userId]);
        return user[0];
    }

    private async getRoles() {
        if(this.userId != null) {
            let roleIds: any = await this.db.aQuery('SELECT roleId FROM roleassignment WHERE userId = ?', [this.userId]);
            roleIds = roleIds.map(x => +x.roleId);
            return roleIds;
        }
        return null;
    }

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

    public async mapPool(): Promise<boolean> {
        let userRoles = await this.getRoles();
        if (userRoles != null && userRoles.some(x => this.mapPoolRoles.includes(x))) {
            return true;
        }
        return false;
    }

    public async poolHead(): Promise<boolean> {
        let userRoles = await this.getRoles();
        if (userRoles != null && userRoles.some(x => this.mapPoolHeadRoles.includes(x))) {
            return true;
        }
        return false;
    }


    public async coordinator(): Promise<boolean> {
        let userRoles = await this.getRoles();
        if (userRoles != null && userRoles.some(x => this.coordinatorRoles.includes(x))) {
            return true;
        }
        return false;
    }

    public async owner(): Promise<boolean> {
        let owner = await this.db.aQuery(`SELECT * FROM tournaments WHERE id = ? AND owner = ?`, [this.tourneyId, this.userId]);
        return owner.length == 1;
    }

    public async validKey(): Promise<boolean> {
        let key = await this.db.aQuery("SELECT * FROM api_keys WHERE tournamentId = ? AND api_key = ?", [this.tourneyId, this.apiKey]);
        return key.length == 1;
    }

}

export function auth() {
    return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
        let original = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let req: express.Request = args[0].req;

            let auth = new authController(req)
            let newArgs: authRequest[] = [{
                req: args[0].req,
                res: args[0].res,
                auth: auth
            }];
            return original.apply(this, newArgs);
        }
        return descriptor;
    }
}