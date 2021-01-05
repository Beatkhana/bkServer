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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bracketController = void 0;
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
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
            var auth, _a, _b, time, timeString, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.owner()];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        _a = _b;
                        if (_a) return [3 /*break*/, 5];
                        return [4 /*yield*/, auth.validKey()];
                    case 4:
                        _a = (_c.sent());
                        _c.label = 5;
                    case 5:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        time = new Date(req.body.matchTime);
                        timeString = time.toISOString().slice(0, 19).replace('T', ' ');
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery('UPDATE bracket SET time = ? WHERE id = ?', [timeString, req.params.id])];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_1 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    bracketController.prototype.setBestOf = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, _b, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.owner()];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        _a = _b;
                        if (_a) return [3 /*break*/, 5];
                        return [4 /*yield*/, auth.validKey()];
                    case 4:
                        _a = (_c.sent());
                        _c.label = 5;
                    case 5:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.body.best_of)
                            return [2 /*return*/, this.clientError(res, "Please provide a valid best of value")];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery('UPDATE bracket SET best_of = ? WHERE id = ?', [req.body.best_of, req.params.id])];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_2 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_2)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    bracketController.prototype.saveBracket = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var auth, id, data, _c, _d, matches, tempMatches, _i, tempMatches_1, match, tempMatches, _e, tempMatches_2, match, tempMatches, _f, tempMatches_3, match, sqlMatches, _g, matches_1, match, error_3;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        id = req.params.id;
                        data = req.body;
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _d = (_h.sent());
                        if (_d) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.owner()];
                    case 2:
                        _d = (_h.sent());
                        _h.label = 3;
                    case 3:
                        _c = _d;
                        if (_c) return [3 /*break*/, 5];
                        return [4 /*yield*/, auth.validKey()];
                    case 4:
                        _c = (_h.sent());
                        _h.label = 5;
                    case 5:
                        if (!(_c))
                            return [2 /*return*/, this.unauthorized(res)];
                        matches = [];
                        console.log(data);
                        if (!(((_a = data.customPlayers) === null || _a === void 0 ? void 0 : _a.length) > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.generateBracket(id, data.customPlayers)];
                    case 6:
                        tempMatches = _h.sent();
                        for (_i = 0, tempMatches_1 = tempMatches; _i < tempMatches_1.length; _i++) {
                            match = tempMatches_1[_i];
                            matches.push({
                                tournamentId: id,
                                round: match.round,
                                matchNum: match.matchNum,
                                p1: match.p1,
                                p2: match.p2,
                                bye: +match.bye || 0
                            });
                        }
                        return [3 /*break*/, 11];
                    case 7:
                        if (!(((_b = data.players) === null || _b === void 0 ? void 0 : _b.length) > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.generateBracket(id, null, data.players)];
                    case 8:
                        tempMatches = _h.sent();
                        for (_e = 0, tempMatches_2 = tempMatches; _e < tempMatches_2.length; _e++) {
                            match = tempMatches_2[_e];
                            matches.push({
                                tournamentId: id,
                                round: match.round,
                                matchNum: match.matchNum,
                                p1: match.p1,
                                p2: match.p2,
                                bye: +match.bye || 0
                            });
                        }
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.generateBracket(id)];
                    case 10:
                        tempMatches = _h.sent();
                        for (_f = 0, tempMatches_3 = tempMatches; _f < tempMatches_3.length; _f++) {
                            match = tempMatches_3[_f];
                            matches.push({
                                tournamentId: id,
                                round: match.round,
                                matchNum: match.matchNum,
                                p1: match.p1,
                                p2: match.p2,
                                bye: +match.bye || 0
                            });
                        }
                        _h.label = 11;
                    case 11:
                        sqlMatches = [];
                        for (_g = 0, matches_1 = matches; _g < matches_1.length; _g++) {
                            match = matches_1[_g];
                            sqlMatches.push(Object.values(match));
                        }
                        _h.label = 12;
                    case 12:
                        _h.trys.push([12, 15, , 16]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('DELETE FROM bracket WHERE tournamentId = ?', [id])];
                    case 13:
                        _h.sent();
                        return [4 /*yield*/, this.db.asyncPreparedQuery('INSERT INTO bracket (tournamentId, round, matchNum, p1, p2, bye) VALUES ?', [sqlMatches])];
                    case 14:
                        _h.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        error_3 = _h.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 16: return [2 /*return*/, this.ok(res)];
                }
            });
        });
    };
    bracketController.prototype.generateBracket = function (id, players, users) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, rand, participants, temp, i, _i, participants_1, participant, matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSettings(id)];
                    case 1:
                        settings = _a.sent();
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
                        participants = _a.sent();
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
                        temp = _a.sent();
                        participants = this.mapOrder(temp, users, "discordId");
                        _a.label = 6;
                    case 6:
                        if (rand) {
                            this.shuffle(participants);
                        }
                        if (participants.length > settings.bracket_limit)
                            participants.length = settings.bracket_limit;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id])];
                    case 7:
                        _a.sent();
                        if (!(settings.bracket_sort_method != 'seed' && !players)) return [3 /*break*/, 11];
                        i = 1;
                        _i = 0, participants_1 = participants;
                        _a.label = 8;
                    case 8:
                        if (!(_i < participants_1.length)) return [3 /*break*/, 11];
                        participant = participants_1[_i];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE id = ?", [i, participant.participantId])];
                    case 9:
                        _a.sent();
                        i++;
                        _a.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 8];
                    case 11:
                        if (!(settings.type == 'single_elim')) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.winnersRoundMatches(settings, participants, !!players)];
                    case 12:
                        matches = _a.sent();
                        return [3 /*break*/, 15];
                    case 13:
                        if (!(settings.type == 'double_elim')) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.doubleElimMatches(settings, participants, !!players)];
                    case 14:
                        matches = _a.sent();
                        _a.label = 15;
                    case 15: return [2 /*return*/, matches];
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
            var req, res, auth, id, data, isAuth, _a, _b, error_4, tmpMatch, error_5, settings, bracket, thisMatch, winner, loser, winnersRound_1, maxRound, winnersMatch_1, playerIdentifier, nextMatch, tmpMatch_1, error_6, tmpMatch_2, winnersRound_2, maxRound, winnersMatch_2, winnerIdentifier, nextMatch, tmpMatch_3, error_7, loserRound_1, loserMatch_1, loserIdentifier, loserNextMatch, tmpMatch_4, error_8, winnersMatch_3, nextMatch, tmpMatch_5, error_9, winnersMatch_4, nextMatch, tmpMatch_6, error_10, winnersRound_3, minRound, maxRound, winnersMatch_5, winnerIdentifier, nextMatch, error_11, tmpMatch_7, tmpMatch;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        req = args.req, res = args.res, auth = args.auth;
                        id = req.params.tourneyId;
                        data = req.body;
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.owner()];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        _a = _b;
                        if (_a) return [3 /*break*/, 5];
                        return [4 /*yield*/, auth.validKey()];
                    case 4:
                        _a = (_c.sent());
                        _c.label = 5;
                    case 5:
                        isAuth = _a;
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!(data.status == 'update')) return [3 /*break*/, 11];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "in_progress" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId])];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_4 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_4)];
                    case 9: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 10:
                        tmpMatch = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch);
                        return [2 /*return*/, this.ok(res)];
                    case 11:
                        if (!(data.status == 'complete')) return [3 /*break*/, 55];
                        _c.label = 12;
                    case 12:
                        _c.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "complete" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId])];
                    case 13:
                        _c.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        error_5 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_5)];
                    case 15: return [4 /*yield*/, this.getSettings(id)];
                    case 16:
                        settings = _c.sent();
                        return [4 /*yield*/, this.bracketDataOld(id)];
                    case 17:
                        bracket = _c.sent();
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
                        if (!(settings.type == 'single_elim')) return [3 /*break*/, 24];
                        winnersRound_1 = thisMatch.round + 1;
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        if (!(winnersRound_1 <= maxRound)) return [3 /*break*/, 22];
                        winnersMatch_1 = Math.floor(thisMatch.matchNum / 2);
                        playerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_1 && x.matchNum == winnersMatch_1; });
                        _c.label = 18;
                    case 18:
                        _c.trys.push([18, 21, , 22]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [playerIdentifier, winner, nextMatch.id])];
                    case 19:
                        _c.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 20:
                        tmpMatch_1 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_1);
                        return [3 /*break*/, 22];
                    case 21:
                        error_6 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_6)];
                    case 22: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 23:
                        tmpMatch_2 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_2);
                        return [2 /*return*/, this.ok(res)];
                    case 24:
                        if (!(settings.type == 'double_elim')) return [3 /*break*/, 53];
                        if (!(thisMatch.round >= 0)) return [3 /*break*/, 47];
                        winnersRound_2 = thisMatch.round + 1;
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        if (!(winnersRound_2 < maxRound)) return [3 /*break*/, 35];
                        winnersMatch_2 = Math.floor(thisMatch.matchNum / 2);
                        winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_2; });
                        _c.label = 25;
                    case 25:
                        _c.trys.push([25, 28, , 29]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])];
                    case 26:
                        _c.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 27:
                        tmpMatch_3 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_3);
                        return [3 /*break*/, 29];
                    case 28:
                        error_7 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_7)];
                    case 29:
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
                        _c.label = 30;
                    case 30:
                        _c.trys.push([30, 33, , 34]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [loserIdentifier, loser, loserNextMatch.id])];
                    case 31:
                        _c.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, loserNextMatch.id)];
                    case 32:
                        tmpMatch_4 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_4);
                        return [3 /*break*/, 34];
                    case 33:
                        error_8 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_8)];
                    case 34: return [3 /*break*/, 46];
                    case 35:
                        if (!(winnersRound_2 == maxRound && data.p1Score < data.p2Score)) return [3 /*break*/, 41];
                        winnersMatch_3 = 0;
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_3; });
                        _c.label = 36;
                    case 36:
                        _c.trys.push([36, 39, , 40]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1 = ?, p2 = ?, bye = 0 WHERE id = ?', [winner, loser, nextMatch.id])];
                    case 37:
                        _c.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 38:
                        tmpMatch_5 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_5);
                        return [3 /*break*/, 40];
                    case 39:
                        error_9 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_9)];
                    case 40: return [3 /*break*/, 46];
                    case 41:
                        if (!(winnersRound_2 == maxRound && data.p1Score > data.p2Score)) return [3 /*break*/, 46];
                        winnersMatch_4 = 0;
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_4; });
                        _c.label = 42;
                    case 42:
                        _c.trys.push([42, 45, , 46]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET bye = 1 WHERE id = ?', [nextMatch.id])];
                    case 43:
                        _c.sent();
                        return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, nextMatch.id)];
                    case 44:
                        tmpMatch_6 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_6);
                        return [3 /*break*/, 46];
                    case 45:
                        error_10 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_10)];
                    case 46: return [3 /*break*/, 53];
                    case 47:
                        if (!(thisMatch.round < 0)) return [3 /*break*/, 53];
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
                        _c.label = 48;
                    case 48:
                        _c.trys.push([48, 50, , 51]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])];
                    case 49:
                        _c.sent();
                        return [3 /*break*/, 51];
                    case 50:
                        error_11 = _c.sent();
                        return [2 /*return*/, this.fail(res, error_11)];
                    case 51: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 52:
                        tmpMatch_7 = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch_7);
                        return [2 /*return*/, this.ok(res)];
                    case 53: return [4 /*yield*/, this.bracketMatchData(req.params.tourneyId, data.matchId)];
                    case 54:
                        tmpMatch = _c.sent();
                        this.emitter.emit('bracketMatch', tmpMatch);
                        return [2 /*return*/, this.ok(res)];
                    case 55: return [2 /*return*/, this.fail(res, 'Something went wrong')];
                }
            });
        });
    };
    bracketController.prototype.bracketData = function (id) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var bracketData, matches, _i, bracketData_1, row, match;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT bracket.*,\n        u1.globalRank as p1Rank,\n        u2.globalRank as p2Rank,\n        u1.name as p1Name,\n        u2.name as p2Name,\n        u1.country as p1Country,\n        u2.country as p2Country,\n        u1.avatar as p1Avatar,\n        u2.avatar as p2Avatar,\n        u1.twitchName as p1Twitch,\n        u2.twitchName as p2Twitch,\n        par1.seed as p1Seed,\n        par2.seed as p2Seed\n        \n        FROM bracket\n        LEFT JOIN users u1 ON bracket.p1 = u1.discordId\n        LEFT JOIN users u2 ON bracket.p2 = u2.discordId\n        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)\n        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)\n        WHERE bracket.tournamentId = ? ", [id])];
                    case 1:
                        bracketData = _c.sent();
                        matches = [];
                        for (_i = 0, bracketData_1 = bracketData; _i < bracketData_1.length; _i++) {
                            row = bracketData_1[_i];
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
            var out = [];
            var length = player.length * 2 + 1;
            for (var _i = 0, player_1 = player; _i < player_1.length; _i++) {
                var value = player_1[_i];
                out.push(value);
                out.push(length - value);
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
