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
        return res.send(await ParticipantsController.allParticipants(auth.tourneyId));
    }

    async updateParticipant(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(auth.userId || await auth.validApiKey)) return this.clientError(res, "Not Logged in");
        let admin = await auth.hasAdminPerms;
        let sql = "UPDATE participants SET comment = ? WHERE tournamentId = ? AND userId = ?";
        let data = req.body;

        let params = [data.comment, auth.tourneyId, auth.userId];
        if (admin) {
            params = [data.comment, req.params.participantId];
            sql = "UPDATE participants SET comment = ? WHERE id = ?";
        }
        try {
            let result = await this.db.aQuery(sql, params);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async removeParticipant(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        if (!req.body.participantId) return this.clientError(res, "No participant ID supplied");
        try {
            await this.db.aQuery(`DELETE FROM participants WHERE id = ?`, [req.body.participantId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async eliminateParticipant(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!await auth.hasAdminPerms) return this.unauthorized(res);
        if (!req.body.participantId) return this.clientError(res, "Participant ID not provided");
        let settings = await this.getSettings(auth.tourneyId);
        let participants = await ParticipantsController.allParticipants(auth.tourneyId);
        if (settings.type != "battle_royale") return this.clientError(res, "Tournament is not a battle royale");
        let minpos = Math.min.apply(null, participants.map(x => x.position).filter(Boolean));
        let nextPos = settings.standard_cutoff;
        if (minpos != Infinity) nextPos = minpos - 1;
        try {
            await this.db.aQuery("UPDATE participants SET position = ? WHERE id = ?", [nextPos, req.body.participantId]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
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