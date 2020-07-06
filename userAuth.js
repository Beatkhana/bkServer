"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
var database_1 = require("./database");
var fetch = require('node-fetch');
var FormData = require('form-data');
var request = require('request');
var userAuth = /** @class */ (function () {
    function userAuth() {
        this.user = {};
        this.db = new database_1.database();
    }
    userAuth.prototype.sendCode = function (code, callback) {
        var _this = this;
        var data = new FormData();
        // beatkhana
        data.append('client_id', '721696709331386398');
        data.append('client_secret', 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6');
        data.append('grant_type', 'authorization_code');
        var env = process.env.NODE_ENV || 'prod';
        var redirect = "";
        if (env == 'prod') {
            redirect = 'https://beatkhana.com/api/discordAuth';
        }
        else {
            redirect = 'http://localhost:4200/api/discordAuth';
        }
        console.log(redirect);
        console.log(env);
        data.append('redirect_uri', redirect);
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
            console.log('discord return');
            console.log(data);
            _this.checkuser(data.id, function (userRes, newUser) {
                callback(userRes, newUser);
            });
        })
            .catch(function (error) {
            console.error('Error:', error);
        });
    };
    userAuth.prototype.checkuser = function (discordId, callback) {
        if (discordId) {
            var res = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n            FROM users\n            LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n            LEFT JOIN roles r ON r.roleId = ra.roleId\n            WHERE users.discordId = " + discordId + "\n            GROUP BY users.discordId", function (err, result) {
                if (result.length > 0) {
                    console.log(result);
                    result[0].discordId = discordId.toString();
                    if (result[0].roleNames != null) {
                        result[0].roleIds = result[0].roleIds.split(', ');
                        result[0].roleNames = result[0].roleNames.split(', ');
                    }
                    else {
                        result[0].roleIds = [];
                        result[0].roleNames = [];
                    }
                    callback(result);
                }
                else {
                    result = [{
                            discordId: discordId.toString()
                        }];
                    callback(result, true);
                }
            });
        }
    };
    userAuth.prototype.newUser = function (data, callback) {
        var _this = this;
        // console.log(data);
        this.getSSData(data.links.scoreSaber.split('u/')[1], function (ssData) {
            var user = {
                discordId: data.discordId,
                ssId: ssData.playerInfo.playerId,
                name: ssData.playerInfo.playerName,
                twitchName: data.links.twitch.split('twitch.tv/')[1],
                avatar: ssData.playerInfo.avatar,
                globalRank: ssData.playerInfo.rank,
                localRank: ssData.playerInfo.countryRank,
                country: ssData.playerInfo.country
            };
            // console.log(user);
            var result = _this.db.preparedQuery("INSERT INTO users SET ?", [user], function (err, result) {
                // console.log(result);
                // console.log(err);
                var loggedUser = user;
                loggedUser.roleIds = [];
                loggedUser.roleNames = [];
                return callback([user]);
            });
        });
    };
    userAuth.prototype.getSSData = function (id, callback) {
        // console.log(`https://new.scoresaber.com/api/player/${id}/basic`);
        // https.get(`https://new.scoresaber.com/api/player/${id}/basic`, (resp) => {
        //     let data = '';
        //     resp.on('end', () => {
        //         console.log(JSON.parse(data).explanation);
        //     });
        // }).on("error", (err) => {
        //     console.log("Error: " + err.message);
        // });
        request("https://new.scoresaber.com/api/player/" + id + "/basic", { json: true }, function (err, res, body) {
            if (err) {
                return console.log(err);
            }
            // console.log(body.url);
            // console.log(body);
            callback(body);
        });
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
