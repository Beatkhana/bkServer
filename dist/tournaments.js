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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournaments = void 0;
var database_1 = require("./database");
// import jimp from 'jimp';
var sharp_1 = __importDefault(require("sharp"));
var rp = __importStar(require("request-promise"));
var cheerio_1 = __importDefault(require("cheerio"));
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
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getActive = function (callback, userId) {
        if (userId === void 0) { userId = 0; }
        var sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = "AND (ts.public = 1 OR owner = " + userId + ")";
                break;
            case userId < 0:
                sqlWhere = "";
                break;
            case userId == 0:
                sqlWhere = "AND ts.public = 1";
                break;
        }
        var result = this.db.query("SELECT `tournaments`.`id`,\n        `tournaments`.`name`,\n        `tournaments`.`image`,\n        `tournaments`.`date`,\n        `tournaments`.`endDate`,\n        `tournaments`.`discord`,\n        `tournaments`.`twitchLink`,\n        `tournaments`.`prize`,\n        `tournaments`.`info`,\n        CAST(`tournaments`.`owner` AS CHAR) as owner,\n        `tournaments`.`archived`,\n        `tournaments`.`first`,\n        `tournaments`.`second`,\n        `tournaments`.`third`,\n        ts.public\n        FROM tournaments \n        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id \n        WHERE archived = 0 " + sqlWhere, function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getArchived = function (callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, discord, twitchLink, prize, info, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getTournament = function (id, callback, userId) {
        if (userId === void 0) { userId = 0; }
        var sqlWhere = "";
        switch (true) {
            case userId > 0:
                sqlWhere = "AND (ts.public = 1 OR owner = " + userId + ")";
                break;
            case userId < 0:
                sqlWhere = "";
                break;
            case userId == 0:
                sqlWhere = "AND ts.public = 1";
                break;
        }
        var result = this.db.query("SELECT `tournaments`.`id` as tournamentId,\n        `tournaments`.`name`,\n        `tournaments`.`image`,\n        `tournaments`.`date`,\n        `tournaments`.`endDate`,\n        `tournaments`.`discord`,\n        `tournaments`.`twitchLink`,\n        `tournaments`.`prize`,\n        `tournaments`.`info`,\n        CAST(`tournaments`.`owner` AS CHAR) as owner,\n        `tournaments`.`archived`,\n        `tournaments`.`first`,\n        `tournaments`.`second`,\n        `tournaments`.`third`,\n        ts.id as settingsId,\n        ts.tournamentId,\n        ts.public_signups,\n        ts.public,\n        ts.state,\n        ts.type,\n        ts.has_bracket,\n        ts.has_map_pool\n        FROM tournaments \n        LEFT JOIN tournament_settings ts ON ts.tournamentId = tournaments.id \n        WHERE tournaments.id = " + id + " " + sqlWhere, function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.participants = function (id, callback) {
        var result = this.db.query("SELECT p.id AS participantId,\n        CAST(p.userId AS CHAR) as userId,\n        p.forfeit,\n        p.seed,\n        CAST(`u`.`discordId` AS CHAR) as discordId,\n        CAST(`u`.`ssId` AS CHAR) as ssId,\n        `u`.`name`,\n        `u`.`twitchName`,\n        `u`.`avatar`,\n        `u`.`globalRank`,\n        `u`.`localRank`,\n        `u`.`country`,\n        `u`.`tourneyRank`,\n        `u`.`TR`,\n        `u`.`pronoun`\n        FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        WHERE p.tournamentId = " + id, function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.save = function (data, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var base64String, base64Img, imgName, savePath, buf, webpData, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        base64String = data.image;
                        base64Img = base64String.split(';base64,').pop();
                        imgName = data.imgName;
                        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
                        savePath = this.env == 'development' ? '../app/src/assets/images/' : './public/assets/images/';
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 1:
                        buf = _a.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 550 })
                                .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 2:
                        webpData = _a.sent();
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + imgName)
                                .catch(function (err) {
                                return callback({
                                    flag: true,
                                    err: err
                                });
                            })];
                    case 3:
                        _a.sent();
                        data.image = 'assets/images/' + imgName;
                        delete data.imgName;
                        try {
                            data.date = this.formatDate(data.date);
                            data.endDate = this.formatDate(data.endDate);
                        }
                        catch (err) {
                            return [2 /*return*/, callback({
                                    flag: true,
                                    err: err
                                })];
                        }
                        result = this.db.preparedQuery("INSERT INTO tournaments SET ?", [data], function (err, result) {
                            var flag = false;
                            if (err)
                                flag = true;
                            if (!err) {
                                _this.db.preparedQuery('INSERT INTO tournament_settings SET tournamentId = ?', [result.insertId], function (err, result2) {
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
                                return callback({
                                    data: result,
                                    flag: flag,
                                    err: err
                                });
                            }
                        });
                        return [2 /*return*/];
                }
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
        try {
            data.tournament.date = this.formatDate(data.tournament.date);
            data.tournament.endDate = this.formatDate(data.tournament.endDate);
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
    tournaments.prototype.updateSettings = function (data, callback) {
        var result = this.db.preparedQuery("UPDATE tournament_settings SET ? WHERE ?? = ?", [data.settings, 'id', data.settingsId], function (err, result) {
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
    tournaments.prototype.signUp = function (data, callback) {
        var _this = this;
        this.db.preparedQuery("SELECT public_signups FROM tournament_settings WHERE tournamentId = ?", [data.tournamentId], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            if (result[0].public_signups = 1) {
                var result_1 = _this.db.preparedQuery("INSERT INTO participants SET ?", [data], function (err, result) {
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
                return callback({
                    data: result,
                    flag: true,
                    err: err
                });
            }
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
    tournaments.prototype.events = function (callback) {
        var result = this.db.query("SELECT id, name, date as startDate, endDate FROM tournaments ORDER BY date", function (err, result) {
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
    tournaments.prototype.getMapPools = function (tournamentId, callback, isAuth) {
        if (isAuth === void 0) { isAuth = false; }
        var sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?";
        if (isAuth) {
            sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?";
        }
        this.db.preparedQuery(sql, [tournamentId], function (err, result) {
            var mapPools = {};
            // console.log(result)
            if (result == undefined)
                return callback({});
            for (var _i = 0, result_2 = result; _i < result_2.length; _i++) {
                var song = result_2[_i];
                if (song.poolId in mapPools) {
                    mapPools[song.poolId].songs.push({
                        id: song.songId,
                        hash: song.songHash,
                        name: song.songName,
                        songAuthor: song.songAuthor,
                        levelAuthor: song.levelAuthor,
                        diff: song.songDiff,
                        key: song.key,
                        ssLink: song.ssLink
                    });
                }
                else {
                    var songs = [];
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
                                ssLink: song.ssLink
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
                        songs: songs
                    };
                }
            }
            return callback(mapPools);
        });
    };
    tournaments.prototype.addSong = function (data, callback) {
        var _this = this;
        console.log(data);
        rp.get(data.ssLink)
            .then(function (html) {
            var hash = cheerio_1.default('.box.has-shadow > b', html).text();
            var diff = cheerio_1.default('li.is-active > a > span', html).text();
            var songInfo = _this.getBSData(hash, function (songInfo) {
                songInfo.songDiff = diff;
                songInfo.ssLink = data.ssLink;
                var values = [];
                for (var _i = 0, _a = data.poolIds; _i < _a.length; _i++) {
                    var id = _a[_i];
                    songInfo.poolId = id;
                    values.push(Object.values(songInfo));
                }
                _this.saveSong(values, function (res) {
                    callback(res);
                });
                return null;
            });
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
        this.db.preparedQuery("INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, `key`, songDiff, ssLink, poolId) VALUES ?", [data], function (err, result) {
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
    tournaments.prototype.getBSData = function (hash, callback) {
        rp.get('https://beatsaver.com/api/maps/by-hash/' + hash, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
            },
            json: true
        })
            .then(function (res) {
            var info = {
                songHash: hash,
                songName: res.metadata.songName,
                songAuthor: res.metadata.songAuthorName,
                levelAuthor: res.metadata.levelAuthorName,
                key: res.key
            };
            return callback(info);
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
    return tournaments;
}());
exports.tournaments = tournaments;
