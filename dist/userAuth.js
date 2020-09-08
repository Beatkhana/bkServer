"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
        var env = process.env.NODE_ENV || 'production';
        var redirect = "";
        if (env == 'production') {
            redirect = 'https://beatkhana.com/api/discordAuth';
        }
        else {
            redirect = 'http://localhost:4200/api/discordAuth';
        }
        // console.log(redirect)
        // console.log(env)
        data.append('redirect_uri', redirect);
        data.append('scope', 'identify');
        data.append('code', code);
        var refresh_token = null;
        fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: data,
        })
            .then(function (discordRes) { return discordRes.json(); })
            .then(function (info) {
            refresh_token = info.refresh_token;
            return info;
        })
            .then(function (info) { return fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: info.token_type + " " + info.access_token,
            },
        }); })
            .then(function (userRes) { return userRes.json(); })
            .then(function (data) {
            _this.checkuser(data.id, refresh_token, data.avatar, data.username, function (userRes, newUser) {
                callback(userRes, newUser);
            });
        })
            .catch(function (error) {
            console.error('Error:', error);
        });
    };
    userAuth.prototype.checkuser = function (discordId, refreshToken, avatar, name, callback) {
        var _this = this;
        if (discordId) {
            var res = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n            FROM users\n            LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n            LEFT JOIN roles r ON r.roleId = ra.roleId\n            WHERE users.discordId = " + discordId + "\n            GROUP BY users.discordId", function (err, result) { return __awaiter(_this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(result.length > 0)) return [3 /*break*/, 5];
                            // console.log(result);
                            result[0].discordId = discordId.toString();
                            if (result[0].roleNames != null) {
                                result[0].roleIds = result[0].roleIds.split(', ');
                                result[0].roleNames = result[0].roleNames.split(', ');
                            }
                            else {
                                result[0].roleIds = [];
                                result[0].roleNames = [];
                            }
                            if (!(refreshToken != null)) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE users SET refresh_token = ? WHERE discordId = ?', [refreshToken, discordId])];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            throw error_1;
                        case 4:
                            callback(result);
                            return [3 /*break*/, 6];
                        case 5:
                            result = [{
                                    discordId: discordId.toString(),
                                    refresh_token: refreshToken,
                                    avatar: avatar,
                                    name: name
                                }];
                            callback(result, true);
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
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
                avatar: data.avatar,
                globalRank: ssData.playerInfo.rank,
                localRank: ssData.playerInfo.countryRank,
                country: ssData.playerInfo.country,
                pronoun: data.links.pronoun,
                refresh_token: data.refresh_token
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
        request("https://new.scoresaber.com/api/player/" + id + "/basic", { json: true }, function (err, res, body) {
            if (err) {
                return console.log(err);
            }
            callback(body);
        });
    };
    userAuth.prototype.update = function (id, data, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var roleIds, roleError, insert_1, _i, roleIds_1, roleId, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roleIds = [];
                        roleError = false;
                        if (!(data.roleIds != null && data.roleIds.length > 0)) return [3 /*break*/, 2];
                        roleIds = data.roleIds;
                        insert_1 = [];
                        for (_i = 0, roleIds_1 = roleIds; _i < roleIds_1.length; _i++) {
                            roleId = roleIds_1[_i];
                            insert_1.push([id, roleId]);
                        }
                        return [4 /*yield*/, this.db.preparedQuery("DELETE FROM roleassignment WHERE userId = ?;", [id], function (err, result) {
                                var flag = false;
                                if (err)
                                    flag = true;
                                if (flag) {
                                    roleError = true;
                                    return callback({
                                        data: result,
                                        flag: flag,
                                        err: err
                                    });
                                }
                                else {
                                    _this.db.preparedQuery("INSERT INTO roleassignment (userId, roleId) VALUES ?", [insert_1], function (err, result) {
                                        var flag = false;
                                        if (err)
                                            flag = true;
                                        if (flag) {
                                            roleError = true;
                                            return callback({
                                                data: result,
                                                flag: flag,
                                                err: err
                                            });
                                        }
                                    });
                                }
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!roleError) {
                            delete data.roleIds;
                            result = this.db.preparedQuery("UPDATE users SET ? WHERE discordId = ?", [data, id], function (err, result) {
                                var flag = false;
                                if (err)
                                    flag = true;
                                return callback({
                                    data: result,
                                    flag: flag,
                                    err: err
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    userAuth.prototype.getUserRoles = function (userId, callback) {
        this.db.preparedQuery("SELECT roleId FROM roleassignment WHERE userId = ?", [userId], function (err, result) {
            callback(result);
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
