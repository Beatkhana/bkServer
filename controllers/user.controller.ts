import { controller } from "./controller";
import express from "express";
import { authController } from "./auth.controller";
import sharp from 'sharp';
const fetch = require('node-fetch');

export class userController extends controller {

    async createBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.admin())) return this.unauthorized(res);
        let data = req.body;
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/public/assets/badges/';

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
        
                let savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/public/assets/badges/';
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

    static async getSSData(id: string) {
        const response = await fetch(`https://new.scoresaber.com/api/player/${id}/basic`);
        try {
            return await response.json();
        } catch (error) {
            return null;
        }
    }

}