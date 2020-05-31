import { database } from './database';

const fetch = require('node-fetch');
const FormData = require('form-data');

export class userAuth {

    userId: number;
    userName: string;
    avatar: string;

    user = {};

    db = new database();

    constructor() { }

    sendCode(code: string, callback: Function) {
        const data = new FormData();

        data.append('client_id', '670442368385810452');
        data.append('client_secret', 'akUcvbwH4mIo3scebnz8qE15huReD6l9');
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', 'https://beatkhanatest.herokuapp.com/api/discordAuth');
        data.append('scope', 'identify');
        data.append('code', code);

        fetch('https://discordapp.com/api/oauth2/token', {
            method: 'POST',
            body: data,
        })
            .then(discordRes => discordRes.json())
            .then(info => {
                // console.log(info);
                return info;
            })
            .then(info => fetch('https://discordapp.com/api/users/@me', {
                headers: {
                    authorization: `${info.token_type} ${info.access_token}`,
                },
            }))
            .then(userRes => userRes.json())
            .then(data => {
                // this.userId = data.id;
                // this.userName = data.username;
                // this.avatar = data.avatar;
                // console.log('Success:', data);
                this.checkuser(data.id, (userRes) => {
                    // console.log(userRes);
                    callback(userRes);
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    checkuser(discordId, callback) {
        if (discordId) {
            // console.log(discordId)
            const res = this.db.query("SELECT * FROM users WHERE discordId = " + discordId, (result: any) => {
                if (result.length > 0) {
                    // this.user = result;
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