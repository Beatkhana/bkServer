"use strict";
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
exports.tournaments = void 0;
var database_1 = require("./database");
// import fs from 'fs';
// import jimp from 'jimp';
var sharp_1 = __importDefault(require("sharp"));
var AWS = require('aws-sdk');
var rp = __importStar(require("request-promise"));
var https = require('https');
var cheerio_1 = __importDefault(require("cheerio"));
// const ID = 'AKIAJNEXL3RYO3HDJ5EA';
// const SECRET = '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';
// const BUCKET_NAME = 'beatkhanas3';
// const s3 = new AWS.S3({
//     accessKeyId: ID,
//     secretAccessKey: SECRET
// });
// const fs = require('fs');
var tournaments = /** @class */ (function () {
    function tournaments() {
        this.db = new database_1.database();
        this.env = process.env.NODE_ENV || 'production';
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }
    tournaments.prototype.getAll = function (callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\` as startDate, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getActive = function (callback, userId) {
        if (userId === void 0) { userId = 0; }
        var sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = "AND (ts.public = 1 OR owner = ?)";
                break;
            case userId < 0:
                sqlWhere = "";
                break;
            case userId == 0:
                sqlWhere = "AND ts.public = 1";
                break;
        }
        var result = this.db.preparedQuery("SELECT `tournaments`.`id` as tournamentId,\n        `tournaments`.`name`,\n        `tournaments`.`image`,\n        `tournaments`.`date` as startDate,\n        `tournaments`.`endDate`,\n        `tournaments`.`discord`,\n        `tournaments`.`twitchLink`,\n        `tournaments`.`prize`,\n        `tournaments`.`info`,\n        CAST(`tournaments`.`owner` AS CHAR) as owner,\n        `tournaments`.`archived`,\n        `tournaments`.`first`,\n        `tournaments`.`second`,\n        `tournaments`.`third`,\n        ts.public\n        FROM tournaments \n        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id \n        WHERE archived = 0 AND tournaments.is_mini = 0 " + sqlWhere, [userId], function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getActiveMini = function (callback, userId) {
        if (userId === void 0) { userId = 0; }
        var sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = "AND (ts.public = 1 OR owner = ?)";
                break;
            case userId < 0:
                sqlWhere = "";
                break;
            case userId == 0:
                sqlWhere = "AND ts.public = 1";
                break;
        }
        var result = this.db.preparedQuery("SELECT `tournaments`.`id` as tournamentId,\n        `tournaments`.`name`,\n        `tournaments`.`image`,\n        `tournaments`.`date` as startDate,\n        `tournaments`.`endDate`,\n        `tournaments`.`discord`,\n        `tournaments`.`twitchLink`,\n        `tournaments`.`prize`,\n        `tournaments`.`info`,\n        CAST(`tournaments`.`owner` AS CHAR) as owner,\n        `tournaments`.`archived`,\n        `tournaments`.`first`,\n        `tournaments`.`second`,\n        `tournaments`.`third`,\n        ts.public\n        FROM tournaments \n        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id \n        WHERE archived = 0 AND tournaments.is_mini = 1 " + sqlWhere, [userId], function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getArchived = function (callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id as tournamentId, name, image, \`date\` as startDate, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1 ORDER BY endDate DESC", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getTournament = function (id, callback, userId) {
        if (userId === void 0) { userId = 0; }
        var sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = "AND (ts.public = 1 OR owner = ?)";
                break;
            case userId < 0:
                sqlWhere = "";
                break;
            case userId == 0:
                sqlWhere = "AND ts.public = 1";
                break;
        }
        var result = this.db.preparedQuery("SELECT `tournaments`.`id` as tournamentId,\n        `tournaments`.`name`,\n        `tournaments`.`image`,\n        `tournaments`.`date` as startDate,\n        `tournaments`.`endDate`,\n        `tournaments`.`discord`,\n        `tournaments`.`twitchLink`,\n        `tournaments`.`prize`,\n        `tournaments`.`info`,\n        CAST(`tournaments`.`owner` AS CHAR) as owner,\n        `tournaments`.`archived`,\n        `tournaments`.`first`,\n        `tournaments`.`second`,\n        `tournaments`.`third`,\n        `tournaments`.`is_mini`,\n        ts.id as settingsId,\n        ts.public_signups,\n        ts.public,\n        ts.state,\n        ts.type,\n        ts.has_bracket,\n        ts.has_map_pool,\n        ts.signup_comment,\n        ts.comment_required,\n        ts.show_signups,\n        ts.bracket_sort_method,\n        ts.bracket_limit,\n        ts.quals_cutoff,\n        ts.show_quals,\n        ts.has_quals,\n        ts.countries,\n        ts.sort_method,\n        ts.standard_cutoff,\n        ts.ta_url\n        FROM tournaments \n        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id \n        WHERE tournaments.id = ? " + sqlWhere, [id, userId], function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.participants = function (id, isAuth, userId) {
        if (isAuth === void 0) { isAuth = false; }
        return __awaiter(this, void 0, void 0, function () {
            var settings, battleRoyale, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id])];
                    case 1:
                        settings = _a.sent();
                        battleRoyale = settings[0].state == 'main_stage' && settings[0].type == 'battle_royale';
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.id AS participantId,\n        CAST(p.userId AS CHAR) as userId,\n        p.forfeit,\n        p.seed,\n        p.position,\n        " + (isAuth ? 'p.comment,' : '') + "\n        " + (userId != null ? 'IF(p.userId = "' + userId + '", p.comment, null) as comment,' : '') + "\n        CAST(`u`.`discordId` AS CHAR) as discordId,\n        CAST(`u`.`ssId` AS CHAR) as ssId,\n        `u`.`name`,\n        `u`.`twitchName`,\n        `u`.`avatar`,\n        `u`.`globalRank`,\n        `u`.`localRank`,\n        `u`.`country`,\n        `u`.`tourneyRank`,\n        `u`.`TR`,\n        `u`.`pronoun`\n        FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE p.tournamentId = ? " + (!battleRoyale ? '' : 'AND p.seed != 0') + " " + (isAuth ? '' : 'AND ts.show_signups = 1'), [id])];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    tournaments.prototype.allParticipants = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id])];
                    case 1:
                        settings = _a.sent();
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.id AS participantId,\n        CAST(p.userId AS CHAR) as userId,\n        p.forfeit,\n        p.seed,\n        p.position,\n        p.comment,\n        CAST(`u`.`discordId` AS CHAR) as discordId,\n        CAST(`u`.`ssId` AS CHAR) as ssId,\n        `u`.`name`,\n        `u`.`twitchName`,\n        `u`.`avatar`,\n        `u`.`globalRank`,\n        `u`.`localRank`,\n        `u`.`country`,\n        `u`.`tourneyRank`,\n        `u`.`TR`,\n        `u`.`pronoun`\n        FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE p.tournamentId = ?", [id])];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    tournaments.prototype.updateParticipant = function (data, auth, callback) {
        if (auth === void 0) { auth = false; }
        var sql = "UPDATE participants SET comment = ? WHERE tournamentId = ? AND userId = ?";
        var params = [data.comment, data.tournamentId, data.discordId];
        if (auth) {
            params = [data.comment, data.participantId];
            sql = "UPDATE participants SET comment = ? WHERE id = ?";
        }
        var result = this.db.preparedQuery(sql, params, function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.removeParticipant = function (data, callback) {
        var result = this.db.preparedQuery("DELETE FROM participants WHERE id = ?", [data.participantId], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.elimParticipant = function (participantId, tournamentId) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, curParticipants, minpos, nextPos, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSettings(tournamentId)];
                    case 1:
                        settings = _a.sent();
                        return [4 /*yield*/, this.participants(tournamentId, true)];
                    case 2:
                        curParticipants = _a.sent();
                        if (!(settings[0].type == 'battle_royale')) return [3 /*break*/, 6];
                        minpos = Math.min.apply(null, curParticipants.map(function (x) { return x.position; }).filter(Boolean));
                        nextPos = settings[0].quals_cutoff;
                        if (minpos != Infinity)
                            nextPos = minpos - 1;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET position = ? WHERE id = ?", [nextPos, participantId])];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, {
                                data: result,
                                flag: false
                            }];
                    case 5:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                err: error_1,
                                flag: true
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    tournaments.prototype.save = function (data, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var base64String, base64Img, imgName, savePath, imgErr, result;
            var _this = this;
            return __generator(this, function (_a) {
                base64String = data.image;
                base64Img = base64String.split(';base64,').pop();
                imgName = data.imgName;
                imgName = imgName.toLowerCase();
                imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
                savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/public/assets/images/';
                imgErr = false;
                if (!imgErr) {
                    data.image = imgName;
                    delete data.imgName;
                    try {
                        data.date = this.formatDate2(data.date);
                        data.endDate = this.formatDate2(data.endDate);
                    }
                    catch (err) {
                        return [2 /*return*/, callback({
                                flag: true,
                                err: err
                            })];
                    }
                    result = this.db.preparedQuery("INSERT INTO tournaments SET ?", [data], function (err, result) { return __awaiter(_this, void 0, void 0, function () {
                        var flag, buf, webpData, hash;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    flag = false;
                                    if (err)
                                        flag = true;
                                    if (!!err) return [3 /*break*/, 5];
                                    return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                                case 1:
                                    buf = _a.sent();
                                    return [4 /*yield*/, sharp_1.default(buf)
                                            .resize({ width: 550 })
                                            .webp({ lossless: true, quality: 50 })
                                            .toBuffer()
                                        // console.debug(savePath+data.id+'.webp');
                                    ];
                                case 2:
                                    webpData = _a.sent();
                                    hash = this.randHash(15);
                                    return [4 /*yield*/, sharp_1.default(webpData)
                                            .toFile(savePath + (result.insertId + "_" + hash + ".webp"))];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, this.db.aQuery('UPDATE tournaments SET image = ? WHERE id = ?', [result.insertId + "_" + hash + ".webp", result.insertId])];
                                case 4:
                                    _a.sent();
                                    this.db.preparedQuery('INSERT INTO tournament_settings SET tournamentId = ?', [result.insertId], function (err, result2) {
                                        var flag = false;
                                        if (err)
                                            flag = true;
                                        return callback({
                                            data: result,
                                            flag: flag,
                                            err: err
                                        });
                                    });
                                    return [3 /*break*/, 6];
                                case 5: return [2 /*return*/, callback({
                                        data: result,
                                        flag: flag,
                                        err: err
                                    })];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                return [2 /*return*/];
            });
        });
    };
    tournaments.prototype.delete = function (id, callback) {
        var result = this.db.preparedQuery("DELETE FROM tournaments WHERE id = ?", [id], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.update = function (data, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var imgErr, imgName, base64String, base64Img, savePath, buf, webpData, hash, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        imgErr = false;
                        imgName = data.tournament.image;
                        if (!this.isBase64(data.tournament.image)) return [3 /*break*/, 4];
                        base64String = data.tournament.image;
                        base64Img = base64String.split(';base64,').pop();
                        imgName = data.tournament.imgName;
                        imgName = imgName.toLowerCase();
                        imgName = imgName.replace(/\s/g, "");
                        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
                        savePath = this.env == 'development' ? '../app/src/assets/images/' : __dirname + '/public/assets/images/';
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 1:
                        buf = _a.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 550 })
                                .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 2:
                        webpData = _a.sent();
                        hash = this.randHash(15);
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + (data.id + "_" + hash + ".webp"))];
                    case 3:
                        _a.sent();
                        data.tournament.image = data.id + "_" + hash + ".webp";
                        _a.label = 4;
                    case 4:
                        if (!imgErr) {
                            delete data.tournament.imgName;
                            try {
                                data.tournament.date = this.formatDate2(data.tournament.date);
                                data.tournament.endDate = this.formatDate2(data.tournament.endDate);
                            }
                            catch (err) {
                                return [2 /*return*/, callback({
                                        flag: true,
                                        err: err
                                    })];
                            }
                            result = this.db.preparedQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', data.id], function (err, result) {
                                var flag = false;
                                if (err)
                                    flag = true;
                                return callback({
                                    data: data.tournament,
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
    tournaments.prototype.updateSettings = function (data, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var curSettings, seeding, seeding, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE id = ?", [data.settingsId])];
                    case 1:
                        curSettings = _a.sent();
                        if (!(data.settings.state == 'main_stage' && curSettings[0].state == "qualifiers")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.seedPlayersByQuals(data.tournamentId, data.settings.quals_cutoff)];
                    case 2:
                        seeding = _a.sent();
                        if (!seeding) {
                            return [2 /*return*/, callback({
                                    err: 'error creating seeds',
                                    flag: true
                                })];
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(data.settings.state == 'main_stage' && curSettings[0].state == "awaiting_start")) return [3 /*break*/, 5];
                        if (!(data.settings.type == 'battle_royale')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.seedPlayers(data.tournamentId, data.settings.standard_cutoff, 'date')];
                    case 4:
                        seeding = _a.sent();
                        if (!seeding) {
                            return [2 /*return*/, callback({
                                    err: 'error creating seeds',
                                    flag: true
                                })];
                        }
                        _a.label = 5;
                    case 5:
                        result = this.db.preparedQuery("UPDATE tournament_settings SET ? WHERE ?? = ?", [data.settings, 'id', data.settingsId], function (err, result) {
                            var flag = false;
                            if (err)
                                flag = true;
                            return callback({
                                data: result,
                                flag: flag,
                                err: err
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    // non quals seed
    tournaments.prototype.seedPlayers = function (tournamentId, cutoff, method) {
        return __awaiter(this, void 0, void 0, function () {
            var updateErr_1, participants, qualified, participants_1, participants_1_1, user, e_1_1, i, user;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(method == 'date')) return [3 /*break*/, 14];
                        updateErr_1 = false;
                        return [4 /*yield*/, this.allParticipants(tournamentId)];
                    case 1:
                        participants = _b.sent();
                        participants.sort(function (a, b) { return a.participantId - b.participantId; });
                        qualified = participants.slice(0, cutoff + 1);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        participants_1 = __values(participants), participants_1_1 = participants_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!participants_1_1.done) return [3 /*break*/, 6];
                        user = participants_1_1.value;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0, position = 0 WHERE userId = ? AND tournamentId = ?", [user.userId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr_1 = true;
                            })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        participants_1_1 = participants_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (participants_1_1 && !participants_1_1.done && (_a = participants_1.return)) _a.call(participants_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        console.log(qualified.entries());
                        i = 0;
                        _b.label = 10;
                    case 10:
                        if (!(i < qualified.length)) return [3 /*break*/, 13];
                        user = qualified[i];
                        console.log(i, user.userId, tournamentId);
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE userId = ? AND tournamentId = ?", [i, user.userId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr_1 = true;
                            })];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        i++;
                        return [3 /*break*/, 10];
                    case 13: return [2 /*return*/, !updateErr_1];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // quals seed
    tournaments.prototype.seedPlayersByQuals = function (tournamentId, cutoff) {
        return __awaiter(this, void 0, void 0, function () {
            var pools, qualsPool, qualsScores, qualsScores_1, qualsScores_1_1, user, _loop_1, _a, _b, score, qualsScores_2, qualsScores_2_1, user, e_2_1, users, i, user, temp, updateErr, users_1, users_1_1, user, e_3_1;
            var e_4, _c, e_5, _d, e_2, _e, e_3, _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.getMapPools(tournamentId)];
                    case 1:
                        pools = _g.sent();
                        qualsPool = Object.values(pools).find(function (x) { return x.is_qualifiers == 1; });
                        return [4 /*yield*/, this.getQualsScores(tournamentId)];
                    case 2:
                        qualsScores = _g.sent();
                        console.log(qualsScores);
                        try {
                            for (qualsScores_1 = __values(qualsScores), qualsScores_1_1 = qualsScores_1.next(); !qualsScores_1_1.done; qualsScores_1_1 = qualsScores_1.next()) {
                                user = qualsScores_1_1.value;
                                _loop_1 = function (score) {
                                    if (qualsPool.songs.find(function (x) { return x.hash == score.songHash; }).numNotes != 0) {
                                        score.percentage = score.score / (qualsPool.songs.find(function (x) { return x.hash == score.songHash; }).numNotes * 920 - 7245);
                                    }
                                    else {
                                        score.percentage = 0;
                                    }
                                    score.score = Math.round(score.score / 2);
                                };
                                try {
                                    for (_a = (e_5 = void 0, __values(user.scores)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                        score = _b.value;
                                        _loop_1(score);
                                    }
                                }
                                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                finally {
                                    try {
                                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                                    }
                                    finally { if (e_5) throw e_5.error; }
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (qualsScores_1_1 && !qualsScores_1_1.done && (_c = qualsScores_1.return)) _c.call(qualsScores_1);
                            }
                            finally { if (e_4) throw e_4.error; }
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
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 8, 9, 10]);
                        qualsScores_2 = __values(qualsScores), qualsScores_2_1 = qualsScores_2.next();
                        _g.label = 4;
                    case 4:
                        if (!!qualsScores_2_1.done) return [3 /*break*/, 7];
                        user = qualsScores_2_1.value;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE userId = ? AND tournamentId = ?", [user.discordId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr = true;
                            })];
                    case 5:
                        _g.sent();
                        _g.label = 6;
                    case 6:
                        qualsScores_2_1 = qualsScores_2.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (qualsScores_2_1 && !qualsScores_2_1.done && (_e = qualsScores_2.return)) _e.call(qualsScores_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 10:
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
                        _g.label = 11;
                    case 11:
                        _g.trys.push([11, 16, 17, 18]);
                        users_1 = __values(users), users_1_1 = users_1.next();
                        _g.label = 12;
                    case 12:
                        if (!!users_1_1.done) return [3 /*break*/, 15];
                        user = users_1_1.value;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE userId = ? AND tournamentId = ?", [user.seed, user.discordId, tournamentId])
                                .catch(function (err) {
                                console.error(err);
                                updateErr = true;
                            })];
                    case 13:
                        _g.sent();
                        _g.label = 14;
                    case 14:
                        users_1_1 = users_1.next();
                        return [3 /*break*/, 12];
                    case 15: return [3 /*break*/, 18];
                    case 16:
                        e_3_1 = _g.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 18];
                    case 17:
                        try {
                            if (users_1_1 && !users_1_1.done && (_f = users_1.return)) _f.call(users_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 18: return [2 /*return*/, !updateErr];
                }
            });
        });
    };
    tournaments.prototype.signUp = function (data, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.db.preparedQuery("SELECT public_signups FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId], function (err, result) { return __awaiter(_this, void 0, void 0, function () {
                    var flag, settings, countries, user, result_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                flag = false;
                                if (err)
                                    flag = true;
                                return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId])];
                            case 1:
                                settings = _a.sent();
                                countries = null;
                                if (settings[0].countries != '')
                                    countries = settings[0].countries.toLowerCase().replace(' ', '').split(',');
                                return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM users WHERE discordId = ?", [data.userId])];
                            case 2:
                                user = _a.sent();
                                if (countries != null && !countries.includes(user[0].country.toLowerCase())) {
                                    callback(401);
                                    return [2 /*return*/, null];
                                }
                                if (result[0].public_signups = 1) {
                                    result_1 = this.db.preparedQuery("INSERT INTO participants SET ?", [data], function (err, result) {
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
                                else {
                                    return [2 /*return*/, callback({
                                            data: result,
                                            flag: true,
                                            err: err
                                        })];
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    tournaments.prototype.archive = function (data, callback) {
        try {
            data.tournament = {
                first: data.first,
                second: data.second,
                third: data.third,
                archived: 1
            };
        }
        catch (err) {
            return callback({
                flag: true,
                err: err
            });
        }
        var result = this.db.preparedQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', data.id], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.isOwner = function (userId, tournamentId, callback) {
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner FROM tournaments WHERE id = " + tournamentId, function (err, result) {
            if (!err && result[0].owner == userId) {
                return callback(true);
            }
            else {
                return callback(false);
            }
        });
    };
    tournaments.prototype.events = function (callback, isAuth) {
        if (isAuth === void 0) { isAuth = false; }
        var result = this.db.query("SELECT tournaments.id as tournamentId, tournaments.name, tournaments.date as startDate, tournaments.endDate FROM tournaments LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id WHERE (ts.public = " + +!isAuth + " OR ts.public = 1) ORDER BY date", function (err, result) {
            return callback(result);
        });
    };
    // Map Pools
    tournaments.prototype.addPool = function (data, callback) {
        this.db.preparedQuery("INSERT INTO map_pools SET ?", [data], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.updatePool = function (data, callback) {
        var poolId = data.poolId;
        delete data.poolId;
        this.db.preparedQuery("UPDATE map_pools SET ? WHERE id = ?", [data, poolId], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.getMapPools = function (tournamentId, isAuth) {
        if (isAuth === void 0) { isAuth = false; }
        return __awaiter(this, void 0, void 0, function () {
            var sql, poolsRes, mapPools, poolsRes_1, poolsRes_1_1, song, songs;
            var e_6, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?";
                        if (isAuth) {
                            sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?";
                        }
                        return [4 /*yield*/, this.db.asyncPreparedQuery(sql, [tournamentId])];
                    case 1:
                        poolsRes = _b.sent();
                        mapPools = {};
                        try {
                            // console.log(result)
                            // if (poolsRes == undefined) return callback({});
                            for (poolsRes_1 = __values(poolsRes), poolsRes_1_1 = poolsRes_1.next(); !poolsRes_1_1.done; poolsRes_1_1 = poolsRes_1.next()) {
                                song = poolsRes_1_1.value;
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
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (poolsRes_1_1 && !poolsRes_1_1.done && (_a = poolsRes_1.return)) _a.call(poolsRes_1);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        return [2 /*return*/, mapPools];
                }
            });
        });
    };
    tournaments.prototype.downloadPool = function (id, auth) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, tournamentName, curSongs, playlist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, pool_link.songHash FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE (map_pools.live = ? OR map_pools.live = 1) AND map_pools.id = ?", [+auth, id])];
                    case 1:
                        pool = _a.sent();
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT name FROM tournaments WHERE id = ?", [pool[0].tournamentId])];
                    case 2:
                        tournamentName = _a.sent();
                        curSongs = pool.map(function (e) { return { hash: e.songHash }; });
                        playlist = {
                            playlistTitle: tournamentName[0].name + "_" + pool[0].poolName,
                            playlistAuthor: 'BeatKhana!',
                            playlistDescription: pool[0].description,
                            image: pool[0].image,
                            songs: curSongs
                        };
                        return [2 /*return*/, playlist];
                }
            });
        });
    };
    tournaments.prototype.addSong = function (data, callback) {
        var _this = this;
        // console.log(data);
        rp.get(data.ssLink)
            .then(function (html) {
            var hash = cheerio_1.default('.box.has-shadow > b', html).text();
            var diff = cheerio_1.default('li.is-active > a > span', html).text();
            var diffSearch = diff.toLowerCase();
            if (diffSearch == 'expert+')
                diffSearch = 'expertPlus';
            var songInfo = _this.getBSData(hash, diffSearch, function (songInfo) {
                var e_7, _a;
                // console.log(songInfo)
                songInfo.songDiff = diff;
                songInfo.ssLink = data.ssLink;
                var values = [];
                try {
                    for (var _b = __values(data.poolIds), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var id = _c.value;
                        songInfo.poolId = id;
                        values.push(Object.values(songInfo));
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                _this.saveSong(values, function (res) {
                    callback(res);
                });
                return null;
            });
            return null;
        })
            .catch(function (err) {
            return callback({
                flag: true,
                err: err
            });
        });
    };
    tournaments.prototype.deleteSong = function (data, callback) {
        this.db.preparedQuery("DELETE FROM pool_link WHERE id = ?", [data], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag
            });
        });
    };
    tournaments.prototype.saveSong = function (data, callback) {
        this.db.preparedQuery("INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, `key`, numNotes, songDiff, ssLink, poolId) VALUES ?", [data], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag,
                err: err
            });
        });
    };
    tournaments.prototype.songByKey = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var key, diff, bsData, songName, songHash, ssData, diffSearch, diffInfo, info, values, _a, _b, id, res, err_1;
            var e_8, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        key = data.ssLink.split('beatmap/')[1];
                        diff = data.diff;
                        return [4 /*yield*/, rp.get('https://beatsaver.com/api/maps/detail/' + key, {
                                headers: {
                                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                                },
                                json: true
                            })
                                .catch(function (err) { return console.log(err); })];
                    case 1:
                        bsData = _d.sent();
                        songName = bsData.metadata.songName.replace(" ", "+");
                        songHash = bsData.hash;
                        return [4 /*yield*/, rp.get("https://scoresaber.com/?search=" + songName)
                                .then(function (html) { return __awaiter(_this, void 0, void 0, function () {
                                var $, defaultLeaderboard, defaultDiff, ssLink, response;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            $ = cheerio_1.default.load(html);
                                            defaultLeaderboard = "";
                                            defaultDiff = "";
                                            ssLink = "";
                                            return [4 /*yield*/, $("table.ranking tr").each(function (i, e) {
                                                    // console.log($(e).find('img').attr('src'));
                                                    if ($(e).find('img').attr('src')) {
                                                        var curHash = $(e).find('img').attr('src').replace("/imports/images/songs/", "").replace(".png", "");
                                                        if (curHash.toLowerCase() == songHash.toLowerCase()) {
                                                            // songElem = e;
                                                            if (defaultLeaderboard == "") {
                                                                defaultDiff = $(e).find('td.difficulty>span').text();
                                                                defaultLeaderboard = $(e).find('td.song>a').attr('href');
                                                            }
                                                            if ($(e).find('td.difficulty>span').text().toLowerCase() == diff.toLowerCase()) {
                                                                ssLink = $(e).find('td.song>a').attr('href');
                                                            }
                                                        }
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            response = {
                                                ssLink: ssLink != "" ? ssLink : defaultLeaderboard,
                                                diff: ssLink != "" ? diff : defaultDiff,
                                            };
                                            return [2 /*return*/, response];
                                    }
                                });
                            }); })
                                .catch(function (err) {
                                console.log(err);
                            })];
                    case 2:
                        ssData = _d.sent();
                        diffSearch = ssData.diff.toLowerCase();
                        if (diffSearch == 'expert+')
                            diffSearch = 'expertPlus';
                        diffInfo = bsData.metadata.characteristics.find(function (x) { return x.name == 'Standard'; }).difficulties[diffSearch];
                        info = {
                            songHash: bsData.hash.toUpperCase(),
                            songName: bsData.metadata.songName,
                            songAuthor: bsData.metadata.songAuthorName,
                            levelAuthor: bsData.metadata.levelAuthorName,
                            key: bsData.key,
                            numNotes: (diffInfo ? diffInfo.notes : 0),
                            songDiff: ssData.diff,
                            ssLink: "https://scoresaber.com" + ssData.ssLink,
                            poolId: 0
                        };
                        values = [];
                        try {
                            for (_a = __values(data.poolIds), _b = _a.next(); !_b.done; _b = _a.next()) {
                                id = _b.value;
                                info.poolId = id;
                                values.push(Object.values(info));
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery("INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, `key`, numNotes, songDiff, ssLink, poolId) VALUES ?", [values])];
                    case 4:
                        res = _d.sent();
                        return [2 /*return*/, {
                                data: res,
                                flag: false,
                                err: null
                            }];
                    case 5:
                        err_1 = _d.sent();
                        return [2 /*return*/, {
                                data: null,
                                flag: true,
                                err: err_1
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    tournaments.prototype.getBracket = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var bracketData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT bracket.*,\n        u1.globalRank as p1Rank,\n        u2.globalRank as p2Rank,\n        u1.name as p1Name,\n        u2.name as p2Name,\n        u1.country as p1Country,\n        u2.country as p2Country,\n        u1.avatar as p1Avatar,\n        u2.avatar as p2Avatar,\n        u1.twitchName as p1Twitch,\n        u2.twitchName as p2Twitch,\n        par1.seed as p1Seed,\n        par2.seed as p2Seed\n        \n        FROM bracket\n        LEFT JOIN users u1 ON bracket.p1 = u1.discordId\n        LEFT JOIN users u2 ON bracket.p2 = u2.discordId\n        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)\n        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)\n        WHERE bracket.tournamentId = ? ", [id])];
                    case 1:
                        bracketData = _a.sent();
                        return [2 /*return*/, bracketData];
                }
            });
        });
    };
    tournaments.prototype.updateBracket = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var err, error_2, error_3, settings, bracket, thisMatch, winner, loser, winnersRound_1, maxRound, winnersMatch_1, playerIdentifier, nextMatch, error_4, winnersRound_2, maxRound, winnersMatch_2, winnerIdentifier, nextMatch, error_5, loserRound_1, loserMatch_1, loserIdentifier, loserNextMatch, error_6, winnersMatch_3, nextMatch, error_7, winnersMatch_4, nextMatch, error_8, winnersRound_3, minRound, maxRound, winnersMatch_5, winnerIdentifier, nextMatch, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        err = null;
                        if (!(data.status == 'update')) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "in_progress" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        err = error_2;
                        throw error_2;
                    case 4: return [2 /*return*/, { flag: !!err, err: err }];
                    case 5:
                        if (!(data.status == 'complete')) return [3 /*break*/, 41];
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "complete" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId])];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_3 = _a.sent();
                        err = error_3;
                        throw error_3;
                    case 9: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id])];
                    case 10:
                        settings = _a.sent();
                        return [4 /*yield*/, this.getBracket(id)];
                    case 11:
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
                        if (!(settings[0].type == 'single_elim')) return [3 /*break*/, 16];
                        winnersRound_1 = thisMatch.round + 1;
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        if (!(winnersRound_1 <= maxRound)) return [3 /*break*/, 15];
                        winnersMatch_1 = Math.floor(thisMatch.matchNum / 2);
                        playerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_1 && x.matchNum == winnersMatch_1; });
                        _a.label = 12;
                    case 12:
                        _a.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [playerIdentifier, winner, nextMatch.id])];
                    case 13:
                        _a.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        error_4 = _a.sent();
                        err = error_4;
                        throw error_4;
                    case 15: return [2 /*return*/, { flag: !!err, err: err }];
                    case 16:
                        if (!(settings[0].type == 'double_elim')) return [3 /*break*/, 40];
                        if (!(thisMatch.round >= 0)) return [3 /*break*/, 35];
                        winnersRound_2 = thisMatch.round + 1;
                        maxRound = Math.max.apply(Math, bracket.map(function (x) { return x.round; }));
                        if (!(winnersRound_2 < maxRound)) return [3 /*break*/, 25];
                        winnersMatch_2 = Math.floor(thisMatch.matchNum / 2);
                        winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_2; });
                        _a.label = 17;
                    case 17:
                        _a.trys.push([17, 19, , 20]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])];
                    case 18:
                        _a.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        error_5 = _a.sent();
                        err = error_5;
                        throw error_5;
                    case 20:
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
                        _a.label = 21;
                    case 21:
                        _a.trys.push([21, 23, , 24]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [loserIdentifier, loser, loserNextMatch.id])];
                    case 22:
                        _a.sent();
                        return [3 /*break*/, 24];
                    case 23:
                        error_6 = _a.sent();
                        err = error_6;
                        throw error_6;
                    case 24: return [3 /*break*/, 34];
                    case 25:
                        if (!(winnersRound_2 == maxRound && data.p1Score < data.p2Score)) return [3 /*break*/, 30];
                        winnersMatch_3 = 0;
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_3; });
                        _a.label = 26;
                    case 26:
                        _a.trys.push([26, 28, , 29]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET p1 = ?, p2 = ?, bye = 0 WHERE id = ?', [winner, loser, nextMatch.id])];
                    case 27:
                        _a.sent();
                        return [3 /*break*/, 29];
                    case 28:
                        error_7 = _a.sent();
                        err = error_7;
                        throw error_7;
                    case 29: return [3 /*break*/, 34];
                    case 30:
                        if (!(winnersRound_2 == maxRound && data.p1Score > data.p2Score)) return [3 /*break*/, 34];
                        winnersMatch_4 = 0;
                        nextMatch = bracket.find(function (x) { return x.round == winnersRound_2 && x.matchNum == winnersMatch_4; });
                        _a.label = 31;
                    case 31:
                        _a.trys.push([31, 33, , 34]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET bye = 1 WHERE id = ?', [nextMatch.id])];
                    case 32:
                        _a.sent();
                        return [3 /*break*/, 34];
                    case 33:
                        error_8 = _a.sent();
                        err = error_8;
                        throw error_8;
                    case 34: return [3 /*break*/, 40];
                    case 35:
                        if (!(thisMatch.round < 0)) return [3 /*break*/, 40];
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
                        _a.label = 36;
                    case 36:
                        _a.trys.push([36, 38, , 39]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])];
                    case 37:
                        _a.sent();
                        return [3 /*break*/, 39];
                    case 38:
                        error_9 = _a.sent();
                        err = error_9;
                        throw error_9;
                    case 39: return [2 /*return*/, { flag: !!err, err: err }];
                    case 40: return [2 /*return*/, { flag: !!err, err: err }];
                    case 41: return [2 /*return*/, []];
                }
            });
        });
    };
    tournaments.prototype.saveBracket = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var matches, tempMatches, tempMatches_1, tempMatches_1_1, match, tempMatches, tempMatches_2, tempMatches_2_1, match, err, sqlMatches, matches_1, matches_1_1, match, error_10;
            var e_9, _a, e_10, _b, e_11, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        matches = [];
                        console.log(data);
                        if (!(data.data == null || (data.data.length == 0 || Object.keys(data.data).length == 0))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateBracket(id)];
                    case 1:
                        tempMatches = _d.sent();
                        try {
                            // console.log(tempMatches);
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
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (tempMatches_1_1 && !tempMatches_1_1.done && (_a = tempMatches_1.return)) _a.call(tempMatches_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(data.data.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.generateBracket(id, data.data)];
                    case 3:
                        tempMatches = _d.sent();
                        try {
                            // console.log(tempMatches);
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
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (tempMatches_2_1 && !tempMatches_2_1.done && (_b = tempMatches_2.return)) _b.call(tempMatches_2);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        _d.label = 4;
                    case 4:
                        err = null;
                        sqlMatches = [];
                        try {
                            for (matches_1 = __values(matches), matches_1_1 = matches_1.next(); !matches_1_1.done; matches_1_1 = matches_1.next()) {
                                match = matches_1_1.value;
                                sqlMatches.push(Object.values(match));
                            }
                        }
                        catch (e_11_1) { e_11 = { error: e_11_1 }; }
                        finally {
                            try {
                                if (matches_1_1 && !matches_1_1.done && (_c = matches_1.return)) _c.call(matches_1);
                            }
                            finally { if (e_11) throw e_11.error; }
                        }
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, this.db.asyncPreparedQuery('DELETE FROM bracket WHERE tournamentId = ?', [id])];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, this.db.asyncPreparedQuery('INSERT INTO bracket (tournamentId, round, matchNum, p1, p2, bye) VALUES ?', [sqlMatches])];
                    case 7:
                        _d.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_10 = _d.sent();
                        err = error_10;
                        throw error_10;
                    case 9: return [2 /*return*/, { flag: !!err, err: err }];
                }
            });
        });
    };
    tournaments.prototype.generateBracket = function (id, players) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, rand, participants, i, participants_2, participants_2_1, participant, e_12_1, matches;
            var e_12, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id])];
                    case 1:
                        settings = _b.sent();
                        rand = false;
                        if (settings[0].bracket_sort_method == 'random') {
                            settings[0].bracket_sort_method = 'discordId';
                            rand = true;
                        }
                        participants = [];
                        if (!!players) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.id AS participantId,\n            CAST(p.userId AS CHAR) as userId,\n            p.forfeit,\n            p.seed as seed,\n            CAST(`u`.`discordId` AS CHAR) as discordId,\n            CAST(`u`.`ssId` AS CHAR) as ssId,\n            `u`.`name`,\n            `u`.`twitchName`,\n            `u`.`avatar`,\n            `u`.`globalRank` as globalRank,\n            `u`.`localRank`,\n            `u`.`country`,\n            `u`.`tourneyRank` as tournamentRank,\n            `u`.`TR`,\n            `u`.`pronoun`\n            FROM participants p\n            LEFT JOIN users u ON u.discordId = p.userId\n            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n            WHERE p.tournamentId = ? ORDER BY " + settings[0].bracket_sort_method + "=0, " + settings[0].bracket_sort_method + " " + (rand ? '' : 'LIMIT ?'), [id, settings[0].bracket_limit])
                                .catch(function (err) {
                                console.error(err);
                            })];
                    case 2:
                        participants = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        participants = players;
                        _b.label = 4;
                    case 4:
                        if (rand) {
                            this.shuffle(participants);
                        }
                        participants.length = settings[0].bracket_limit;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id])];
                    case 5:
                        _b.sent();
                        if (!(settings[0].bracket_sort_method != 'seed' && !players)) return [3 /*break*/, 13];
                        i = 1;
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 11, 12, 13]);
                        participants_2 = __values(participants), participants_2_1 = participants_2.next();
                        _b.label = 7;
                    case 7:
                        if (!!participants_2_1.done) return [3 /*break*/, 10];
                        participant = participants_2_1.value;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("UPDATE participants SET seed = ? WHERE id = ?", [i, participant.participantId])];
                    case 8:
                        _b.sent();
                        i++;
                        _b.label = 9;
                    case 9:
                        participants_2_1 = participants_2.next();
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_12_1 = _b.sent();
                        e_12 = { error: e_12_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (participants_2_1 && !participants_2_1.done && (_a = participants_2.return)) _a.call(participants_2);
                        }
                        finally { if (e_12) throw e_12.error; }
                        return [7 /*endfinally*/];
                    case 13:
                        if (!(settings[0].type == 'single_elim')) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.winnersRoundMatches(settings, participants, !!players)];
                    case 14:
                        matches = _b.sent();
                        return [3 /*break*/, 17];
                    case 15:
                        if (!(settings[0].type == 'double_elim')) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.doubleElimMatches(settings, participants, !!players)];
                    case 16:
                        matches = _b.sent();
                        _b.label = 17;
                    case 17: return [2 /*return*/, matches];
                }
            });
        });
    };
    tournaments.prototype.winnersRoundMatches = function (settings, participants, custom) {
        if (custom === void 0) { custom = false; }
        return __awaiter(this, void 0, void 0, function () {
            var numParticipants, seeds, matches, rounds, byes, numMatches, byePlayers, roundMatches, totalMatches, i, p1Id, p1Name, p1Avatar, isBye, p2Id, p2Name, p2Avatar, nextMatch, temp, i, x, _loop_2, j, temp, temp;
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
                console.log(custom);
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
                    console.log(p1Id, p1Name);
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
                    _loop_2 = function (j) {
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
                            p2Avatar: p2Avatar,
                        };
                        matches.push(temp);
                    };
                    for (j = 0; j < roundMatches; j++) {
                        _loop_2(j);
                    }
                    if (settings[0].type == 'double_elim' && roundMatches == 1) {
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
                if (settings[0].type == 'double_elim') {
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
    tournaments.prototype.doubleElimMatches = function (settings, participants, custom) {
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
                                    p1: '',
                                    p2: '',
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
    tournaments.prototype.saveQualScore = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var tournamentSettings, userInfo, mapPool, savedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId])];
                    case 1:
                        tournamentSettings = _a.sent();
                        if (tournamentSettings.length <= 0 || (tournamentSettings[0].state != 'qualifiers' && !!tournamentSettings[0].public))
                            return [2 /*return*/, { error: 'invalid tournament settings' }];
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.*, u.discordId FROM participants p LEFT JOIN users u ON u.discordId = p.userId WHERE u.ssId = ? AND p.tournamentId = ?", [data.ssId, data.tournamentId])];
                    case 2:
                        userInfo = _a.sent();
                        if (userInfo.length <= 0)
                            return [2 /*return*/, { error: "invalid user" }];
                        delete data.ssId;
                        data.userId = userInfo[0].discordId;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT pl.songHash FROM pool_link pl LEFT JOIN map_pools mp ON pl.poolId = mp.id WHERE mp.tournamentId = ? AND is_qualifiers = 1 AND live = 1", [data.tournamentId])];
                    case 3:
                        mapPool = _a.sent();
                        // console.log(mapPool.some(x=> x.songHash == data.songHash));
                        if (!mapPool.some(function (x) { return x.songHash.toLowerCase() == data.songHash.toLowerCase(); }))
                            return [2 /*return*/, { error: "invalid song hash" }];
                        data.percentage = +data.score / +data.totalScore;
                        if (data.percentage >= 1)
                            return [2 /*return*/, { error: "invalid score" }];
                        data.maxScore = data.totalScore;
                        delete data.totalScore;
                        return [4 /*yield*/, this.db.asyncPreparedQuery("INSERT INTO qualifier_scores SET ?\n        ON DUPLICATE KEY UPDATE\n        score = GREATEST(score, VALUES(score)),\n        percentage = GREATEST(percentage, VALUES(percentage)),\n        maxScore = GREATEST(maxScore, VALUES(maxScore))", [data, +data.score, data.percentage, data.maxScore])];
                    case 4:
                        savedData = _a.sent();
                        if (savedData.insertId == 0)
                            return [2 /*return*/, { error: 'Did not beat score' }];
                        return [2 /*return*/, { data: "score saved successfully", flag: false }];
                }
            });
        });
    };
    tournaments.prototype.getQualsScores = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var qualsScores, scores, _loop_3, qualsScores_3, qualsScores_3_1, score;
            var e_13, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT p.userId as discordId, p.forfeit, q.score, q.percentage, pl.*, u.* FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        LEFT JOIN qualifier_scores q ON p.userId = q.userId \n        LEFT JOIN map_pools mp ON mp.tournamentId = p.tournamentId\n        LEFT JOIN pool_link pl ON (pl.songHash = q.songHash AND pl.poolId = mp.id)\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE ts.show_quals = 1 AND ts.show_quals = 1 AND p.tournamentId = ? AND mp.live = 1 AND mp.is_qualifiers AND mp.tournamentId = ? AND (q.tournamentId IS NULL OR q.tournamentId = ?)", [id, id, id])];
                    case 1:
                        qualsScores = _b.sent();
                        scores = [];
                        _loop_3 = function (score) {
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
                            for (qualsScores_3 = __values(qualsScores), qualsScores_3_1 = qualsScores_3.next(); !qualsScores_3_1.done; qualsScores_3_1 = qualsScores_3.next()) {
                                score = qualsScores_3_1.value;
                                _loop_3(score);
                            }
                        }
                        catch (e_13_1) { e_13 = { error: e_13_1 }; }
                        finally {
                            try {
                                if (qualsScores_3_1 && !qualsScores_3_1.done && (_a = qualsScores_3.return)) _a.call(qualsScores_3);
                            }
                            finally { if (e_13) throw e_13.error; }
                        }
                        return [2 /*return*/, scores];
                }
            });
        });
    };
    tournaments.prototype.checkKey = function (id, key) {
        return __awaiter(this, void 0, void 0, function () {
            var keyData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM api_keys WHERE tournamentId = ?", [id])];
                    case 1:
                        keyData = _a.sent();
                        if (keyData[0].api_key == key)
                            return [2 /*return*/, true];
                        return [2 /*return*/, false];
                }
            });
        });
    };
    tournaments.prototype.getBSData = function (hash, diff, callback) {
        rp.get('https://beatsaver.com/api/maps/by-hash/' + hash, {
            headers: {
                "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
            }
        })
            .then(function (res) {
            var info = {
                songHash: hash,
                songName: res.metadata.songName,
                songAuthor: res.metadata.songAuthorName,
                levelAuthor: res.metadata.levelAuthorName,
                key: res.key,
                numNotes: res.metadata.characteristics.find(function (x) { return x.name == 'Standard'; }).difficulties[diff].notes
            };
            callback(info);
            return null;
        })
            .catch(function (err) {
            console.debug(hash);
            console.error(err);
        });
    };
    tournaments.prototype.getSettings = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    tournaments.prototype.formatDate = function (date) {
        var d = new Date(date), month = '' + (d.getUTCMonth() + 1), day = '' + d.getUTCDate(), year = d.getUTCFullYear();
        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        return [year, month, day].join('-');
    };
    tournaments.prototype.formatDate2 = function (date) {
        var d = new Date(date);
        return d.toISOString().slice(0, 19).replace('T', ' ');
    };
    tournaments.prototype.isBase64 = function (str) {
        var base64regex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i;
        return base64regex.test(str);
    };
    tournaments.prototype.seeding = function (numPlayers) {
        var nextPlayer = function (player) {
            var e_14, _a;
            var out = [];
            var length = player.length * 2 + 1;
            try {
                for (var player_1 = __values(player), player_1_1 = player_1.next(); !player_1_1.done; player_1_1 = player_1.next()) {
                    var value = player_1_1.value;
                    out.push(value);
                    out.push(length - value);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (player_1_1 && !player_1_1.done && (_a = player_1.return)) _a.call(player_1);
                }
                finally { if (e_14) throw e_14.error; }
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
    tournaments.prototype.sumProperty = function (items, prop) {
        if (items == null) {
            return 0;
        }
        return items.reduce(function (a, b) {
            return b[prop] == null ? a : a + b[prop];
        }, 0);
    };
    tournaments.prototype.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };
    tournaments.prototype.randHash = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    return tournaments;
}());
exports.tournaments = tournaments;
