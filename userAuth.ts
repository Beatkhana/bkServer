import { database } from './database';

const fetch = require('node-fetch');
const FormData = require('form-data');

const request = require('request');

export class userAuth {

    userId: string;
    userName: string;
    avatar: string;

    user = {};

    db = new database();

    constructor() { }

    sendCode(code: string, callback: Function) {
        const data = new FormData();

        // beatkhana
        data.append('client_id', '721696709331386398');
        data.append('client_secret', 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6');

        data.append('grant_type', 'authorization_code');

        const env = process.env.NODE_ENV || 'production';
        let redirect = "";
        if (env == 'production') {
            redirect = 'https://beatkhana.com/api/discordAuth';
        } else {
            redirect = 'http://localhost:4200/api/discordAuth';
        }

        // console.log(redirect)
        // console.log(env)

        data.append('redirect_uri', redirect);
        data.append('scope', 'identify');
        data.append('code', code);

        fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: data,
        })
            .then(discordRes => discordRes.json())
            .then(info => {
                return info;
            })
            .then(info => fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${info.token_type} ${info.access_token}`,
                },
            }))
            .then(userRes => userRes.json())
            .then(data => {
                this.checkuser(data.id, (userRes, newUser) => {
                    callback(userRes, newUser);
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    checkuser(discordId, callback) {
        if (discordId) {
            const res = this.db.query(`SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames
            FROM users
            LEFT JOIN roleassignment ra ON ra.userId = users.discordId
            LEFT JOIN roles r ON r.roleId = ra.roleId
            WHERE users.discordId = ${discordId}
            GROUP BY users.discordId`, (err, result: any) => {
                if (result.length > 0) {
                    // console.log(result);
                    result[0].discordId = discordId.toString();
                    if (result[0].roleNames != null) {
                        result[0].roleIds = result[0].roleIds.split(', ');
                        result[0].roleNames = result[0].roleNames.split(', ');
                    } else {
                        result[0].roleIds = [];
                        result[0].roleNames = [];
                    }
                    callback(result);
                } else {
                    result = [{
                        discordId: discordId.toString()
                    }];
                    callback(result, true);
                }
            });
        }
    }

    newUser(data, callback: Function) {
        // console.log(data);
        this.getSSData(data.links.scoreSaber.split('u/')[1], (ssData) => {
            let user = {
                discordId: data.discordId,
                ssId: ssData.playerInfo.playerId,
                name: ssData.playerInfo.playerName,
                twitchName: data.links.twitch.split('twitch.tv/')[1],
                avatar: ssData.playerInfo.avatar,
                globalRank: ssData.playerInfo.rank,
                localRank: ssData.playerInfo.countryRank,
                country: ssData.playerInfo.country,
                pronoun: data.links.pronoun
            };
            // console.log(user);
            const result = this.db.preparedQuery(`INSERT INTO users SET ?`, [user], (err, result: any) => {
                // console.log(result);
                // console.log(err);
                let loggedUser: any = user;
                loggedUser.roleIds = [];
                loggedUser.roleNames = [];

                return callback([user]);
            });
        });
    }

    getSSData(id, callback: Function) {
        request(`https://new.scoresaber.com/api/player/${id}/basic`, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            callback(body);
        });
    }

    update(id, data, callback:Function) {
        const result = this.db.preparedQuery(`UPDATE users SET ? WHERE discordId = ?`, [data, id], (err, result: any) => {
            let flag = false;
            if (err) flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    }

    getUser() {
        if (this.user != {}) {
            return this.user;
        } else {
            return { 'loggedIn': false };
        }
    }

    logOut() {
        this.user = {};
    }


}