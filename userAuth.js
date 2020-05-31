"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
var database_1 = require("./database");
var fetch = require('node-fetch');
var FormData = require('form-data');
var userAuth = /** @class */ (function () {
    function userAuth() {
        this.user = {};
        this.db = new database_1.database();
    }
    userAuth.prototype.sendCode = function (code, callback) {
        var _this = this;
        var data = new FormData();
        data.append('client_id', '670442368385810452');
        data.append('client_secret', 'akUcvbwH4mIo3scebnz8qE15huReD6l9');
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', 'http://localhost:4200/api/discordAuth');
        data.append('scope', 'identify');
        data.append('code', code);
        fetch('https://discordapp.com/api/oauth2/token', {
            method: 'POST',
            body: data,
        })
            .then(function (discordRes) { return discordRes.json(); })
            .then(function (info) {
            // console.log(info);
            return info;
        })
            .then(function (info) { return fetch('https://discordapp.com/api/users/@me', {
            headers: {
                authorization: info.token_type + " " + info.access_token,
            },
        }); })
            .then(function (userRes) { return userRes.json(); })
            .then(function (data) {
            // this.userId = data.id;
            // this.userName = data.username;
            // this.avatar = data.avatar;
            // console.log('Success:', data);
            _this.checkuser(data.id, function (userRes) {
                // console.log(userRes);
                callback(userRes);
            });
        })
            .catch(function (error) {
            console.error('Error:', error);
        });
    };
    userAuth.prototype.checkuser = function (discordId, callback) {
        if (discordId) {
            // console.log(discordId)
            var res = this.db.query("SELECT * FROM users WHERE discordId = " + discordId, function (result) {
                if (result.length > 0) {
                    // this.user = result;
                    callback(result);
                }
            });
        }
    };
    userAuth.prototype.getUser = function () {
        if (this.user != {}) {
            return this.user;
        }
        else {
            return { 'loggedIn': false };
        }
    };
    userAuth.prototype.logOut = function () {
        this.user = {};
    };
    return userAuth;
}());
exports.userAuth = userAuth;
