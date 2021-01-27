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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
var controller_1 = require("./controller");
var auth_controller_1 = require("./auth.controller");
var sharp_1 = __importDefault(require("sharp"));
var fetch = require('node-fetch');
var FormData = require('form-data');
var request = require('request');
var userController = /** @class */ (function (_super) {
    __extends(userController, _super);
    function userController() {
        var _this = _super.call(this) || this;
        _this.redirect = "";
        if (_this.env == 'production') {
            _this.redirect = encodeURIComponent('https://beatkhana.com/api/discordAuth');
        }
        else {
            _this.redirect = encodeURIComponent('http://localhost:4200/api/discordAuth');
        }
        return _this;
    }
    userController.prototype.me = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var tmp;
            return __generator(this, function (_b) {
                tmp = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
                if (tmp)
                    delete tmp.refresh_token;
                return [2 /*return*/, res.send(tmp)];
            });
        });
    };
    userController.prototype.getUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.id)
                            return [2 /*return*/, this.clientError(res, "No Id provided")];
                        return [4 /*yield*/, this.userById(req.params.id)];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, res.send(user)];
                }
            });
        });
    };
    userController.prototype.allUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, \n        CAST(`users`.`discordId` AS CHAR) as discordId,\n        CAST(`users`.`ssId` AS CHAR) as ssId,\n        `users`.`name`,\n        `users`.`twitchName`,\n        `users`.`avatar`,\n        `users`.`globalRank`,\n        `users`.`localRank`,\n        `users`.`country`,\n        `users`.`tourneyRank`,\n        `users`.`TR`,\n        `users`.`pronoun`, \n        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n        FROM users\n        LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n        LEFT JOIN roles r ON r.roleId = ra.roleId\n        GROUP BY users.discordId")];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, res.send(users)];
                }
            });
        });
    };
    userController.prototype.userBySS = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT u.discordId, u.ssId, u.name, u.twitchName, u.avatar, u.globalRank, u.localRank, u.country, u.tourneyRank, u.TR, u.pronoun, GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tournaments FROM users u\n        LEFT JOIN participants p ON p.userId = u.discordId\n        LEFT JOIN tournaments t ON p.tournamentId = t.id\n        WHERE u.ssId = ?\n        GROUP BY u.discordId", [req.params.id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.send(result)];
                }
            });
        });
    };
    userController.prototype.updateUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, data, id, roleIds, roleError, insert, roleIds_1, roleIds_1_1, roleId, error_1, error_2;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        isAuth = (_b.sent()) || req.params.id == auth.userId;
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        id = req.params.id;
                        roleIds = [];
                        roleError = false;
                        if (!(data.roleIds != null && data.roleIds.length > 0)) return [3 /*break*/, 6];
                        roleIds = data.roleIds;
                        insert = [];
                        try {
                            for (roleIds_1 = __values(roleIds), roleIds_1_1 = roleIds_1.next(); !roleIds_1_1.done; roleIds_1_1 = roleIds_1.next()) {
                                roleId = roleIds_1_1.value;
                                insert.push([id, roleId]);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (roleIds_1_1 && !roleIds_1_1.done && (_a = roleIds_1.return)) _a.call(roleIds_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.db.aQuery("DELETE FROM roleassignment WHERE userId = ?;", [id])];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO roleassignment (userId, roleId) VALUES ?", [insert])];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        delete data.roleIds;
                        return [4 /*yield*/, this.db.aQuery("UPDATE users SET ? WHERE discordId = ?", [data, id])];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_2 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_2)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.updateUserBadges = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, insetData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.params.id)
                            return [2 /*return*/, this.clientError(res, "No user ID provided")];
                        if (!req.body)
                            return [2 /*return*/, this.clientError(res, 'Invalid request')];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery('DELETE FROM badge_assignment WHERE userId = ?', [req.params.id])];
                    case 5:
                        _b.sent();
                        if (!(req.body.length > 0)) return [3 /*break*/, 7];
                        insetData = req.body.map(function (x) { return [x, req.params.id]; });
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO badge_assignment (badgeId, userId) VALUES ?", [insetData])];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: 
                    // console.log(insetData);
                    return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_3 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.createBadge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, data, base64String, base64Img, savePath, buf, webpData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        base64String = data.image;
                        base64Img = base64String.split(';base64,').pop();
                        savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        data.imgName = data.imgName.split('.')[0];
                        data.imgName = data.imgName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        return [4 /*yield*/, this.db.aQuery('INSERT INTO badges (image, description) VALUES (?, ?)', [data.imgName, data.description])];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 4:
                        buf = _a.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 80, height: 30 })
                                .png()
                                // .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 5:
                        webpData = _a.sent();
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + data.imgName + '.png')];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 7:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_4)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.updateBadge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, data, base64String, base64Img, savePath, buf, webpData, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 10, , 11]);
                        data.imgName = data.imgName.split('.')[0];
                        data.imgName = data.imgName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        return [4 /*yield*/, this.db.aQuery('UPDATE badges SET image = ?, description = ? WHERE id = ?', [data.imgName, data.description, req.params.id])];
                    case 5:
                        _b.sent();
                        if (!(data.image != '')) return [3 /*break*/, 9];
                        base64String = data.image;
                        base64Img = base64String.split(';base64,').pop();
                        savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 6:
                        buf = _b.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 80, height: 30 })
                                .png()
                                // .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 7:
                        webpData = _b.sent();
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + data.imgName + '.png')];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [2 /*return*/, this.ok(res)];
                    case 10:
                        error_5 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_5)];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.deleteBadge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery('DELETE FROM badges WHERE id = ?', [req.params.id])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_6 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_6)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.getBadges = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, badges, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery('SELECT * FROM badges')];
                    case 5:
                        badges = _b.sent();
                        return [2 /*return*/, res.send(badges)];
                    case 6:
                        error_7 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_7)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.userById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var userData2, badges, tournaments, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT \n            u.discordId, \n            u.ssId, \n            u.name, \n            u.twitchName, \n            u.avatar, \n            u.globalRank, \n            u.localRank, \n            u.country, \n            u.tourneyRank, \n            u.TR, \n            u.pronoun\n        FROM users u\n        WHERE u.discordId = ?", [id])];
                    case 1:
                        userData2 = _a.sent();
                        return [4 /*yield*/, this.db.aQuery("SELECT b.* FROM badges b\n        LEFT JOIN badge_assignment ba ON ba.badgeId = b.id\n        WHERE ba.userId = ?", [id])];
                    case 2:
                        badges = _a.sent();
                        return [4 /*yield*/, this.db.aQuery("SELECT t.name FROM participants p \n        INNER JOIN tournaments t ON p.tournamentId = t.id\n        INNER JOIN tournament_settings ts ON p.tournamentId = ts.tournamentId AND ts.public = 1\n        WHERE p.userId = ?", [id])];
                    case 3:
                        tournaments = _a.sent();
                        user = userData2[0];
                        if (!user)
                            return [2 /*return*/, null];
                        user.tournaments = tournaments.map(function (x) { return x.name; });
                        user.badges = badges;
                        return [2 /*return*/, user];
                }
            });
        });
    };
    userController.getSSData = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("https://new.scoresaber.com/api/player/" + id + "/full")];
                    case 1:
                        response = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_8 = _a.sent();
                        // console.error(error);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // discord auth
    userController.prototype.login = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                res.redirect("https://discord.com/api/oauth2/authorize?client_id=" + this.CLIENT_ID + "&scope=identify&response_type=code&redirect_uri=" + this.redirect + "&state=" + req.query.url);
                return [2 /*return*/];
            });
        });
    };
    userController.prototype.logOut = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                req.session.destroy(function () { });
                res.redirect('/');
                return [2 /*return*/];
            });
        });
    };
    userController.prototype.discordAuth = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var code, data, env, redirect, refresh_token_1;
            var _this = this;
            return __generator(this, function (_a) {
                if (req.query.code) {
                    code = req.query.code;
                    data = new FormData();
                    // beatkhana
                    data.append('client_id', this.CLIENT_ID);
                    data.append('client_secret', this.CLIENT_SECRET);
                    data.append('grant_type', 'authorization_code');
                    env = process.env.NODE_ENV || 'production';
                    redirect = "";
                    if (env == 'production') {
                        redirect = 'https://beatkhana.com/api/discordAuth';
                    }
                    else {
                        redirect = 'http://localhost:4200/api/discordAuth';
                    }
                    data.append('redirect_uri', redirect);
                    data.append('scope', 'identify');
                    data.append('code', code);
                    refresh_token_1 = null;
                    fetch('https://discord.com/api/oauth2/token', {
                        method: 'POST',
                        body: data,
                    })
                        .then(function (discordRes) { return discordRes.json(); })
                        .then(function (info) {
                        refresh_token_1 = info.refresh_token;
                        return info;
                    })
                        .then(function (info) { return fetch('https://discord.com/api/users/@me', {
                        headers: {
                            authorization: info.token_type + " " + info.access_token,
                        },
                    }); })
                        .then(function (userRes) { return userRes.json(); })
                        .then(function (data) {
                        _this.checkuser(data.id, refresh_token_1, data.avatar, data.username, function (userRes, newUser) {
                            if (!newUser) {
                                req.session.user = userRes;
                                if (req.query.state != undefined) {
                                    res.redirect("" + req.query.state);
                                }
                                else {
                                    res.redirect('/');
                                }
                            }
                            else {
                                req.session.newUsr = userRes;
                                res.redirect('/sign-up');
                            }
                        });
                    })
                        .catch(function (error) {
                        console.error('Error:', error);
                    });
                }
                else {
                    res.redirect('/');
                }
                return [2 /*return*/];
            });
        });
    };
    userController.prototype.checkuser = function (discordId, refreshToken, avatar, name, callback) {
        var _this = this;
        if (discordId) {
            var res = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n            FROM users\n            LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n            LEFT JOIN roles r ON r.roleId = ra.roleId\n            WHERE users.discordId = " + discordId + "\n            GROUP BY users.discordId", function (err, result) { return __awaiter(_this, void 0, void 0, function () {
                var error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(result.length > 0)) return [3 /*break*/, 5];
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
                            error_9 = _a.sent();
                            throw error_9;
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
    userController.prototype.newUser = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var usrData, ssData, user, loggedUser, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.newUsr) === null || _b === void 0 ? void 0 : _b.length) > 0)) return [3 /*break*/, 6];
                        usrData = { links: req.body, discordId: req.session.newUsr[0]['discordId'], refresh_token: req.session.newUsr[0]['refresh_token'], avatar: req.session.newUsr[0]['avatar'], name: req.session.newUsr[0]['name'] };
                        return [4 /*yield*/, userController.getSSData(usrData.links.scoreSaber.split('u/')[1])];
                    case 1:
                        ssData = _c.sent();
                        if (!usrData.avatar) {
                            usrData.avatar = "-";
                        }
                        user = {
                            discordId: usrData.discordId,
                            ssId: ssData.playerInfo.playerId,
                            name: ssData.playerInfo.playerName,
                            twitchName: usrData.links.twitch.split('twitch.tv/')[1],
                            avatar: usrData.avatar,
                            globalRank: ssData.playerInfo.rank,
                            localRank: ssData.playerInfo.countryRank,
                            country: ssData.playerInfo.country,
                            pronoun: usrData.links.pronoun,
                            refresh_token: usrData.refresh_token
                        };
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO users SET ?", [user])];
                    case 3:
                        _c.sent();
                        loggedUser = user;
                        loggedUser.roleIds = [];
                        loggedUser.roleNames = [];
                        return [2 /*return*/, res.send([loggedUser])];
                    case 4:
                        error_10 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_10)];
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, this.clientError(res, "Invalid discord data")];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return userController;
}(controller_1.controller));
exports.userController = userController;
