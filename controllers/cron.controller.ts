import * as cron from 'node-cron';
import { ssResponse } from '../models/scoresaber.model';
import { badge, User } from '../models/user.model';
import { controller } from './controller';
import { userController } from './user.controller';
import sharp from 'sharp';

const FormData = require('form-data');
const fetch = require('node-fetch');

export class cronController extends controller {

    public setCrons() {
        cron.schedule("*/10 * * * *", () => {
            console.info("Running cron - Update discord data");
            this.updateUsersDiscord();
        });
        cron.schedule("0 * * * *", () => {
            console.info("Running cron - Update score saber data");
            this.updateUsersSS();
        });
    }

    private async updateUsersDiscord() {
        const users: User[] = await this.db.aQuery('SELECT * FROM users');
        let updated = 0;
        for (const user of users) {
            if (user.refresh_token != null) {
                let data = new FormData();
                data.append('client_id', this.CLIENT_ID);
                data.append('client_secret', this.CLIENT_SECRET);

                data.append('grant_type', 'refresh_token');

                let redirect = "";
                if (this.env == 'production') {
                    redirect = 'https://beatkhana.com/api/discordAuth';
                } else {
                    redirect = 'http://localhost:4200/api/discordAuth';
                }
                data.append('redirect_uri', redirect);
                data.append('scope', 'identify');
                data.append('refresh_token', user.refresh_token);

                let refresh_token = '';

                let response = await fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    body: data,
                })
                    .then((response: any) => response.json())
                    .then((info: any) => {
                        // console.log(info);
                        if (info.error) {
                            // remove refresh token if invalid
                            this.db.aQuery('UPDATE users SET refresh_token = NULL WHERE discordId = ?', [user.discordId]);
                            throw new Error(info.error);
                        }
                        refresh_token = info.refresh_token;
                        return info;
                    })
                    .then((info: any) => fetch('https://discord.com/api/users/@me', {
                        headers: {
                            authorization: `${info.token_type} ${info.access_token}`,
                        },
                    }))
                    .then((userRes: any) => userRes.json())
                    .then((userRes: any) => userRes)
                    .catch((error: any) => {
                        console.error(error)
                        // throw error;
                    });
                // console.log(response)
                if (response?.username != null) {
                    try {
                        updated++;
                        await this.db.aQuery('UPDATE users SET name = ?, avatar = ?, refresh_token = ? WHERE discordId = ?', [response.username, response.avatar, refresh_token, user.discordId]);
                    } catch (error) {
                        console.error(error);
                        // throw error;
                    }
                }
            }
        }
        console.info(`Discord update complete: ${updated}/${users.length}`);
    }

    private async updateUsersSS() {
        const users: User[] = await this.db.aQuery('SELECT * FROM users');
        let curBadges: badge[] = await this.db.aQuery(`SELECT * FROM badges`);
        let badgeAssignment = await this.db.aQuery(`SELECT * FROM badge_assignment`);
        let badgeLabels = curBadges.map(x => x.image);
        let updated = 0;
        // let ssData: ssResponse = await userController.getSSData("76561198333869741");
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (i !== 0 && i % 60 == 0) await this.delay(60000);
            let ssData: ssResponse = await userController.getSSData(user.ssId);
            // console.log(ssData)
            if (ssData != null && ssData?.playerInfo?.banned != 1) {
                let info = {
                    globalRank: ssData.playerInfo.rank,
                    localRank: ssData.playerInfo.countryRank
                }
                try {
                    await this.db.aQuery("UPDATE users SET ? WHERE discordId = ?", [info, user.discordId]);
                    updated++;
                } catch (error) {
                    console.log(error);
                    // throw error;
                }
                if (ssData.playerInfo.badges.length > 0) {
                    for (const badge of ssData.playerInfo.badges) {
                        let imgName = badge.image.split('.')[0];
                        if (['ranker', 'supporter'].includes(imgName)) continue;
                        if (!badgeLabels.includes(imgName)) {
                            // console.log(badge);
                            let info = await fetch(`https://new.scoresaber.com/api/static/badges/${badge.image}`);
                            let buff = await info.buffer();
                            let savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/public/assets/badges/';
                            const webpData = await sharp(buff)
                                .resize({ width: 80, height: 30 })
                                .png()
                                .toBuffer();

                            await sharp(webpData)
                                .toFile(savePath + imgName + '.png');
                            try {
                                let result: any = await this.db.aQuery(`INSERT INTO badges (image, description) VALUES (?)`, [[imgName, badge.description]]);
                                curBadges.push({
                                    id: result.insertId,
                                    image: imgName,
                                    description: badge.description
                                });
                                badgeLabels.push(imgName);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                        let curBadge = curBadges.find(x => x.image == imgName);
                        if (!badgeAssignment.find(x => x.badgeId == curBadge.id)) {
                            try {
                                let result: any = await this.db.aQuery(`INSERT INTO badge_assignment (badgeId, userId) VALUES (?)`, [[curBadge.id,user.discordId]]);
                                badgeAssignment.push({
                                    id: result.insertId,
                                    badgeId: curBadge.id,
                                    userId: user.discordId
                                });
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                }
            } 
        }
        console.info(`Score Saber update complete: ${updated}/${users.length}`);
    }

}