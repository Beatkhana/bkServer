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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crons = void 0;
var database_1 = require("./database");
var userAuth_1 = require("./userAuth");
var CLIENT_ID = '721696709331386398';
var CLIENT_SECRET = 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6';
var env = process.env.NODE_ENV || 'production';
var fetch = require('node-fetch');
var FormData = require('form-data');
var crons = /** @class */ (function () {
    function crons() {
    }
    crons.updateSSData = function () {
        var _this = this;
        try {
            var db_1 = new database_1.database();
            var uA_1 = new userAuth_1.userAuth();
            db_1.query("SELECT CAST(discordId AS CHAR) as discordId, CAST(ssId AS CHAR) as ssId FROM users", function (err, res) { return __awaiter(_this, void 0, void 0, function () {
                var completed, _loop_1, res_1, res_1_1, user, e_1_1;
                var e_1, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            completed = 0;
                            _loop_1 = function (user) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            uA_1.getSSData(user.ssId, function (data) {
                                                var _a, _b, _c, _d;
                                                if (data) {
                                                    var info = {};
                                                    if (((_a = data === null || data === void 0 ? void 0 : data.playerInfo) === null || _a === void 0 ? void 0 : _a.banned) == 1) {
                                                        info = {
                                                            ssId: data.playerInfo.playerId,
                                                            country: data.playerInfo.country,
                                                        };
                                                    }
                                                    else {
                                                        info = {
                                                            ssId: (_b = data.playerInfo) === null || _b === void 0 ? void 0 : _b.playerId,
                                                            // name: data.playerInfo.playerName,
                                                            // avatar: data.playerInfo.avatar,
                                                            globalRank: (_c = data.playerInfo) === null || _c === void 0 ? void 0 : _c.rank,
                                                            localRank: (_d = data.playerInfo) === null || _d === void 0 ? void 0 : _d.countryRank,
                                                        };
                                                    }
                                                    db_1.preparedQuery('UPDATE users SET ? WHERE discordId = ?', [info, user.discordId], function (err, res) {
                                                        if (!err) {
                                                            completed += 1;
                                                        }
                                                        else {
                                                            console.log(err);
                                                        }
                                                    });
                                                }
                                            });
                                            return [4 /*yield*/, delay(1000)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 6, 7, 8]);
                            res_1 = __values(res), res_1_1 = res_1.next();
                            _b.label = 2;
                        case 2:
                            if (!!res_1_1.done) return [3 /*break*/, 5];
                            user = res_1_1.value;
                            return [5 /*yield**/, _loop_1(user)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            res_1_1 = res_1.next();
                            return [3 /*break*/, 2];
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            e_1_1 = _b.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 8];
                        case 7:
                            try {
                                if (res_1_1 && !res_1_1.done && (_a = res_1.return)) _a.call(res_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                            return [7 /*endfinally*/];
                        case 8:
                            console.log("Cron completed: Updated " + completed + "/" + res.length + " users");
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (error) {
            console.error(error);
            return false;
        }
        function delay(ms) {
            return new Promise(function (resolve) { return setTimeout(resolve, ms); });
        }
    };
    crons.updateUsersDiscord = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, users, _loop_2, users_1, users_1_1, user, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = new database_1.database();
                        return [4 /*yield*/, db.asyncPreparedQuery('SELECT * FROM users')];
                    case 1:
                        users = _b.sent();
                        _loop_2 = function (user) {
                            var data, redirect, refresh_token_1, response, error_1, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 6, , 7]);
                                        if (!!(user.refresh_token == null || user.refresh_token == '')) return [3 /*break*/, 5];
                                        data = new FormData();
                                        data.append('client_id', CLIENT_ID);
                                        data.append('client_secret', CLIENT_SECRET);
                                        data.append('grant_type', 'refresh_token');
                                        redirect = "";
                                        if (env == 'production') {
                                            redirect = 'https://beatkhana.com/api/discordAuth';
                                        }
                                        else {
                                            redirect = 'http://localhost:4200/api/discordAuth';
                                        }
                                        // console.log(user);
                                        data.append('redirect_uri', redirect);
                                        data.append('scope', 'identify');
                                        data.append('refresh_token', user.refresh_token);
                                        refresh_token_1 = '';
                                        return [4 /*yield*/, fetch('https://discord.com/api/oauth2/token', {
                                                method: 'POST',
                                                body: data,
                                            })
                                                .then(function (response) { return response.json(); })
                                                .then(function (info) {
                                                refresh_token_1 = info.refresh_token;
                                                // console.log(info);
                                                return info;
                                            })
                                                .then(function (info) { return fetch('https://discord.com/api/users/@me', {
                                                headers: {
                                                    authorization: info.token_type + " " + info.access_token,
                                                },
                                            }); })
                                                .then(function (userRes) { return userRes.json(); })
                                                .then(function (userRes) {
                                                // console.log(userRes);
                                                return userRes;
                                            })
                                                .catch(function (error) {
                                                console.log(error);
                                            })];
                                    case 1:
                                        response = _a.sent();
                                        if (!(refresh_token_1 != "" && !(response.username == '' || response.username == null))) return [3 /*break*/, 5];
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 4, , 5]);
                                        return [4 /*yield*/, db.asyncPreparedQuery('UPDATE users SET name = ?, avatar = ?, refresh_token = ? WHERE discordId = ?', [response.username, response.avatar, refresh_token_1, user.discordId])];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        error_1 = _a.sent();
                                        console.log(error_1);
                                        return [3 /*break*/, 5];
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        error_2 = _a.sent();
                                        console.error(error_2);
                                        return [3 /*break*/, 7];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        };
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        users_1 = __values(users), users_1_1 = users_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!users_1_1.done) return [3 /*break*/, 6];
                        user = users_1_1.value;
                        return [5 /*yield**/, _loop_2(user)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        users_1_1 = users_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (users_1_1 && !users_1_1.done && (_a = users_1.return)) _a.call(users_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        console.log('Discord update complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    return crons;
}());
exports.crons = crons;
