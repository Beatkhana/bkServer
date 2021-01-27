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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualifiersController = void 0;
var database_1 = require("../database");
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
var QualifiersController = /** @class */ (function (_super) {
    __extends(QualifiersController, _super);
    function QualifiersController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // legacy method
    QualifiersController.prototype.saveScore = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, data, tournamentSettings, userInfo, mapPool, savedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        data = req.body;
                        return [4 /*yield*/, auth.validApiKey];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId])];
                    case 2:
                        tournamentSettings = _a.sent();
                        if (tournamentSettings.length <= 0 || (tournamentSettings[0].state != 'qualifiers' && !!tournamentSettings[0].public))
                            return [2 /*return*/, res.send({ error: 'invalid tournament settings' })];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.*, u.discordId FROM participants p LEFT JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?", [data.ssId, data.tournamentId])];
                    case 3:
                        userInfo = _a.sent();
                        if (userInfo.length <= 0)
                            return [2 /*return*/, res.send({ error: "invalid user" })];
                        delete data.ssId;
                        data.userId = userInfo[0].discordId;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT pl.songHash FROM pool_link pl LEFT JOIN map_pools mp ON pl.poolId = mp.id WHERE mp.tournamentId = ? AND is_qualifiers = 1 AND live = 1", [data.tournamentId])];
                    case 4:
                        mapPool = _a.sent();
                        // console.log(mapPool.some(x=> x.songHash == data.songHash));
                        if (!mapPool.some(function (x) { return x.songHash.toLowerCase() == data.songHash.toLowerCase(); }))
                            return [2 /*return*/, res.send({ error: "invalid song hash" })];
                        data.percentage = +data.score / +data.totalScore;
                        if (data.percentage >= 1)
                            return [2 /*return*/, res.send({ error: "invalid score" })];
                        data.maxScore = data.totalScore;
                        delete data.totalScore;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("INSERT INTO qualifier_scores SET ?\n        ON DUPLICATE KEY UPDATE\n        score = GREATEST(score, VALUES(score)),\n        percentage = GREATEST(percentage, VALUES(percentage)),\n        maxScore = GREATEST(maxScore, VALUES(maxScore))", [data, +data.score, data.percentage, data.maxScore])];
                    case 5:
                        savedData = _a.sent();
                        if (savedData.insertId == 0)
                            return [2 /*return*/, res.send({ error: 'Did not beat score' })];
                        return [2 /*return*/, res.send({ data: "score saved successfully", flag: false })];
                }
            });
        });
    };
    QualifiersController.prototype.getScores = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, id, qualsScores, scores, _loop_1, qualsScores_1, qualsScores_1_1, score;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        id = auth.tourneyId;
                        return [4 /*yield*/, this.db.aQuery("\n        SELECT \n            p.userId as discordId, \n            p.forfeit, \n            q.score, \n            q.percentage, \n            pl.*, \n            u.* \n        FROM participants p\n            LEFT JOIN users u ON u.discordId = p.userId\n            LEFT JOIN qualifier_scores q ON p.userId = q.userId \n            LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId\n            JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)\n            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE \n            ts.show_quals = 1 AND\n            p.tournamentId = ? AND \n            mp.live = 1 AND \n            mp.is_qualifiers AND \n            mp.tournamentId = ? AND \n            (q.tournamentId IS NULL OR q.tournamentId = ?)", [id, id, id])];
                    case 1:
                        qualsScores = _b.sent();
                        scores = [];
                        _loop_1 = function (score) {
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
                        try {
                            for (qualsScores_1 = __values(qualsScores), qualsScores_1_1 = qualsScores_1.next(); !qualsScores_1_1.done; qualsScores_1_1 = qualsScores_1.next()) {
                                score = qualsScores_1_1.value;
                                _loop_1(score);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (qualsScores_1_1 && !qualsScores_1_1.done && (_a = qualsScores_1.return)) _a.call(qualsScores_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [2 /*return*/, res.send(scores)];
                }
            });
        });
    };
    // TA intergration
    QualifiersController.prototype.updateFlags = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, _b, song, e_2_1, error_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_d.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 11, , 12]);
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 8, 9, 10]);
                        _a = __values(req.body), _b = _a.next();
                        _d.label = 4;
                    case 4:
                        if (!!_b.done) return [3 /*break*/, 7];
                        song = _b.value;
                        return [4 /*yield*/, this.db.aQuery("UPDATE event_map_options SET flags = ? WHERE tournament_id = ? AND map_id = ?", [song.flags, auth.tourneyId, song.id])];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_1 = _d.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    QualifiersController.taScore = function (score, tournamentId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, user, levelHash, map, qualScore, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = new database_1.database();
                        return [4 /*yield*/, db.aQuery("SELECT u.discordId FROM participants p JOIN users u ON u.discordId = p.userId WHERE u.ssId = ?", [score.Score.UserId])];
                    case 1:
                        user = _a.sent();
                        if (user.length < 1)
                            return [2 /*return*/];
                        user = user[0];
                        levelHash = score.Score.Parameters.Beatmap.LevelId.replace("custom_level_", "");
                        return [4 /*yield*/, db.aQuery("SELECT * FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE pl.songHash = ? AND mp.tournamentId = ?", [levelHash, tournamentId])];
                    case 2:
                        map = _a.sent();
                        if (map.length < 1)
                            return [2 /*return*/];
                        qualScore = {
                            tournamentId: tournamentId,
                            userId: user.userId,
                            songHash: levelHash,
                            score: score.Score._Score,
                            percentage: 0,
                            maxScore: 0
                        };
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, db.aQuery("INSERT INTO qualifier_scores SET ?", [qualScore])];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error(error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    QualifiersController.updateMaps = function (tournamentId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, maps, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        db = new database_1.database();
                        maps = db.aQuery("SELECT pl.id FROM pool_link pl JOIN map_pools mp ON mp.id = pl.poolId WHERE mp.is_qualifiers = 1 AND tournamentId = ?", [tournamentId]);
                        return [4 /*yield*/, db.aQuery("DELETE FROM event_map_options WHERE tournament_id = ?", [tournamentId])];
                    case 1:
                        _d.sent();
                        _b = (_a = db).aQuery;
                        _c = ["INSERT INTO event_map_options (tournament_id, map_id) VALUES ?"];
                        return [4 /*yield*/, maps];
                    case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([[(_d.sent()).map(function (x) { return [tournamentId, x.id]; })]]))];
                    case 3:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    QualifiersController.prototype.createEvent = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, tournament, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournaments WHERE id = ?", [auth.tourneyId])];
                    case 2:
                        tournament = _a.sent();
                        return [4 /*yield*/, this.getSettings(auth.tourneyId)];
                    case 3:
                        settings = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return QualifiersController;
}(controller_1.controller));
exports.QualifiersController = QualifiersController;
