"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronController = void 0;
var cron = __importStar(require("node-cron"));
var controller_1 = require("./controller");
var user_controller_1 = require("./user.controller");
var sharp_1 = __importDefault(require("sharp"));
var FormData = require('form-data');
var fetch = require('node-fetch');
var cronController = /** @class */ (function (_super) {
    __extends(cronController, _super);
    function cronController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    cronController.prototype.setCrons = function () {
        var _this = this;
        cron.schedule("*/10 * * * *", function () {
            console.info("Running cron - Update discord data");
            _this.updateUsersDiscord();
        });
        cron.schedule("0 * * * *", function () {
            console.info("Running cron - Update score saber data");
            _this.updateUsersSS();
        });
    };
    cronController.prototype.updateUsersDiscord = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, updated, _loop_1, this_1, _i, users_1, user;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery('SELECT * FROM users')];
                    case 1:
                        users = _a.sent();
                        updated = 0;
                        _loop_1 = function (user) {
                            var data, redirect, refresh_token_1, response, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(user.refresh_token != null)) return [3 /*break*/, 5];
                                        data = new FormData();
                                        data.append('client_id', this_1.CLIENT_ID);
                                        data.append('client_secret', this_1.CLIENT_SECRET);
                                        data.append('grant_type', 'refresh_token');
                                        redirect = "";
                                        if (this_1.env == 'production') {
                                            redirect = 'https://beatkhana.com/api/discordAuth';
                                        }
                                        else {
                                            redirect = 'http://localhost:4200/api/discordAuth';
                                        }
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
                                                // console.log(info);
                                                if (info.error) {
                                                    // remove refresh token if invalid
                                                    _this.db.aQuery('UPDATE users SET refresh_token = NULL WHERE discordId = ?', [user.discordId]);
                                                    throw new Error(info.error);
                                                }
                                                refresh_token_1 = info.refresh_token;
                                                return info;
                                            })
                                                .then(function (info) { return fetch('https://discord.com/api/users/@me', {
                                                headers: {
                                                    authorization: info.token_type + " " + info.access_token,
                                                },
                                            }); })
                                                .then(function (userRes) { return userRes.json(); })
                                                .then(function (userRes) { return userRes; })
                                                .catch(function (error) {
                                                console.error(error);
                                                // throw error;
                                            })];
                                    case 1:
                                        response = _a.sent();
                                        if (!((response === null || response === void 0 ? void 0 : response.username) != null)) return [3 /*break*/, 5];
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 4, , 5]);
                                        updated++;
                                        return [4 /*yield*/, this_1.db.aQuery('UPDATE users SET name = ?, avatar = ?, refresh_token = ? WHERE discordId = ?', [response.username, response.avatar, refresh_token_1, user.discordId])];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        error_1 = _a.sent();
                                        console.error(error_1);
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, users_1 = users;
                        _a.label = 2;
                    case 2:
                        if (!(_i < users_1.length)) return [3 /*break*/, 5];
                        user = users_1[_i];
                        return [5 /*yield**/, _loop_1(user)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.info("Discord update complete: " + updated + "/" + users.length);
                        return [2 /*return*/];
                }
            });
        });
    };
    cronController.prototype.updateUsersSS = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var users, curBadges, badgeAssignment, badgeLabels, updated, i, user, ssData, info, error_2, _loop_2, this_2, _i, _b, badge;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery('SELECT * FROM users')];
                    case 1:
                        users = _c.sent();
                        return [4 /*yield*/, this.db.aQuery("SELECT * FROM badges")];
                    case 2:
                        curBadges = _c.sent();
                        return [4 /*yield*/, this.db.aQuery("SELECT * FROM badge_assignment")];
                    case 3:
                        badgeAssignment = _c.sent();
                        badgeLabels = curBadges.map(function (x) { return x.image; });
                        updated = 0;
                        i = 0;
                        _c.label = 4;
                    case 4:
                        if (!(i < users.length)) return [3 /*break*/, 16];
                        user = users[i];
                        if (!(i !== 0 && i % 60 == 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.delay(60000)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [4 /*yield*/, user_controller_1.userController.getSSData(user.ssId)];
                    case 7:
                        ssData = _c.sent();
                        if (!(ssData != null && ((_a = ssData === null || ssData === void 0 ? void 0 : ssData.playerInfo) === null || _a === void 0 ? void 0 : _a.banned) != 1)) return [3 /*break*/, 15];
                        info = {
                            globalRank: ssData.playerInfo.rank,
                            localRank: ssData.playerInfo.countryRank
                        };
                        _c.label = 8;
                    case 8:
                        _c.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.db.aQuery("UPDATE users SET ? WHERE discordId = ?", [info, user.discordId])];
                    case 9:
                        _c.sent();
                        updated++;
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _c.sent();
                        console.log(error_2);
                        return [3 /*break*/, 11];
                    case 11:
                        if (!(ssData.playerInfo.badges.length > 0)) return [3 /*break*/, 15];
                        _loop_2 = function (badge) {
                            var imgName, info_1, buff, savePath, webpData, result, error_3, curBadge, result, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        imgName = badge.image.split('.')[0];
                                        if (['ranker', 'supporter'].includes(imgName))
                                            return [2 /*return*/, "continue"];
                                        if (!!badgeLabels.includes(imgName)) return [3 /*break*/, 8];
                                        return [4 /*yield*/, fetch("https://new.scoresaber.com/api/static/badges/" + badge.image)];
                                    case 1:
                                        info_1 = _a.sent();
                                        return [4 /*yield*/, info_1.buffer()];
                                    case 2:
                                        buff = _a.sent();
                                        savePath = this_2.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';
                                        return [4 /*yield*/, sharp_1.default(buff)
                                                .resize({ width: 80, height: 30 })
                                                .png()
                                                .toBuffer()];
                                    case 3:
                                        webpData = _a.sent();
                                        return [4 /*yield*/, sharp_1.default(webpData)
                                                .toFile(savePath + imgName + '.png')];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5:
                                        _a.trys.push([5, 7, , 8]);
                                        return [4 /*yield*/, this_2.db.aQuery("INSERT INTO badges (image, description) VALUES (?)", [[imgName, badge.description]])];
                                    case 6:
                                        result = _a.sent();
                                        curBadges.push({
                                            id: result.insertId,
                                            image: imgName,
                                            description: badge.description
                                        });
                                        badgeLabels.push(imgName);
                                        return [3 /*break*/, 8];
                                    case 7:
                                        error_3 = _a.sent();
                                        console.error(error_3);
                                        return [3 /*break*/, 8];
                                    case 8:
                                        curBadge = curBadges.find(function (x) { return x.image == imgName; });
                                        if (!!badgeAssignment.find(function (x) { return x.badgeId == curBadge.id; })) return [3 /*break*/, 12];
                                        _a.label = 9;
                                    case 9:
                                        _a.trys.push([9, 11, , 12]);
                                        return [4 /*yield*/, this_2.db.aQuery("INSERT INTO badge_assignment (badgeId, userId) VALUES (?)", [[curBadge.id, user.discordId]])];
                                    case 10:
                                        result = _a.sent();
                                        badgeAssignment.push({
                                            id: result.insertId,
                                            badgeId: curBadge.id,
                                            userId: user.discordId
                                        });
                                        return [3 /*break*/, 12];
                                    case 11:
                                        error_4 = _a.sent();
                                        console.log(error_4);
                                        return [3 /*break*/, 12];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _i = 0, _b = ssData.playerInfo.badges;
                        _c.label = 12;
                    case 12:
                        if (!(_i < _b.length)) return [3 /*break*/, 15];
                        badge = _b[_i];
                        return [5 /*yield**/, _loop_2(badge)];
                    case 13:
                        _c.sent();
                        _c.label = 14;
                    case 14:
                        _i++;
                        return [3 /*break*/, 12];
                    case 15:
                        i++;
                        return [3 /*break*/, 4];
                    case 16:
                        console.info("Score Saber update complete: " + updated + "/" + users.length);
                        return [2 /*return*/];
                }
            });
        });
    };
    return cronController;
}(controller_1.controller));
exports.cronController = cronController;
