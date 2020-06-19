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

        // bsl
        // data.append('client_id', '670442368385810452');
        // data.append('client_secret', 'akUcvbwH4mIo3scebnz8qE15huReD6l9');

        // beatkhana
        data.append('client_id', '721696709331386398');
        data.append('client_secret', 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6');

        data.append('grant_type', 'authorization_code');


        // data.append('redirect_uri', 'http://localhost:4200/api/discordAuth');
        data.append('redirect_uri', 'https://beatkhanatest.herokuapp.com/api/discordAuth');
        data.append('scope', 'identify');
        data.append('code', code);

        fetch('https://discordapp.com/api/oauth2/token', {
            method: 'POST',
            body: data,
        })
            .then(discordRes => discordRes.json())
            .then(info => {
                return info;
            })
            .then(info => fetch('https://discordapp.com/api/users/@me', {
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
                    result[0].discordId = discordId.toString();
                    result[0].roleIds = result[0].roleIds.split(', ');
                    result[0].roleNames = result[0].roleNames.split(', ');
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
        this.getSSData(data.links.scoreSaber.split('u/')[1], (ssData)=> {
            let user = {
                discordId: data.discordId,
                ssId: ssData.playerInfo.playerId,
                name: ssData.playerInfo.playerName,
                twitchName: data.links.twitch.split('twitch.tv/')[1],
                avatar: ssData.playerInfo.avatar,
                globalRank: ssData.playerInfo.rank,
                localRank: ssData.playerInfo.countryRank,
                country: ssData.playerInfo.country
            };
            console.log(user);
            const result = this.db.preparedQuery(`INSERT INTO users SET ?`, [user], (err, result: any) => {
                console.log(result);
                console.log(err);
                let loggedUser: any = user;
                loggedUser.roleIds = [];
                loggedUser.roleNames = [];

                return callback([user]);
            });
        });
    }

    getSSData(id, callback: Function) {
        // console.log(`https://new.scoresaber.com/api/player/${id}/basic`);
        // https.get(`https://new.scoresaber.com/api/player/${id}/basic`, (resp) => {
        //     let data = '';
        //     resp.on('end', () => {
        //         console.log(JSON.parse(data).explanation);
        //     });

        // }).on("error", (err) => {
        //     console.log("Error: " + err.message);
        // });
        request(`https://new.scoresaber.com/api/player/${id}/basic`, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            // console.log(body.url);
            // console.log(body);
            callback(body);
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