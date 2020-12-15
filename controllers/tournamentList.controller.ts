import express from "express";
import { controller } from "./controller";

export class tournamentListController extends controller {

    async getArchive(req: express.Request, res: express.Response) {
        let page = +req.query.page || 0;
        let limit = +req.query.limit || 25;
        let data: any = await this.db.paginationQuery('tournaments', page, limit , "SELECT CAST(owner AS CHAR) as owner, id as tournamentId, name, image, \`date\` as startDate, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1 ORDER BY endDate DESC");
        return res.send(data.data);
    }
    
}