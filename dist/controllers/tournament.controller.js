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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentController = void 0;
var sharp_1 = __importDefault(require("sharp"));
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
var participants_1 = require("./participants");
// var newStaffRequestSchema = require('../schemas/newStaffRequest.json');
var TournamentController = /** @class */ (function (_super) {
    __extends(TournamentController, _super);
    function TournamentController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TournamentController.prototype.getTournament = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, user, sqlWhere, userRoles, _a, _b, tournament;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        if (!auth.tourneyId)
                            return [2 /*return*/, this.clientError(res, 'Not tournament Id provided')];
                        return [4 /*yield*/, auth.getUser()];
                    case 1:
                        user = _c.sent();
                        sqlWhere = "";
                        userRoles = "";
                        _a = true;
                        return [4 /*yield*/, auth.isAdmin];
                    case 2:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, auth.isStaff];
                    case 3:
                        _b = (_c.sent());
                        _c.label = 4;
                    case 4:
                        switch (_a) {
                            case _b: return [3 /*break*/, 5];
                            case user != null: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 5:
                        sqlWhere = "";
                        return [3 /*break*/, 8];
                    case 6:
                        sqlWhere = "AND (ts.public = 1 OR owner = ? OR tra.role_id IS NOT NULL)";
                        userRoles = "LEFT JOIN tournament_role_assignment tra ON tra.tournament_id = t.id AND tra.user_id = " + user.discordId;
                        return [3 /*break*/, 8];
                    case 7:
                        sqlWhere = "AND ts.public = 1";
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, this.db.aQuery("SELECT t.id as tournamentId,\n        t.name,\n        t.image,\n        t.date as startDate,\n        t.endDate,\n        t.discord,\n        t.twitchLink,\n        t.prize,\n        t.info,\n        CAST(t.owner AS CHAR) as owner,\n        t.archived,\n        t.first,\n        t.second,\n        t.third,\n        t.is_mini,\n        ts.id as settingsId,\n        ts.public_signups,\n        ts.public,\n        ts.state,\n        ts.type,\n        ts.has_bracket,\n        ts.has_map_pool,\n        ts.signup_comment,\n        ts.comment_required,\n        ts.show_signups,\n        ts.bracket_sort_method,\n        ts.bracket_limit,\n        ts.quals_cutoff,\n        ts.show_quals,\n        ts.has_quals,\n        ts.countries,\n        ts.sort_method,\n        ts.standard_cutoff,\n        ts.ta_url\n        FROM tournaments t\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = t.id  \n        " + userRoles + "\n        WHERE t.id = ? " + sqlWhere, [auth.tourneyId, user === null || user === void 0 ? void 0 : user.discordId])];
                    case 9:
                        tournament = _c.sent();
                        if (tournament.length == 0)
                            return [2 /*return*/, this.notFound(res, "Tournament Not Found")];
                        return [2 /*return*/, res.send(tournament)];
                }
            });
        });
    };
    TournamentController.prototype.createTournament = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, data, base64String, base64Img, imgName, savePath, imgErr, result, buf, webpData, hash, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.isTournamentHost];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        base64String = data.image;
                        base64Img = base64String.split(';base64,').pop();
                        imgName = data.imgName;
                        imgName = imgName.toLowerCase();
                        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
                        savePath = this.env == 'development' ? '../app/src/assets/images/' : '../public/assets/images/';
                        imgErr = false;
                        if (!!imgErr) return [3 /*break*/, 9];
                        data.image = imgName;
                        delete data.imgName;
                        try {
                            data.date = this.formatDate(data.date);
                            data.endDate = this.formatDate(data.endDate);
                        }
                        catch (err) {
                            return [2 /*return*/, this.clientError(res, 'Invalid Date')];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO tournaments SET ?", [data])];
                    case 3:
                        result = _a.sent();
                        buf = Buffer.from(base64Img, 'base64');
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 550 })
                                .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 4:
                        webpData = _a.sent();
                        hash = this.randHash(15);
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + (result.insertId + "_" + hash + ".webp"))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.db.aQuery('UPDATE tournaments SET image = ? WHERE id = ?', [result.insertId + "_" + hash + ".webp", result.insertId])];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO tournament_settings SET tournamentId = ?", [result.insertId])];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    TournamentController.prototype.deleteTournament = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.isAdmin];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!auth.tourneyId)
                            return [2 /*return*/, this.clientError(res, "No tournament Id provided")];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.aQuery("DELETE FROM tournaments WHERE id = ?", [auth.tourneyId])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_2)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TournamentController.prototype.updateTournament = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, data, imgName, base64String, base64Img, savePath, buf, webpData, hash, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = { "tournament": req.body, "id": auth.tourneyId };
                        imgName = data.tournament.image;
                        if (!this.isBase64(data.tournament.image)) return [3 /*break*/, 5];
                        base64String = data.tournament.image;
                        base64Img = base64String.split(';base64,').pop();
                        imgName = data.tournament.imgName;
                        imgName = imgName.toLowerCase();
                        imgName = imgName.replace(/\s/g, "");
                        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
                        savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/../public/assets/images/';
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 2:
                        buf = _a.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 550 })
                                .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 3:
                        webpData = _a.sent();
                        hash = this.randHash(15);
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + (data.id + "_" + hash + ".webp"))];
                    case 4:
                        _a.sent();
                        data.tournament.image = data.id + "_" + hash + ".webp";
                        _a.label = 5;
                    case 5:
                        delete data.tournament.imgName;
                        data.tournament.date = this.formatDate(data.tournament.date);
                        data.tournament.endDate = this.formatDate(data.tournament.endDate);
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', data.id])];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, res.send({ data: data.tournament })];
                    case 8:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    TournamentController.prototype.archive = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, data, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.isAdmin];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.isStaff];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        data.tournament = {
                            first: data.first,
                            second: data.second,
                            third: data.third,
                            archived: 1
                        };
                        return [4 /*yield*/, this.db.aQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', data.id])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        err_1 = _b.sent();
                        return [2 /*return*/, this.fail(res, err_1)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    TournamentController.prototype.updateSettings = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, data, curSettings, seeding, seeding, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournament_settings WHERE id = ?", [data.settingsId])];
                    case 2:
                        curSettings = _a.sent();
                        if (!(data.settings.state == 'main_stage' && curSettings[0].state == "qualifiers")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.seedPlayersByQuals(data.tournamentId, data.settings.quals_cutoff)];
                    case 3:
                        seeding = _a.sent();
                        if (!seeding) {
                            return [2 /*return*/, this.fail(res, "Error Creating Seeds")];
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(data.settings.state == 'main_stage' && curSettings[0].state == "awaiting_start")) return [3 /*break*/, 6];
                        if (!(data.settings.type == 'battle_royale')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.seedPlayers(data.tournamentId, data.settings.standard_cutoff, 'date')];
                    case 5:
                        seeding = _a.sent();
                        if (!seeding) {
                            return [2 /*return*/, this.fail(res, "Error Creating Seeds")];
                        }
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery("UPDATE tournament_settings SET ? WHERE ?? = ?", [data.settings, 'id', data.settingsId])];
                    case 7:
                        result = _a.sent();
                        return [2 /*return*/, res.send({ data: result })];
                    case 8:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_4)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // non quals seed
    TournamentController.prototype.seedPlayers = function (tournamentId, cutoff, method) {
        return __awaiter(this, void 0, void 0, function () {
            var updateErr_1, participants, qualified, _i, participants_2, user, i, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(method == 'date')) return [3 /*break*/, 10];
                        updateErr_1 = false;
                        return [4 /*yield*/, participants_1.ParticipantsController.allParticipants(tournamentId)];
                    case 1:
                        participants = _a.sent();
                        participants.sort(function (a, b) { return a.participantId - b.participantId; });
                        qualified = participants.slice(0, cutoff + 1);
                        _i = 0, participants_2 = participants;
                        _a.label = 2;
                    case 2:
                        if (!(_i < participants_2.length)) return [3 /*break*/, 5];
                        user = participants_2[_i];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0, position = 0 WHERE userId = ? AND tournamentId = ?", [user.userId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr_1 = true;
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        i = 0;
                        _a.label = 6;
                    case 6:
                        if (!(i < qualified.length)) return [3 /*break*/, 9];
                        user = qualified[i];
                        console.log(i, user.userId, tournamentId);
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE userId = ? AND tournamentId = ?", [i + 1, user.userId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr_1 = true;
                            })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, !updateErr_1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // quals seed
    TournamentController.prototype.seedPlayersByQuals = function (tournamentId, cutoff) {
        return __awaiter(this, void 0, void 0, function () {
            var pools, qualsPool, qualsScores, _i, qualsScores_1, user, _loop_1, _a, _b, score, _c, qualsScores_2, user, users, i, user, temp, updateErr, _d, users_1, user;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getMapPools(tournamentId)];
                    case 1:
                        pools = _e.sent();
                        qualsPool = Object.values(pools).find(function (x) { return x.is_qualifiers == 1; });
                        return [4 /*yield*/, this.getQualsScores(tournamentId)];
                    case 2:
                        qualsScores = _e.sent();
                        console.log(qualsScores);
                        for (_i = 0, qualsScores_1 = qualsScores; _i < qualsScores_1.length; _i++) {
                            user = qualsScores_1[_i];
                            _loop_1 = function (score) {
                                if (qualsPool.songs.find(function (x) { return x.hash == score.songHash; }).numNotes != 0) {
                                    score.percentage = score.score / (qualsPool.songs.find(function (x) { return x.hash == score.songHash; }).numNotes * 920 - 7245);
                                }
                                else {
                                    score.percentage = 0;
                                }
                                score.score = Math.round(score.score / 2);
                            };
                            for (_a = 0, _b = user.scores; _a < _b.length; _a++) {
                                score = _b[_a];
                                _loop_1(score);
                            }
                        }
                        qualsScores.sort(function (a, b) {
                            var sumA = _this.sumProperty(a.scores, 'score');
                            var sumB = _this.sumProperty(b.scores, 'score');
                            var sumAPer = _this.sumProperty(a.scores, 'percentage');
                            var sumBPer = _this.sumProperty(b.scores, 'percentage');
                            a.avgPercentage = isNaN(sumAPer / qualsPool.songs.length * 100) ? 0 : (sumAPer / qualsPool.songs.length * 100).toFixed(2);
                            b.avgPercentage = isNaN(sumBPer / qualsPool.songs.length * 100) ? 0 : (sumBPer / qualsPool.songs.length * 100).toFixed(2);
                            a.scoreSum = sumA;
                            b.scoreSum = sumB;
                            if (a.forfeit == 1)
                                return 1;
                            if (b.forfeit == 2)
                                return -1;
                            if (b.avgPercentage == a.avgPercentage) {
                                if (sumB == sumA) {
                                    if (a.globalRank == 0)
                                        return 1;
                                    if (b.globalRank == 0)
                                        return -1;
                                    return a.globalRank - b.globalRank;
                                }
                                else {
                                    return sumB - sumA;
                                }
                            }
                            else {
                                return b.avgPercentage - a.avgPercentage;
                            }
                        });
                        _c = 0, qualsScores_2 = qualsScores;
                        _e.label = 3;
                    case 3:
                        if (!(_c < qualsScores_2.length)) return [3 /*break*/, 6];
                        user = qualsScores_2[_c];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE userId = ? AND tournamentId = ?", [user.discordId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr = true;
                            })];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _c++;
                        return [3 /*break*/, 3];
                    case 6:
                        users = [];
                        for (i = 0; i < cutoff; i++) {
                            user = qualsScores[i];
                            temp = {
                                discordId: user.discordId,
                                seed: i + 1
                            };
                            users.push(temp);
                        }
                        updateErr = false;
                        _d = 0, users_1 = users;
                        _e.label = 7;
                    case 7:
                        if (!(_d < users_1.length)) return [3 /*break*/, 10];
                        user = users_1[_d];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE userId = ? AND tournamentId = ?", [user.seed, user.discordId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr = true;
                            })];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9:
                        _d++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, !updateErr];
                }
            });
        });
    };
    // to move to map pool controller when made
    TournamentController.prototype.getMapPools = function (tournamentId, isAuth) {
        if (isAuth === void 0) { isAuth = false; }
        return __awaiter(this, void 0, void 0, function () {
            var sql, poolsRes, mapPools, _i, poolsRes_1, song, songs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?";
                        if (isAuth) {
                            sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?";
                        }
                        return [4 /*yield*/, this.db.asyncPreparedQuery(sql, [tournamentId])];
                    case 1:
                        poolsRes = _a.sent();
                        mapPools = {};
                        for (_i = 0, poolsRes_1 = poolsRes; _i < poolsRes_1.length; _i++) {
                            song = poolsRes_1[_i];
                            if (song.poolId in mapPools) {
                                mapPools[song.poolId].songs.push({
                                    id: song.songId,
                                    hash: song.songHash,
                                    name: song.songName,
                                    songAuthor: song.songAuthor,
                                    levelAuthor: song.levelAuthor,
                                    diff: song.songDiff,
                                    key: song.key,
                                    ssLink: song.ssLink,
                                    numNotes: song.numNotes
                                });
                            }
                            else {
                                songs = [];
                                if (song.songId != null) {
                                    songs = [
                                        {
                                            id: song.songId,
                                            hash: song.songHash,
                                            name: song.songName,
                                            songAuthor: song.songAuthor,
                                            levelAuthor: song.levelAuthor,
                                            diff: song.songDiff,
                                            key: song.key,
                                            ssLink: song.ssLink,
                                            numNotes: song.numNotes
                                        }
                                    ];
                                }
                                mapPools[song.poolId] = {
                                    id: song.poolId,
                                    tournamentId: song.tournamentId,
                                    poolName: song.poolName,
                                    image: song.image,
                                    description: song.description,
                                    live: !!+song.live,
                                    is_qualifiers: song.is_qualifiers,
                                    songs: songs
                                };
                            }
                        }
                        return [2 /*return*/, mapPools];
                }
            });
        });
    };
    // to move to quals controller when done
    TournamentController.prototype.getQualsScores = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var qualsScores, scores, _loop_2, _i, qualsScores_3, score;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.userId as discordId, p.forfeit, q.score, q.percentage, pl.*, u.* FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        LEFT JOIN qualifier_scores q ON p.userId = q.userId \n        LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId\n        LEFT JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND mp.is_qualifiers AND mp.tournamentId = ? AND (q.tournamentId IS NULL OR q.tournamentId = ?)", [id, id, id])];
                    case 1:
                        qualsScores = _a.sent();
                        scores = [];
                        _loop_2 = function (score) {
                            if (scores.some(function (x) { return x.discordId == score.discordId; })) {
                                //do thing
                                var pIndex = scores.findIndex(function (x) { return x.discordId == score.discordId; });
                                scores[pIndex].scores.push({
                                    score: +score.score,
                                    percentage: +score.percentage,
                                    poolId: score.poolId,
                                    songHash: score.songHash,
                                    songName: score.songName,
                                    songAuthor: score.songAuthor,
                                    levelAuthor: score.levelAuthor,
                                    songDiff: score.songDiff,
                                    key: score.key,
                                    ssLink: score.ssLink
                                });
                            }
                            else {
                                var curScore = [];
                                if (score.score != null) {
                                    curScore = [
                                        {
                                            score: +score.score,
                                            percentage: +score.percentage,
                                            poolId: score.poolId,
                                            songHash: score.songHash,
                                            songName: score.songName,
                                            songAuthor: score.songAuthor,
                                            levelAuthor: score.levelAuthor,
                                            songDiff: score.songDiff,
                                            key: score.key,
                                            ssLink: score.ssLink
                                        }
                                    ];
                                }
                                var temp = {
                                    discordId: score.discordId,
                                    ssId: score.ssId,
                                    name: score.name,
                                    twitchName: score.twitchName,
                                    avatar: score.avatar,
                                    globalRank: score.globalRank,
                                    localRank: score.localRank,
                                    country: score.country,
                                    tourneyRank: score.tourneyRank,
                                    TR: score.TR,
                                    pronoun: score.pronoun,
                                    forfeit: score.forfeit,
                                    scores: curScore,
                                };
                                scores.push(temp);
                            }
                        };
                        for (_i = 0, qualsScores_3 = qualsScores; _i < qualsScores_3.length; _i++) {
                            score = qualsScores_3[_i];
                            _loop_2(score);
                        }
                        return [2 /*return*/, scores];
                }
            });
        });
    };
    TournamentController.prototype.signUp = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, settings, curUser, countries, _a, result, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        // if (!auth.userId) return this.clientError(res, "No user logged in");
                        if (!auth.tourneyId)
                            return [2 /*return*/, this.clientError(res, "No Tournament ID provided")];
                        return [4 /*yield*/, this.getSettings(auth.tourneyId)];
                    case 1:
                        settings = _b.sent();
                        if (!settings.public_signups)
                            return [2 /*return*/, this.unauthorized(res, "Signups are not enabled for this tournament.")];
                        return [4 /*yield*/, auth.getUser()];
                    case 2:
                        curUser = _b.sent();
                        countries = null;
                        if (settings.countries != '')
                            countries = settings.countries.toLowerCase().replace(' ', '').split(',');
                        if (countries != null && !countries.includes(curUser.country.toLowerCase()))
                            return [2 /*return*/, this.unauthorized(res, "Signups are country restricted")];
                        _a = req.body.userId;
                        if (!_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 3:
                        _a = !(_b.sent());
                        _b.label = 4;
                    case 4:
                        // if (!req.body.userId && !await auth.hasAdminPerms) req.body.userId = auth.userId;
                        if (_a)
                            req.body.userId = auth.userId;
                        if (!req.body.userId && auth.userId)
                            req.body.userId = auth.userId;
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO participants SET ?", [req.body])];
                    case 6:
                        result = _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 7:
                        error_5 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_5)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    TournamentController.prototype.isSignedUp = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, user, tournamentId, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.getUser()];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, this.clientError(res, "Not logged in")];
                        tournamentId = req.params.tourneyId;
                        if (!tournamentId)
                            return [2 /*return*/, this.clientError(res, "Not tournament ID provided")];
                        return [4 /*yield*/, this.db.aQuery('SELECT * FROM participants WHERE tournamentId = ? AND userId = ?', [tournamentId, user.discordId])];
                    case 2:
                        data = _a.sent();
                        if (data.length == 1)
                            return [2 /*return*/, res.send({ signedUp: true })];
                        if (data.length !== 1)
                            return [2 /*return*/, res.send({ signedUp: false })];
                        return [2 /*return*/];
                }
            });
        });
    };
    // tournament role assignment
    TournamentController.prototype.getStaff = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, users, _loop_3, _i, data_1, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT \n            u.discordId, \n            u.ssId, \n            u.name, \n            u.twitchName, \n            u.avatar, \n            u.globalRank, \n            u.localRank, \n            u.country, \n            u.tourneyRank, \n            u.TR, \n            u.pronoun,\n            tr.role_name,\n            tr.id as role_id\n        FROM users u\n        JOIN tournament_role_assignment tra ON tra.user_id = u.discordId AND tra.tournament_id = ?\n        JOIN tournament_roles tr ON tr.id = tra.role_id", [req.params.tourneyId])];
                    case 1:
                        data = _a.sent();
                        users = [];
                        _loop_3 = function (user) {
                            var existingUser = users.find(function (x) { return x.discordId == user.discordId; });
                            if (existingUser) {
                                existingUser.roles.push({ id: user.role_id, role: user.role_name });
                            }
                            else {
                                users.push({
                                    discordId: user.discordId,
                                    ssId: user.ssId,
                                    name: user.name,
                                    twitchName: user.twitchName,
                                    avatar: user.avatar,
                                    globalRank: user.globalRank,
                                    localRank: user.locaRank,
                                    country: user.country,
                                    tourneyRank: user.tourneyRank,
                                    TR: user.TR,
                                    pronoun: user.pronoun,
                                    roles: [{
                                            id: user.role_id,
                                            role: user.role_name
                                        }]
                                });
                            }
                        };
                        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                            user = data_1[_i];
                            _loop_3(user);
                        }
                        return [2 /*return*/, res.send(users)];
                }
            });
        });
    };
    TournamentController.prototype.addStaff = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, insertData, _loop_4, _i, _a, user, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_b.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.params.tourneyId)
                            return [2 /*return*/, this.clientError(res, "No tournament id provided")];
                        if (!req.body.users)
                            return [2 /*return*/, this.clientError(res, "No users provided")];
                        insertData = [];
                        _loop_4 = function (user) {
                            var curUser = user.roleIds.map(function (x) { return [user.userId, x, req.params.tourneyId]; });
                            insertData = __spreadArrays(insertData, curUser);
                        };
                        for (_i = 0, _a = req.body.users; _i < _a.length; _i++) {
                            user = _a[_i];
                            _loop_4(user);
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.db.aQuery("DELETE FROM tournament_role_assignment WHERE tournament_id = ?", [req.params.tourneyId])];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO tournament_role_assignment (user_id, role_id, tournament_id) VALUES ?", [insertData])];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 5:
                        error_6 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_6)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TournamentController;
}(controller_1.controller));
exports.TournamentController = TournamentController;
