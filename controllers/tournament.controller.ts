import express from "express";
import { staff } from "../models/tournament.models";
import { authController } from "./auth.controller";
import { controller } from "./controller";
// var newStaffRequestSchema = require('../schemas/newStaffRequest.json');

export class TournamentController extends controller {

    async isSignedUp(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let user = await auth.getUser()
        if (!user) return this.clientError(res, "Not logged in");
        let tournamentId = req.params.tourneyId;
        if (!tournamentId) return this.clientError(res, "Not tournament ID provided");
        let data = await this.db.aQuery('SELECT * FROM participants WHERE tournamentId = ? AND userId = ?', [tournamentId, user.discordId]);
        if (data.length == 1) return res.send({ signedUp: true });
        if (data.length !== 1) return res.send({ signedUp: false });
    }

    // tournament role assignment
    async getStaff(req: express.Request, res: express.Response) {
        let data = await this.db.aQuery(`SELECT 
            u.discordId, 
            u.ssId, 
            u.name, 
            u.twitchName, 
            u.avatar, 
            u.globalRank, 
            u.localRank, 
            u.country, 
            u.tourneyRank, 
            u.TR, 
            u.pronoun,
            tr.role_name,
            tr.id as role_id
        FROM users u
        JOIN tournament_role_assignment tra ON tra.user_id = u.discordId AND tra.tournament_id = ?
        JOIN tournament_roles tr ON tr.id = tra.role_id`, [req.params.tourneyId]);
        let users: staff[] = [];
        for (const user of data) {
            let existingUser = users.find(x => x.discordId == user.discordId)
            if (existingUser) {
                existingUser.roles.push({ id: user.role_id, role: user.role_name })
            } else {
                users.push({
                    discordId: user.discordId,
                    ssId: user.ssId,
                    name: user.name,
                    twitchName: user.twitchName,
                    avatar: user.avatar,
                    globalRank: user.globalRank,
                    localRank: user.locaRank,
                    country: user.country,
                    tourneyRank: user.tourneyRank,
                    TR: user.TR,
                    pronoun: user.pronoun,
                    roles: [{
                        id: user.role_id,
                        role: user.role_name
                    }]
                });
            }
        }
        return res.send(users);
    }

    async addStaff(req?: express.Request, res?: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        if (!req.params.tourneyId) return this.clientError(res, "No tournament id provided");
        if (!req.body.users) return this.clientError(res, "No users provided");
        let insertData = [];
        for (const user of req.body.users) {
            let curUser = user.roleIds.map(x => [user.userId, x, req.params.tourneyId]);
            insertData = [...insertData, ...curUser]
        }
        try {
            await this.db.aQuery(`DELETE FROM tournament_role_assignment WHERE tournament_id = ?`, [req.params.tourneyId]);
            await this.db.aQuery(`INSERT INTO tournament_role_assignment (user_id, role_id, tournament_id) VALUES ?`, [insertData]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }



}