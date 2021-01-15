import { controller } from "./controller";
import express from "express";
import { authController } from "./auth.controller";
import sharp from 'sharp';
import { User, userAPI } from "../models/user.model";
const fetch = require('node-fetch');

export class userController extends controller {

    async getUser(req: express.Request, res: express.Response) {
        if(!req.params.id) return this.clientError(res, "No Id provided");
        let user = await this.userById(req.params.id);
        return res.send(user);
    }

    async updateUserBadges(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.admin() || await auth.staff())) return this.unauthorized(res);
        if (!req.params.id) return this.clientError(res, "No user ID provided");
        if (!req.body) return this.clientError(res, 'Invalid request');
        try {
            await this.db.aQuery('DELETE FROM badge_assignment WHERE userId = ?', [req.params.id]);
            if (req.body.length > 0) {
                let insetData = req.body.map(x => [x, req.params.id]);
                await this.db.aQuery(`INSERT INTO badge_assignment (badgeId, userId) VALUES ?`, [insetData]);
            }
            // console.log(insetData);
            return this.ok(res);
        } catch (error) {
            return this.fail(res,error);
        }
    }

    async createBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.admin())) return this.unauthorized(res);
        let data = req.body;
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';

        try {
            data.imgName = data.imgName.split('.')[0];
            data.imgName = data.imgName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            await this.db.aQuery('INSERT INTO badges (image, description) VALUES (?, ?)', [data.imgName, data.description]);
            
            const buf = await Buffer.from(base64Img, 'base64');
            const webpData = await sharp(buf)
                .resize({ width: 80, height: 30 })
                .png()
                // .webp({ lossless: true, quality: 50 })
                .toBuffer();
            
            await sharp(webpData)
                .toFile(savePath + data.imgName + '.png');
            return this.ok(res);
        } catch (error) {
            return this.fail(res,error);
        }
    }

    async updateBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.admin() || await auth.staff())) return this.unauthorized(res);

        let data = req.body;
        
        try {
            data.imgName = data.imgName.split('.')[0];
            data.imgName = data.imgName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            await this.db.aQuery('UPDATE badges SET image = ?, description = ? WHERE id = ?', [data.imgName, data.description, req.params.id]);
            
            if (data.image != '') {
                let base64String = data.image;
                let base64Img = base64String.split(';base64,').pop();
        
                let savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';
                const buf = await Buffer.from(base64Img, 'base64');
                const webpData = await sharp(buf)
                    .resize({ width: 80, height: 30 })
                    .png()
                    // .webp({ lossless: true, quality: 50 })
                    .toBuffer();
                
                await sharp(webpData)
                    .toFile(savePath + data.imgName + '.png');

            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res,error);
        }
    }

    async deleteBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.admin() || await auth.staff())) return this.unauthorized(res);

        try {
            await this.db.aQuery('DELETE FROM badges WHERE id = ?', [req.params.id]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getBadges(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.admin() || await auth.staff())) return this.unauthorized(res);
        try {
            let badges = await this.db.aQuery('SELECT * FROM badges');
            return res.send(badges);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    private async userById(id): Promise<userAPI> {
        let userData2 = await this.db.aQuery(`SELECT 
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
            u.pronoun
        FROM users u
        WHERE u.discordId = ?`, [id]);
        let badges = await this.db.aQuery(`SELECT b.* FROM badges b
        LEFT JOIN badge_assignment ba ON ba.badgeId = b.id
        WHERE ba.userId = ?`, [id]);
        let tournaments = await this.db.aQuery(`SELECT t.name FROM participants p 
        INNER JOIN tournaments t ON p.tournamentId = t.id
        INNER JOIN tournament_settings ts ON p.tournamentId = ts.tournamentId AND ts.public = 1
        WHERE p.userId = ?`, [id]);
        let user = userData2[0];
        if (!user) return null;
        user.tournaments = tournaments.map(x => x.name);
        user.badges = badges;
        return user;
    }

    static async getSSData(id: string) {
        const response = await fetch(`https://new.scoresaber.com/api/player/${id}/full`);
        // console.log(await response.text());
        try {
            return await response.json();
        } catch (error) {
            // console.error(error);
            return null;
        }
    }

}