import * as cron from 'node-cron';
import { User } from '../models/user.model';
import { controller } from './controller';
import { userController } from './user.controller';

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
                if(response?.username != null) {
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
        let updated = 0;
        for (const user of users) {
            let ssData: any = await userController.getSSData(user.ssId);
            // console.log(ssData)
            if(ssData != null && ssData.playerInfo.banned != 1) {
                let info = {
                    globalRank: ssData.playerInfo.rank,
                    localRank: ssData.playerInfo.countryRank
                }
                try {
                    updated++;
                    await this.db.aQuery("UPDATE users SET ? WHERE discordId = ?", [info, user.discordId]);
                } catch (error) {
                    console.error(error);
                    // throw error;
                }
            }
        }
        console.info(`Score Saber update complete: ${updated}/${users.length}`);
    }

}