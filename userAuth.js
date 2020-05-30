"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
var fetch = require('node-fetch');
var FormData = require('form-data');
var userAuth = /** @class */ (function () {
    function userAuth() {
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
            console.log(info);
            return info;
        })
            .then(function (info) { return fetch('https://discordapp.com/api/users/@me', {
            headers: {
                authorization: info.token_type + " " + info.access_token,
            },
        }); })
            .then(function (userRes) { return userRes.json(); })
            .then(function (data) {
            _this.userId = data.id;
            _this.userName = data.username;
            _this.avatar = data.avatar;
            console.log('Success:', data);
            callback();
        })
            .catch(function (error) {
            console.error('Error:', error);
        });
    };
    userAuth.prototype.getUser = function () {
        return { 'id': this.userId, 'name': this.userName, 'avatar': this.avatar };
    };
    return userAuth;
}());
exports.userAuth = userAuth;
