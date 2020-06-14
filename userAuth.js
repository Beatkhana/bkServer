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
            .then(function (discordRes) { return discordRes.json(); })
            .then(function (info) {
            return info;
        })
            .then(function (info) { return fetch('https://discordapp.com/api/users/@me', {
            headers: {
                authorization: info.token_type + " " + info.access_token,
            },
        }); })
            .then(function (userRes) { return userRes.json(); })
            .then(function (data) {
            _this.checkuser(data.id, function (userRes) {
                callback(userRes);
            });
        })
            .catch(function (error) {
            console.error('Error:', error);
        });
    };
    userAuth.prototype.checkuser = function (discordId, callback) {
        if (discordId) {
            var res = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n            FROM users\n            LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n            LEFT JOIN roles r ON r.roleId = ra.roleId\n            WHERE users.discordId = " + discordId + "\n            GROUP BY users.discordId", function (result) {
                result[0].discordId = discordId.toString();
                if (result.length > 0) {
                    result[0].roleIds = result[0].roleIds.split(', ');
                    result[0].roleNames = result[0].roleNames.split(', ');
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
