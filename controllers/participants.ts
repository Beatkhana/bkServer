import express from "express";
import { database } from "../database";
import { authController } from "./auth.controller";
import { controller } from "./controller";

export class ParticipantsController extends controller {

    async getParticipants(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.tourneyId) return this.clientError(res, "No tournament ID provided");
        let settings = await this.getSettings(auth.tourneyId);
        let battleRoyale = settings.state == 'main_stage' && settings.type == 'battle_royale';
        let isAuth = await auth.hasAdminPerms;
        let userId = auth.userId;
        let result = await this.db.aQuery(`SELECT p.id AS participantId,
        CAST(p.userId AS CHAR) as userId,
        p.forfeit,
        p.seed,
        p.position,
        ${isAuth ? 'p.comment,' : ''}
        ${userId != null ? 'IF(p.userId = "' + userId + '", p.comment, null) as comment,' : ''}
        CAST(\`u\`.\`discordId\` AS CHAR) as discordId,
        CAST(\`u\`.\`ssId\` AS CHAR) as ssId,
        \`u\`.\`name\`,
        \`u\`.\`twitchName\`,
        \`u\`.\`avatar\`,
        \`u\`.\`globalRank\`,
        \`u\`.\`localRank\`,
        \`u\`.\`country\`,
        \`u\`.\`tourneyRank\`,
        \`u\`.\`TR\`,
        \`u\`.\`pronoun\`
        FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE p.tournamentId = ? ${!battleRoyale ? '' : 'AND p.seed != 0'} ${isAuth ? '' : 'AND ts.show_signups = 1'}`, [auth.tourneyId]);
        return res.send(result);
    }

    async getAllParticipants(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        return res.send(ParticipantsController.allParticipants(auth.tourneyId));
    }

    static async allParticipants(id) {
        let db = new database();
        let result = await db.aQuery(`SELECT p.id AS participantId,
        CAST(p.userId AS CHAR) as userId,
        p.forfeit,
        p.seed,
        p.position,
        p.comment,
        CAST(\`u\`.\`discordId\` AS CHAR) as discordId,
        CAST(\`u\`.\`ssId\` AS CHAR) as ssId,
        \`u\`.\`name\`,
        \`u\`.\`twitchName\`,
        \`u\`.\`avatar\`,
        \`u\`.\`globalRank\`,
        \`u\`.\`localRank\`,
        \`u\`.\`country\`,
        \`u\`.\`tourneyRank\`,
        \`u\`.\`TR\`,
        \`u\`.\`pronoun\`
        FROM participants p
        LEFT JOIN users u ON u.discordId = p.userId
        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
        WHERE p.tournamentId = ?`, [id]);
        return result;
    }
    
}