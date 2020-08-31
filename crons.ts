import { database } from './database';
import { userAuth } from './userAuth';

const CLIENT_ID = '721696709331386398';
const CLIENT_SECRET = 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6';

const env = process.env.NODE_ENV || 'production';

const fetch = require('node-fetch');
const FormData = require('form-data');

export class crons {

    static updateSSData() {
        let db = new database();
        let uA = new userAuth();
        db.query(`SELECT CAST(discordId AS CHAR) as discordId, CAST(ssId AS CHAR) as ssId FROM users`, async (err, res) => {
            // console.log(res)
            // console.log(err)
            let completed = 0;
            for (const user of res) {
                uA.getSSData(user.ssId, (data) => {
                    if (data) {
                        let info = {};
                        if (data.playerInfo.banned == 1) {
                            info = {
                                ssId: data.playerInfo.playerId,
                                country: data.playerInfo.country,
                            };
                        } else {
                            info = {
                                ssId: data.playerInfo.playerId,
                                // name: data.playerInfo.playerName,
                                // avatar: data.playerInfo.avatar,
                                globalRank: data.playerInfo.rank,
                                localRank: data.playerInfo.countryRank,
                                // country: data.playerInfo.country,
                            };
                        }

                        db.preparedQuery('UPDATE users SET ? WHERE discordId = ?', [info, user.discordId], (err, res) => {
                            if (!err) {
                                completed += 1;
                            } else {
                                console.log(err)
                            }
                        })
                    }
                });
                await delay(1000);
            }
            console.log(`Cron completed: Updated ${completed}/${res.length} users`);
        });

        function delay(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    static async updateUsersDiscord() {
        let db = new database();
        const users: any = await db.asyncPreparedQuery('SELECT * FROM users');
        for (const user of users) {
            if (user.refresh_token != null) {
                let data = new FormData();
                data.append('client_id', CLIENT_ID);
                data.append('client_secret', CLIENT_SECRET);

                data.append('grant_type', 'refresh_token');

                let redirect = "";
                if (env == 'production') {
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
                        refresh_token = info.refresh_token;
                        // console.log(info);
                        return info;
                    })
                    .then((info: any) => fetch('https://discord.com/api/users/@me', {
                        headers: {
                            authorization: `${info.token_type} ${info.access_token}`,
                        },
                    }))
                    .then((userRes: any) => userRes.json())
                    .then((userRes: any) => {
                        // console.log(userRes);
                        return userRes;
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
                // console.log(response);
                // console.log(user)
                if(refresh_token != "") {
                    try {
                        await db.asyncPreparedQuery('UPDATE users SET name = ?, avatar = ?, refresh_token = ? WHERE discordId = ?', [response.username, response.avatar, refresh_token, user.discordId]);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        console.log('Discord update complete');
    }
}