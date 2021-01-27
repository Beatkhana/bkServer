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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.bracketController = void 0;
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
var fs = require('fs');
var bracketController = /** @class */ (function (_super) {
    __extends(bracketController, _super);
    function bracketController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    bracketController.prototype.getBracket = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var req, res, auth, bracketData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = args.req, res = args.res, auth = args.auth;
                        return [4 /*yield*/, this.bracketData(req.params.id)];
                    case 1:
                        bracketData = _a.sent();
                        return [2 /*return*/, res.send(bracketData)];
                }
            });
        });
    };
    bracketController.prototype.getBracketMatch = function (args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var req, res, auth, match;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        req = args.req, res = args.res, auth = args.auth;
                        return [4 /*yield*/, this.bracketMatchData((_a = req.params) === null || _a === void 0 ? void 0 : _a.tourneyId, (_b = req.params) === null || _b === void 0 ? void 0 : _b.matchId)];
                    case 1:
                        match = _c.sent();
                        if (match) {
                            return [2 /*return*/, res.send(match)];
                        }
                        else {
                            return [2 /*return*/, this.clientError(res, 'Invalid match ID or tournament ID')];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    bracketController.prototype.scheduleMatch = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, time, timeString, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        time = new Date(req.body.matchTime);
                        timeString = time.toISOString().slice(0, 19).replace('T', ' ');
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.aQuery('UPDATE bracket SET time = ? WHERE id = ?', [timeString, req.params.id])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    bracketController.prototype.setBestOf = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.body.best_of)
                            return [2 /*return*/, this.clientError(res, "Please provide a valid best of value")];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.aQuery('UPDATE bracket SET best_of = ? WHERE id = ?', [req.body.best_of, req.params.id])];
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
    bracketController.prototype.saveOverlay = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, savePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.body.img)
                            return [2 /*return*/, this.clientError(res, "Please provide a valid best of value")];
                        try {
                            console.log(req.body.img);
                            savePath = this.env == 'development' ? '../app/src/assets/overlay/' : __dirname + '/../public/assets/overlay/';
                            // let base64Img = req.body.img.split(';base64,').pop();
                            // const buf = await Buffer.from(base64Img, 'base64');
                            // const webpData = await sharp(buf)
                            //     .toFile(savePath+req.params.id+'.svg');
                            fs.writeFile(savePath + req.params.id + '.svg', req.body.img, function (err) {
                                if (err)
                                    return console.log(err);
                                // console.log('Hello World > helloworld.txt');
                            });
                            // await this.db.aQuery('UPDATE bracket SET best_of = ? WHERE id = ?', [req.body.best_of, req.params.id]);
                            return [2 /*return*/, this.ok(res)];
                        }
                        catch (error) {
                            return [2 /*return*/, this.fail(res, error)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    bracketController.prototype.saveBracket = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var auth, id, data, matches, tempMatches, tempMatches_1, tempMatches_1_1, match, tempMatches, tempMatches_2, tempMatches_2_1, match, tempMatches, tempMatches_3, tempMatches_3_1, match, sqlMatches, matches_1, matches_1_1, match, error_3;
            var e_1, _c, e_2, _d, e_3, _e, e_4, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        id = req.params.id;
                        data = req.body;
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_g.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        matches = [];
                        console.log(data);
                        if (!(((_a = data.customPlayers) === null || _a === void 0 ? void 0 : _a.length) > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateBracket(id, data.customPlayers)];
                    case 2:
                        tempMatches = _g.sent();
                        try {
                            for (tempMatches_1 = __values(tempMatches), tempMatches_1_1 = tempMatches_1.next(); !tempMatches_1_1.done; tempMatches_1_1 = tempMatches_1.next()) {
                                match = tempMatches_1_1.value;
                                matches.push({
                                    tournamentId: id,
                                    round: match.round,
                                    matchNum: match.matchNum,
                                    p1: match.p1,
                                    p2: match.p2,
                                    bye: +match.bye || 0
                                });
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (tempMatches_1_1 && !tempMatches_1_1.done && (_c = tempMatches_1.return)) _c.call(tempMatches_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(((_b = data.players) === null || _b === void 0 ? void 0 : _b.length) > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.generateBracket(id, null, data.players)];
                    case 4:
                        tempMatches = _g.sent();
                        try {
                            for (tempMatches_2 = __values(tempMatches), tempMatches_2_1 = tempMatches_2.next(); !tempMatches_2_1.done; tempMatches_2_1 = tempMatches_2.next()) {
                                match = tempMatches_2_1.value;
                                matches.push({
                                    tournamentId: id,
                                    round: match.round,
                                    matchNum: match.matchNum,
                                    p1: match.p1,
                                    p2: match.p2,
                                    bye: +match.bye || 0
                                });
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (tempMatches_2_1 && !tempMatches_2_1.done && (_d = tempMatches_2.return)) _d.call(tempMatches_2);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.generateBracket(id)];
                    case 6:
                        tempMatches = _g.sent();
                        try {
                            for (tempMatches_3 = __values(tempMatches), tempMatches_3_1 = tempMatches_3.next(); !tempMatches_3_1.done; tempMatches_3_1 = tempMatches_3.next()) {
                                match = tempMatches_3_1.value;
                                matches.push({
                                    tournamentId: id,
                                    round: match.round,
                                    matchNum: match.matchNum,
                                    p1: match.p1,
                                    p2: match.p2,
                                    bye: +match.bye || 0
                                });
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (tempMatches_3_1 && !tempMatches_3_1.done && (_e = tempMatches_3.return)) _e.call(tempMatches_3);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        _g.label = 7;
                    case 7:
                        sqlMatches = [];
                        try {
                            for (matches_1 = __values(matches), matches_1_1 = matches_1.next(); !matches_1_1.done; matches_1_1 = matches_1.next()) {
                                match = matches_1_1.value;
                                sqlMatches.push(Object.values(match));
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (matches_1_1 && !matches_1_1.done && (_f = matches_1.return)) _f.call(matches_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        _g.label = 8;
                    case 8:
                        _g.trys.push([8, 11, , 12]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('DELETE FROM bracket WHERE tournamentId = ?', [id])];
                    case 9:
                        _g.sent();
                        return [4 /*yield*/, this.db.asyncPreparedQuery('INSERT INTO bracket (tournamentId, round, matchNum, p1, p2, bye) VALUES ?', [sqlMatches])];
                    case 10:
                        _g.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _g.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 12: return [2 /*return*/, this.ok(res)];
                }
            });
        });
    };
    bracketController.prototype.generateBracket = function (id, players, users) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, rand, participants, temp, i, participants_1, participants_1_1, participant, e_5_1, matches;
            var e_5, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getSettings(id)];
                    case 1:
                        settings = _b.sent();
                        rand = false;
                        if (settings.bracket_sort_method == 'random') {
                            settings.bracket_sort_method = 'discordId';
                            rand = true;
                        }
                        participants = [];
                        if (!(!players && !users)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.id AS participantId,\n            CAST(p.userId AS CHAR) as userId,\n            p.forfeit,\n            p.seed as seed,\n            CAST(`u`.`discordId` AS CHAR) as discordId,\n            CAST(`u`.`ssId` AS CHAR) as ssId,\n            `u`.`name`,\n            `u`.`twitchName`,\n            `u`.`avatar`,\n            `u`.`globalRank` as globalRank,\n            `u`.`localRank`,\n            `u`.`country`,\n            `u`.`tourneyRank` as tournamentRank,\n            `u`.`TR`,\n            `u`.`pronoun`\n            FROM participants p\n            LEFT JOIN users u ON u.discordId = p.userId\n            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n            WHERE p.tournamentId = ? ORDER BY " + settings.bracket_sort_method + "=0, " + settings.bracket_sort_method + " " + (rand ? '' : 'LIMIT ?'), [id, settings.bracket_limit])
                                .catch(function (err) {
                                console.error(err);
                            })];
                    case 2:
                        participants = _b.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(players && !users)) return [3 /*break*/, 4];
                        participants = players;
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(!players && users)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT \n            CAST(`u`.`discordId` AS CHAR) as discordId,\n            CAST(`u`.`ssId` AS CHAR) as ssId,\n            `u`.`name`,\n            `u`.`twitchName`,\n            `u`.`avatar`,\n            `u`.`globalRank` as globalRank,\n            `u`.`localRank`,\n            `u`.`country`,\n            `u`.`tourneyRank` as tournamentRank,\n            `u`.`TR`,\n            `u`.`pronoun`\n            FROM users u\n            WHERE u.discordId IN (?) ORDER BY " + settings.bracket_sort_method + " = 0, " + settings.bracket_sort_method + " " + (rand ? '' : 'LIMIT ?'), [users, settings.bracket_limit])
                                .catch(function (err) {
                                console.error(err);
                            })];
                    case 5:
                        temp = _b.sent();
                        participants = this.mapOrder(temp, users, "discordId");
                        _b.label = 6;
                    case 6:
                        if (rand) {
                            this.shuffle(participants);
                        }
                        if (participants.length > settings.bracket_limit)
                            participants.length = settings.bracket_limit;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id])];
                    case 7:
                        _b.sent();
                        if (!(settings.bracket_sort_method != 'seed' && !players)) return [3 /*break*/, 15];
                        i = 1;
                        _b.label = 8;
                    case 8:
                        _b.trys.push([8, 13, 14, 15]);
                        participants_1 = __values(participants), participants_1_1 = participants_1.next();
                        _b.label = 9;
                    case 9:
                        if (!!participants_1_1.done) return [3 /*break*/, 12];
                        participant = participants_1_1.value;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE id = ?", [i, participant.participantId])];
                    case 10:
                        _b.sent();
                        i++;
                        _b.label = 11;
                    case 11:
                        participants_1_1 = participants_1.next();
                        return [3 /*break*/, 9];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_5_1 = _b.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (participants_1_1 && !participants_1_1.done && (_a = participants_1.return)) _a.call(participants_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        if (!(settings.type == 'single_elim')) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.winnersRoundMatches(settings, participants, !!players)];
                    case 16:
                        matches = _b.sent();
                        return [3 /*break*/, 19];
                    case 17:
                        if (!(settings.type == 'double_elim')) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.doubleElimMatches(settings, participants, !!players)];
                    case 18:
                        matches = _b.sent();
                        _b.label = 19;
                    case 19: return [2 /*return*/, matches];
                }
            });
        });
    };
    bracketController.prototype.winnersRoundMatches = function (settings, participants, custom) {
        if (custom === void 0) { custom = false; }
        return __awaiter(this, void 0, void 0, function () {
            var numParticipants, seeds, matches, rounds, byes, numMatches, byePlayers, roundMatches, totalMatches, i, p1Id, p1Name, p1Avatar, isBye, p2Id, p2Name, p2Avatar, nextMatch, temp, i, x, _loop_1, j, temp, temp;
            return __generator(this, function (_a) {
                numParticipants = participants.length;
                seeds = this.seeding(numParticipants);
                matches = [];
                rounds = Math.log2(numParticipants);
                byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
                numMatches = numParticipants - 1;
                byePlayers = [];
                roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
                totalMatches = roundMatches;
                // console.log(custom);
                // First Round
                for (i = 0; i < seeds.length; i += 2) {
                    p1Id = void 0, p1Name = void 0, p1Avatar = '';
                    isBye = true;
                    if (participants[seeds[i] - 1] != undefined && !custom) {
                        p1Id = participants[seeds[i] - 1].discordId;
                        p1Name = participants[seeds[i] - 1].name;
                        p1Avatar = participants[seeds[i] - 1].avatar;
                    }
                    else if (participants[seeds[i] - 1] != undefined && custom) {
                        p1Id = participants[seeds[i] - 1];
                        p1Name = participants[seeds[i] - 1];
                        p1Avatar = '';
                    }
                    p2Id = void 0, p2Name = void 0, p2Avatar = '';
                    if (participants[seeds[i + 1] - 1] != undefined && !custom) {
                        p2Id = participants[seeds[i + 1] - 1].discordId;
                        p2Name = participants[seeds[i + 1] - 1].name;
                        p2Avatar = participants[seeds[i + 1] - 1].avatar;
                    }
                    else if (participants[seeds[i + 1] - 1] != undefined && custom) {
                        p2Id = participants[seeds[i + 1] - 1];
                        p2Name = participants[seeds[i + 1] - 1];
                        p2Avatar = '';
                    }
                    if (participants[seeds[i + 1] - 1] != undefined && participants[seeds[i] - 1] != undefined) {
                        isBye = false;
                    }
                    if (isBye) {
                        nextMatch = Math.floor((i / 2) / 2) + roundMatches + 1;
                        byePlayers.push({ match: nextMatch, player: p1Id != "" ? p1Id : p2Id });
                    }
                    temp = {
                        id: i / 2 + 1,
                        round: 0,
                        matchNum: i / 2,
                        p1: p1Id,
                        p2: p2Id,
                        p1Score: 0,
                        p2Score: 0,
                        status: '',
                        p1Rank: 0,
                        p2Rank: 0,
                        p1Seed: seeds[i],
                        p2Seed: seeds[i + 1],
                        p1Name: p1Name,
                        p2Name: p2Name,
                        p1Country: '',
                        p2Country: '',
                        p1Avatar: p1Avatar,
                        p2Avatar: p2Avatar,
                        bye: isBye
                    };
                    matches.push(temp);
                }
                // console.log(byePlayers);
                for (i = 1; i < rounds; i++) {
                    x = i + 1;
                    roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
                    _loop_1 = function (j) {
                        var p1Id = void 0, p1Name = void 0, p1Avatar = '';
                        var p2Id = void 0, p2Name = void 0, p2Avatar = '';
                        if (byePlayers.some(function (x) { return x.match == totalMatches + j + 1; })) {
                            var players_1 = byePlayers.filter(function (x) { return x.match == totalMatches + j + 1; });
                            // console.log(players);
                            if (players_1[0] != undefined && !custom) {
                                p1Id = participants.find(function (x) { return x.discordId == players_1[0].player; }).discordId;
                                p1Name = participants.find(function (x) { return x.discordId == players_1[0].player; }).name;
                                p1Avatar = participants.find(function (x) { return x.discordId == players_1[0].player; }).avatar;
                            }
                            if (players_1[1] != undefined && !custom) {
                                p2Id = participants.find(function (x) { return x.discordId == players_1[1].player; }).discordId;
                                p2Name = participants.find(function (x) { return x.discordId == players_1[1].player; }).name;
                                p2Avatar = participants.find(function (x) { return x.discordId == players_1[1].player; }).avatar;
                            }
                        }
                        var temp = {
                            id: totalMatches + j + 1,
                            round: i,
                            matchNum: j,
                            p1: p1Id,
                            p2: p2Id,
                            p1Score: 0,
                            p2Score: 0,
                            status: '',
                            p1Rank: 0,
                            p2Rank: 0,
                            p1Seed: seeds[i],
                            p2Seed: seeds[i + 1],
                            p1Name: p1Name,
                            p2Name: p2Name,
                            p1Country: '',
                            p2Country: '',
                            p1Avatar: p1Avatar,
                            p2Avatar: p2Avatar
                        };
                        matches.push(temp);
                    };
                    for (j = 0; j < roundMatches; j++) {
                        _loop_1(j);
                    }
                    if (settings.type == 'double_elim' && roundMatches == 1) {
                        temp = {
                            id: totalMatches + 2,
                            round: i + 1,
                            matchNum: 0,
                            p1: null,
                            p2: null,
                            p1Score: 0,
                            p2Score: 0,
                            status: '',
                            p1Rank: 0,
                            p2Rank: 0,
                            p1Seed: 0,
                            p2Seed: 0,
                            p1Name: '',
                            p2Name: '',
                            p1Country: '',
                            p2Country: '',
                            p1Avatar: '',
                            p2Avatar: ''
                        };
                        matches.push(temp);
                    }
                    totalMatches += Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
                }
                if (settings.type == 'double_elim') {
                    temp = {
                        id: totalMatches + 2,
                        round: rounds + 1,
                        matchNum: 0,
                        p1: null,
                        p2: null,
                        p1Score: 0,
                        p2Score: 0,
                        status: '',
                        p1Rank: 0,
                        p2Rank: 0,
                        p1Seed: 0,
                        p2Seed: 0,
                        p1Name: '',
                        p2Name: '',
                        p1Country: '',
                        p2Country: '',
                        p1Avatar: '',
                        p2Avatar: ''
                    };
                    matches.push(temp);
                }
                return [2 /*return*/, matches];
            });
        });
    };
    bracketController.prototype.doubleElimMatches = function (settings, participants, custom) {
        if (custom === void 0) { custom = false; }
        return __awaiter(this, void 0, void 0, function () {
            var numParticipants, seeds, matches, rounds, byes, numMatches, byePlayers, roundMatches, totalMatches, winnersMatches, losersMatchesCount, loserIndex, losersMatches, i, temp, allMatches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        numParticipants = participants.length;
                        seeds = this.seeding(numParticipants);
                        matches = [];
                        rounds = Math.log2(numParticipants);
                        byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
                        numMatches = numParticipants - 1;
                        byePlayers = [];
                        roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
                        totalMatches = roundMatches;
                        return [4 /*yield*/, this.winnersRoundMatches(settings, participants, custom)];
                    case 1:
                        winnersMatches = _a.sent();
                        losersMatchesCount = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 4;
                        loserIndex = -1;
                        losersMatches = [];
                        while (losersMatchesCount > 0) {
                            for (i = 0; i < losersMatchesCount; i++) {
                                temp = {
                                    id: winnersMatches.length + i + 1,
                                    round: loserIndex,
                                    matchNum: i,
                                    p1: null,
                                    p2: null,
                                    p1Score: 0,
                                    p2Score: 0,
                                    status: '',
                                    p1Rank: 0,
                                    p2Rank: 0,
                                    p1Seed: 0,
                                    p2Seed: 0,
                                    p1Name: '',
                                    p2Name: '',
                                    p1Country: '',
                                    p2Country: '',
                                    p1Avatar: '',
                                    p2Avatar: ''
                                };
                                losersMatches.push(temp);
                            }
                            if (loserIndex % 2 == 0) {
                                losersMatchesCount = Math.floor(losersMatchesCount / 2);
                            }
                            loserIndex--;
                        }
                        allMatches = winnersMatches.concat(losersMatches);
                        return [2 /*return*/, allMatches];
                }
            });
        });
    };
    bracketController.prototype.updateBracket = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var req, res, auth, id, data, isAuth, error_4, tmpMatch, error_5, settings, bracket, thisMatch, winner, loser, winnersRound_1, maxRound, winnersMatch_1, playerIdentifier, nextMatch, tmpMatch_1, error_6, tmpMatch_2, winnersRound_2, maxRound, winnersMatch_2, winnerIdentifier, nextMatch, tmpMatch_3, error_7, loserRound_1, loserMatch_1, loserIdentifier, loserNextMatch, tmpMatch_4, error_8, winnersMatch_3, nextMatch, tmpMatch_5, error_9, winnersMatch_4, nextMatch, tmpMatch_6, error_10, winnersRound_3, minRound, maxRound, winnersMatch_5, winnerIdentifier, nextMatch, error_11, tmpMatch_7, tmpMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = args.req, res = args.res, auth = args.auth;
                        id = req.params.tourneyId;
                        data = req.body;
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        isAuth = _a.sent();
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!(data.status == 'update')) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "in_progress" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId])];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_4)];
                    case 5: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 6:
                        tmpMatch = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch);
                        return [2 /*return*/, this.ok(res)];
                    case 7:
                        if (!(data.status == 'complete')) return [3 /*break*/, 51];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "complete" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId])];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_5)];
                    case 11: return [4 /*yield*/, this.getSettings(id)];
                    case 12:
                        settings = _a.sent();
                        return [4 /*yield*/, this.bracketDataOld(id)];
                    case 13:
                        bracket = _a.sent();
                        thisMatch = bracket.find(function (x) { return x.id == data.matchId; });
                        winner = '';
                        loser = '';
                        if (data.p1Score > data.p2Score) {
                            winner = thisMatch.p1;
                            loser = thisMatch.p2;
                        }
                        else {
                            winner = thisMatch.p2;
                            loser = thisMatch.p1;
                        }
                        if (!(settings.type == 'single_elim')) return [3 /*break*/, 20];
                        winnersRound_1 = thisMatch.round + 1;
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        if (!(winnersRound_1 <= maxRound)) return [3 /*break*/, 18];
                        winnersMatch_1 = Math.floor(thisMatch.matchNum / 2);
                        playerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_1 && x.matchNum == winnersMatch_1; });
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 17, , 18]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [playerIdentifier, winner, nextMatch.id])];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 16:
                        tmpMatch_1 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_1);
                        return [3 /*break*/, 18];
                    case 17:
                        error_6 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_6)];
                    case 18: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 19:
                        tmpMatch_2 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_2);
                        return [2 /*return*/, this.ok(res)];
                    case 20:
                        if (!(settings.type == 'double_elim')) return [3 /*break*/, 49];
                        if (!(thisMatch.round >= 0)) return [3 /*break*/, 43];
                        winnersRound_2 = thisMatch.round + 1;
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        if (!(winnersRound_2 < maxRound)) return [3 /*break*/, 31];
                        winnersMatch_2 = Math.floor(thisMatch.matchNum / 2);
                        winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_2; });
                        _a.label = 21;
                    case 21:
                        _a.trys.push([21, 24, , 25]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 23:
                        tmpMatch_3 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_3);
                        return [3 /*break*/, 25];
                    case 24:
                        error_7 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_7)];
                    case 25:
                        loserRound_1 = -1;
                        loserMatch_1 = Math.floor(thisMatch.matchNum / 2);
                        loserIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        if (thisMatch.round > 0) {
                            loserIdentifier = 'p1';
                            loserRound_1 = thisMatch.round * -2;
                            if ((thisMatch.round % 3) % 2 == 0) {
                                loserMatch_1 = thisMatch.matchNum % 2 == 0 ? thisMatch.matchNum + 1 : thisMatch.matchNum - 1;
                            }
                            else {
                                loserMatch_1 = bracket.filter(function (x) { return x.round == 0; }).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1;
                            }
                            if (maxRound - 2 == thisMatch.round) {
                                loserMatch_1 = 0;
                            }
                        }
                        loserNextMatch = bracket.find(function (x) { return x.round == loserRound_1 && x.matchNum == loserMatch_1; });
                        _a.label = 26;
                    case 26:
                        _a.trys.push([26, 29, , 30]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [loserIdentifier, loser, loserNextMatch.id])];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, loserNextMatch.id)];
                    case 28:
                        tmpMatch_4 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_4);
                        return [3 /*break*/, 30];
                    case 29:
                        error_8 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_8)];
                    case 30: return [3 /*break*/, 42];
                    case 31:
                        if (!(winnersRound_2 == maxRound && data.p1Score < data.p2Score)) return [3 /*break*/, 37];
                        winnersMatch_3 = 0;
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_3; });
                        _a.label = 32;
                    case 32:
                        _a.trys.push([32, 35, , 36]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1 = ?, p2 = ?, bye = 0 WHERE id = ?', [winner, loser, nextMatch.id])];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 34:
                        tmpMatch_5 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_5);
                        return [3 /*break*/, 36];
                    case 35:
                        error_9 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_9)];
                    case 36: return [3 /*break*/, 42];
                    case 37:
                        if (!(winnersRound_2 == maxRound && data.p1Score > data.p2Score)) return [3 /*break*/, 42];
                        winnersMatch_4 = 0;
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_4; });
                        _a.label = 38;
                    case 38:
                        _a.trys.push([38, 41, , 42]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET bye = 1 WHERE id = ?', [nextMatch.id])];
                    case 39:
                        _a.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 40:
                        tmpMatch_6 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_6);
                        return [3 /*break*/, 42];
                    case 41:
                        error_10 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_10)];
                    case 42: return [3 /*break*/, 49];
                    case 43:
                        if (!(thisMatch.round < 0)) return [3 /*break*/, 49];
                        winnersRound_3 = thisMatch.round - 1;
                        minRound = Math.min.apply(Math, bracket.map(function (x) { return x.round; }));
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        winnersMatch_5 = 0;
                        winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        if (winnersRound_3 > minRound) {
                            winnersMatch_5 = thisMatch.round * -1 % 2 == 1 ? thisMatch.matchNum : Math.floor(thisMatch.matchNum / 2);
                        }
                        else if (winnersRound_3 == minRound - 1) {
                            winnersRound_3 = maxRound - 1;
                            winnersMatch_5 = 0;
                            winnerIdentifier = 'p2';
                        }
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_3 && x.matchNum == winnersMatch_5; });
                        if (thisMatch.round * -1 % 2 == 1)
                            winnerIdentifier = 'p2';
                        _a.label = 44;
                    case 44:
                        _a.trys.push([44, 46, , 47]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])];
                    case 45:
                        _a.sent();
                        return [3 /*break*/, 47];
                    case 46:
                        error_11 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_11)];
                    case 47: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 48:
                        tmpMatch_7 = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_7);
                        return [2 /*return*/, this.ok(res)];
                    case 49: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 50:
                        tmpMatch = _a.sent();
                        this.emitter.emit('bracketMatch', tmpMatch);
                        return [2 /*return*/, this.ok(res)];
                    case 51: return [2 /*return*/, this.fail(res, 'Something went wrong')];
                }
            });
        });
    };
    bracketController.prototype.bracketData = function (id) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var bracketData, matches, bracketData_1, bracketData_1_1, row, match;
            var e_6, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT bracket.*,\n        u1.globalRank as p1Rank,\n        u2.globalRank as p2Rank,\n        u1.name as p1Name,\n        u2.name as p2Name,\n        u1.country as p1Country,\n        u2.country as p2Country,\n        u1.avatar as p1Avatar,\n        u2.avatar as p2Avatar,\n        u1.twitchName as p1Twitch,\n        u2.twitchName as p2Twitch,\n        par1.seed as p1Seed,\n        par2.seed as p2Seed\n        \n        FROM bracket\n        LEFT JOIN users u1 ON bracket.p1 = u1.discordId\n        LEFT JOIN users u2 ON bracket.p2 = u2.discordId\n        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)\n        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)\n        WHERE bracket.tournamentId = ? ", [id])];
                    case 1:
                        bracketData = _d.sent();
                        matches = [];
                        try {
                            for (bracketData_1 = __values(bracketData), bracketData_1_1 = bracketData_1.next(); !bracketData_1_1.done; bracketData_1_1 = bracketData_1.next()) {
                                row = bracketData_1_1.value;
                                match = {
                                    id: row.id,
                                    status: row.status,
                                    matchNum: row.matchNum,
                                    tournamentId: row.tournamentId,
                                    p1: {
                                        id: row.p1,
                                        ssId: row.p1ssId,
                                        name: row.p1Name,
                                        avatar: row.p1Avatar ? "/" + row.p1Avatar + (((_a = row.p1Avatar) === null || _a === void 0 ? void 0 : _a.substring(0, 2)) == 'a_' ? '.gif' : '.webp') : null,
                                        score: row.p1Score,
                                        country: row.p1Country,
                                        seed: row.p1Seed,
                                        forfeit: row.p1Forfeit,
                                        twitch: row.p1Twitch,
                                        rank: row.p1Rank,
                                    },
                                    p2: {
                                        id: row.p2,
                                        ssId: row.p2ssId,
                                        name: row.p2Name,
                                        avatar: row.p2Avatar ? "/" + row.p2Avatar + (((_b = row.p2Avatar) === null || _b === void 0 ? void 0 : _b.substring(0, 2)) == 'a_' ? '.gif' : '.webp') : null,
                                        score: row.p2Score,
                                        country: row.p2Country,
                                        seed: row.p2Seed,
                                        forfeit: row.p2Forfeit,
                                        twitch: row.p2Twitch,
                                        rank: row.p2Rank,
                                    },
                                    round: row.round,
                                    bye: row.bye,
                                    time: row.time,
                                    best_of: row.best_of
                                };
                                matches.push(match);
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (bracketData_1_1 && !bracketData_1_1.done && (_c = bracketData_1.return)) _c.call(bracketData_1);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        return [2 /*return*/, matches];
                }
            });
        });
    };
    bracketController.prototype.bracketDataOld = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var bracketData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT bracket.*,\n        u1.globalRank as p1Rank,\n        u2.globalRank as p2Rank,\n        u1.ssId as p1ssId,\n        u2.ssId as p2ssId,\n        u1.name as p1Name,\n        u2.name as p2Name,\n        u1.country as p1Country,\n        u2.country as p2Country,\n        u1.avatar as p1Avatar,\n        u2.avatar as p2Avatar,\n        u1.twitchName as p1Twitch,\n        u2.twitchName as p2Twitch,\n        par1.seed as p1Seed,\n        par2.seed as p2Seed\n        \n        FROM bracket\n        LEFT JOIN users u1 ON bracket.p1 = u1.discordId\n        LEFT JOIN users u2 ON bracket.p2 = u2.discordId\n        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)\n        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)\n        WHERE bracket.tournamentId = ? ", [id])];
                    case 1:
                        bracketData = _a.sent();
                        return [2 /*return*/, bracketData];
                }
            });
        });
    };
    bracketController.prototype.bracketMatchData = function (tourneyId, matchId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var matchData, row, match;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT bracket.*,\n        u1.globalRank as p1GlobalRank,\n        u2.globalRank as p2GlobalRank,\n        u1.ssId as p1ssId,\n        u2.ssId as p2ssId,\n        u1.name as p1Name,\n        u2.name as p2Name,\n        u1.country as p1Country,\n        u2.country as p2Country,\n        u1.avatar as p1Avatar,\n        u2.avatar as p2Avatar,\n        u1.twitchName as p1Twitch,\n        u2.twitchName as p2Twitch,\n        par1.seed as p1Seed,\n        par2.seed as p2Seed\n        \n        FROM bracket\n        LEFT JOIN users u1 ON bracket.p1 = u1.discordId\n        LEFT JOIN users u2 ON bracket.p2 = u2.discordId\n        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)\n        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)\n        WHERE bracket.id = ? AND bracket.tournamentId = ?", [matchId, tourneyId])];
                    case 1:
                        matchData = _c.sent();
                        if (matchData.length < 1)
                            return [2 /*return*/, null];
                        row = matchData[0];
                        match = {
                            id: row.id,
                            status: row.status,
                            matchNum: row.matchNum,
                            tournamentId: row.tournamentId,
                            p1: {
                                id: row.p1,
                                ssId: row.p1ssId,
                                name: row.p1Name,
                                avatar: row.p1Avatar ? "/" + row.p1Avatar + (((_a = row.p1Avatar) === null || _a === void 0 ? void 0 : _a.substring(0, 2)) == 'a_' ? '.gif' : '.webp') : null,
                                score: row.p1Score,
                                country: row.p1Country,
                                seed: row.p1Seed,
                                forfeit: row.p1Forfeit,
                                twitch: row.p1Twitch,
                                rank: row.p1GlobalRank,
                            },
                            p2: {
                                id: row.p2,
                                ssId: row.p2ssId,
                                name: row.p2Name,
                                avatar: row.p2Avatar ? "/" + row.p2Avatar + (((_b = row.p2Avatar) === null || _b === void 0 ? void 0 : _b.substring(0, 2)) == 'a_' ? '.gif' : '.webp') : null,
                                score: row.p2Score,
                                country: row.p2Country,
                                seed: row.p2Seed,
                                forfeit: row.p2Forfeit,
                                twitch: row.p2Twitch,
                                rank: row.p2GlobalRank,
                            },
                            round: row.round,
                            bye: row.bye,
                            time: row.time,
                            best_of: row.best_of
                        };
                        return [2 /*return*/, match];
                }
            });
        });
    };
    bracketController.prototype.seeding = function (numPlayers) {
        var nextPlayer = function (player) {
            var e_7, _a;
            var out = [];
            var length = player.length * 2 + 1;
            try {
                for (var player_1 = __values(player), player_1_1 = player_1.next(); !player_1_1.done; player_1_1 = player_1.next()) {
                    var value = player_1_1.value;
                    out.push(value);
                    out.push(length - value);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (player_1_1 && !player_1_1.done && (_a = player_1.return)) _a.call(player_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return out;
        };
        var rounds = Math.log(numPlayers) / Math.log(2) - 1;
        var players = [1, 2];
        for (var i = 0; i < rounds; i++) {
            players = nextPlayer(players);
        }
        return players;
    };
    bracketController.prototype.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };
    bracketController.prototype.mapOrder = function (array, order, key) {
        array.sort(function (a, b) {
            var A = a[key], B = b[key];
            if (order.indexOf(A) > order.indexOf(B)) {
                return 1;
            }
            else {
                return -1;
            }
        });
        return array;
    };
    ;
    __decorate([
        auth_controller_1.auth()
    ], bracketController.prototype, "getBracket", null);
    __decorate([
        auth_controller_1.auth()
    ], bracketController.prototype, "getBracketMatch", null);
    __decorate([
        auth_controller_1.auth()
    ], bracketController.prototype, "updateBracket", null);
    return bracketController;
}(controller_1.controller));
exports.bracketController = bracketController;
