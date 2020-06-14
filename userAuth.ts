import { database } from './database';

const fetch = require('node-fetch');
const FormData = require('form-data');

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
                this.checkuser(data.id, (userRes) => {
                    callback(userRes);
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
            GROUP BY users.discordId`, (result: any) => {
                result[0].discordId = discordId.toString();
                if (result.length > 0) {
                    result[0].roleIds = result[0].roleIds.split(', ');
                    result[0].roleNames = result[0].roleNames.split(', ');
                    callback(result);
                }
            });
        }
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