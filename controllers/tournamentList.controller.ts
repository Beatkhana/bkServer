import express from "express";
import sharp from "sharp";
import { authController } from "./auth.controller";
import { controller } from "./controller";

export class tournamentListController extends controller {

    async getAll(req: express.Request, res: express.Response) {
        let tournaments = await this.db.aQuery(`SELECT CAST(owner AS CHAR) as owner, id, name, image, date as startDate, endDate, discord, twitchLink, prize, info, archived, first, second, third FROM tournaments`);
        return res.send(tournaments);        
    }

    async getActive(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let user = await auth.getUser();
        let sqlWhere = "";
        let userRoles = "";
        switch (true) {
            case await auth.isAdmin || await auth.isStaff:
                sqlWhere = ``;
                break;
            case user != null:
                sqlWhere = `AND (ts.public = 1 OR owner = ? OR tra.role_id IS NOT NULL)`;
                userRoles = `LEFT JOIN tournament_role_assignment tra ON tra.tournament_id = t.id AND tra.user_id = ?`
                break;
            default:
                sqlWhere = `AND ts.public = 1`;
                break;
        }
        let tournaments = await this.db.aQuery(`SELECT t.id as tournamentId,
        t.name,
        t.image,
        t.date as startDate,
        t.endDate,
        t.discord,
        t.twitchLink,
        t.prize,
        t.info,
        CAST(t.owner AS CHAR) as owner,
        t.archived,
        t.first,
        t.second,
        t.third,
        ts.public
        FROM tournaments t
        LEFT JOIN tournament_settings ts ON ts.tournamentId = t.id  
        ${userRoles}
        WHERE archived = 0 AND t.is_mini = 0 ${sqlWhere}`, [user?.discordId, user?.discordId]);
        return res.send(tournaments);
    }

    async getActiveMini(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let user = await auth.getUser();
        let sqlWhere = "";
        let userRoles = "";
        switch (true) {
            case await auth.isAdmin || await auth.isStaff:
                sqlWhere = ``;
                break;
            case user != null:
                sqlWhere = `AND (ts.public = 1 OR owner = ? OR tra.role_id IS NOT NULL)`;
                userRoles = `LEFT JOIN tournament_role_assignment tra ON tra.tournament_id = t.id AND tra.user_id = ?`
                break;
            default:
                sqlWhere = `AND ts.public = 1`;
                break;
        }
        let tournaments = await this.db.aQuery(`SELECT t.id as tournamentId,
        t.name,
        t.image,
        t.date as startDate,
        t.endDate,
        t.discord,
        t.twitchLink,
        t.prize,
        t.info,
        CAST(t.owner AS CHAR) as owner,
        t.archived,
        t.first,
        t.second,
        t.third,
        ts.public
        FROM tournaments t
        LEFT JOIN tournament_settings ts ON ts.tournamentId = t.id  
        ${userRoles}
        WHERE archived = 0 AND t.is_mini = 1 ${sqlWhere}`, [user?.discordId, user?.discordId]);
        return res.send(tournaments);
    }

    async getArchive(req: express.Request, res: express.Response) {
        let page = +req.query.page || 0;
        let limit = +req.query.limit || 25;
        let data: any = await this.db.paginationQuery('tournaments', page, limit , "SELECT CAST(owner AS CHAR) as owner, id as tournamentId, name, image, date as startDate, endDate, discord, twitchLink, prize, info, archived, first, second, third FROM tournaments WHERE archived = 1 ORDER BY endDate DESC");
        return res.send(data.data);
    }
    
}