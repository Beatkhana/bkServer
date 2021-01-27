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
exports.MapPoolController = void 0;
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
var rp = __importStar(require("request-promise"));
var cheerio_1 = __importDefault(require("cheerio"));
var MapPoolController = /** @class */ (function (_super) {
    __extends(MapPoolController, _super);
    function MapPoolController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MapPoolController.prototype.addPool = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        if (!(req.body.is_qualifiers == 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.db.aQuery("UPDATE map_pools SET is_qualifiers = 0 WHERE tournamentId = ?", [auth.tourneyId])];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.db.aQuery("INSERT INTO map_pools SET ?", [req.body])];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_1 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    MapPoolController.prototype.getPools = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, mapOptions, sql, poolsRes, mapPools, _loop_1, poolsRes_1, poolsRes_1_1, song;
            var e_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_c.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_c.sent());
                        _c.label = 3;
                    case 3:
                        isAuth = _a;
                        mapOptions = [];
                        sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?";
                        if (!isAuth) return [3 /*break*/, 5];
                        sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?";
                        return [4 /*yield*/, this.db.aQuery("SELECT * FROM event_map_options WHERE tournament_id = ?", [auth.tourneyId])];
                    case 4:
                        mapOptions = _c.sent();
                        _c.label = 5;
                    case 5: return [4 /*yield*/, this.db.aQuery(sql, [auth.tourneyId])];
                    case 6:
                        poolsRes = _c.sent();
                        mapPools = {};
                        _loop_1 = function (song) {
                            if (song.poolId in mapPools) {
                                var tmpSong = {
                                    id: song.songId,
                                    hash: song.songHash,
                                    name: song.songName,
                                    songAuthor: song.songAuthor,
                                    levelAuthor: song.levelAuthor,
                                    diff: song.songDiff,
                                    key: song.key,
                                    ssLink: song.ssLink,
                                    numNotes: song.numNotes
                                };
                                if (isAuth && mapOptions.find(function (x) { return x.map_id == song.songId; })) {
                                    tmpSong.flags = mapOptions.find(function (x) { return x.map_id == song.songId; }).flags;
                                }
                                mapPools[song.poolId].songs.push(tmpSong);
                            }
                            else {
                                var songs = [];
                                if (song.songId != null) {
                                    var tmpSong = {
                                        id: song.songId,
                                        hash: song.songHash,
                                        name: song.songName,
                                        songAuthor: song.songAuthor,
                                        levelAuthor: song.levelAuthor,
                                        diff: song.songDiff,
                                        key: song.key,
                                        ssLink: song.ssLink,
                                        numNotes: song.numNotes
                                    };
                                    if (isAuth && mapOptions.find(function (x) { return x.map_id == song.songId; })) {
                                        tmpSong.flags = mapOptions.find(function (x) { return x.map_id == song.songId; }).flags;
                                    }
                                    songs = [tmpSong];
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
                        };
                        try {
                            // console.log(result)
                            // if (poolsRes == undefined) return callback({});
                            for (poolsRes_1 = __values(poolsRes), poolsRes_1_1 = poolsRes_1.next(); !poolsRes_1_1.done; poolsRes_1_1 = poolsRes_1.next()) {
                                song = poolsRes_1_1.value;
                                _loop_1(song);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (poolsRes_1_1 && !poolsRes_1_1.done && (_b = poolsRes_1.return)) _b.call(poolsRes_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [2 /*return*/, res.send(mapPools)];
                }
            });
        });
    };
    MapPoolController.prototype.updatePool = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, data, poolId, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        isAuth = _a;
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        poolId = data.poolId;
                        delete data.poolId;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        if (!(req.body.is_qualifiers == 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.db.aQuery("UPDATE map_pools SET is_qualifiers = 0 WHERE tournamentId = ?", [auth.tourneyId])];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.db.aQuery("UPDATE map_pools SET ? WHERE id = ?", [data, poolId])];
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
    MapPoolController.prototype.downloadPool = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, pool, tournamentName, curSongs, playlist, data, filename;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        isAuth = _a;
                        if (!req.params.id)
                            return [2 /*return*/, this.clientError(res, "Please provide a map pool ID")];
                        return [4 /*yield*/, this.db.aQuery("SELECT map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, pool_link.songHash FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE (map_pools.live = ? OR map_pools.live = 1) AND map_pools.id = ?", [+!isAuth, req.params.id])];
                    case 4:
                        pool = _b.sent();
                        if (!pool[0])
                            return [2 /*return*/, this.clientError(res, "Invalid Map Pool ID")];
                        return [4 /*yield*/, this.db.aQuery("SELECT name FROM tournaments WHERE id = ?", [pool[0].tournamentId])];
                    case 5:
                        tournamentName = _b.sent();
                        curSongs = pool.map(function (e) { return { hash: e.songHash }; });
                        playlist = {
                            playlistTitle: tournamentName[0].name + "_" + pool[0].poolName,
                            playlistAuthor: tournamentName[0].name + " Through BeatKhana!",
                            playlistDescription: pool[0].description,
                            image: pool[0].image,
                            songs: curSongs
                        };
                        data = JSON.stringify(playlist);
                        filename = playlist.playlistTitle.replace(/[<>:"\/\\|?*]+/g, '').replace(/ /g, '_');
                        res.setHeader('Content-disposition', "attachment; filename= " + filename + ".json");
                        res.setHeader('Content-type', 'application/json');
                        return [2 /*return*/, res.send(data)];
                }
            });
        });
    };
    MapPoolController.prototype.addSongSS = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, data, html, hash, diff, diffSearch, songInfo, values, _b, _c, id, error_3;
            var e_2, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_e.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_e.sent());
                        _e.label = 3;
                    case 3:
                        isAuth = _a;
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, rp.get(data.ssLink)];
                    case 5:
                        html = _e.sent();
                        hash = cheerio_1.default('.box.has-shadow > b', html).text();
                        diff = cheerio_1.default('li.is-active > a > span', html).text();
                        diffSearch = diff.toLowerCase();
                        if (diffSearch == 'expert+')
                            diffSearch = 'expertPlus';
                        return [4 /*yield*/, this.getBSData(hash, diffSearch)];
                    case 6:
                        songInfo = _e.sent();
                        songInfo.songDiff = diff;
                        songInfo.ssLink = data.ssLink;
                        values = [];
                        try {
                            for (_b = __values(data.poolIds), _c = _b.next(); !_c.done; _c = _b.next()) {
                                id = _c.value;
                                songInfo.poolId = id;
                                values.push(Object.values(songInfo));
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, `key`, numNotes, songDiff, ssLink, poolId) VALUES ?", [values])];
                    case 7:
                        _e.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_3 = _e.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    MapPoolController.prototype.addSongBS = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, data, key, diff, bsData, songName, songHash, ssData, diffSearch, diffInfo, info, values, _b, _c, id, err_1;
            var e_3, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_e.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_e.sent());
                        _e.label = 3;
                    case 3:
                        isAuth = _a;
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        key = data.ssLink.split('beatmap/')[1];
                        diff = data.diff;
                        return [4 /*yield*/, rp.get('https://beatsaver.com/api/maps/detail/' + key, {
                                headers: {
                                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                                },
                                json: true
                            })
                                .catch(function (err) { return console.log(err); })];
                    case 4:
                        bsData = _e.sent();
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
                                                    if ($(e).find('img').attr('src')) {
                                                        var curHash = $(e).find('img').attr('src').replace("/imports/images/songs/", "").replace(".png", "");
                                                        if (curHash.toLowerCase() == songHash.toLowerCase()) {
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
                    case 5:
                        ssData = _e.sent();
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
                            for (_b = __values(data.poolIds), _c = _b.next(); !_c.done; _c = _b.next()) {
                                id = _c.value;
                                info.poolId = id;
                                values.push(Object.values(info));
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, `key`, numNotes, songDiff, ssLink, poolId) VALUES ?", [values])];
                    case 7:
                        _e.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 8:
                        err_1 = _e.sent();
                        return [2 /*return*/, this.fail(res, err_1)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    MapPoolController.prototype.getBSData = function (hash, diff) {
        return __awaiter(this, void 0, void 0, function () {
            var res, info, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, rp.get('https://beatsaver.com/api/maps/by-hash/' + hash, {
                                headers: {
                                    "User-Agent": "BeatKhana/1.0.0 (+https://github.com/Dannypoke03)"
                                }
                            })];
                    case 1:
                        res = _a.sent();
                        res = JSON.parse(res);
                        info = {
                            songHash: hash,
                            songName: res.metadata.songName,
                            songAuthor: res.metadata.songAuthorName,
                            levelAuthor: res.metadata.levelAuthorName,
                            key: res.key,
                            numNotes: res.metadata.characteristics.find(function (x) { return x.name == 'Standard'; }).difficulties[diff].notes
                        };
                        return [2 /*return*/, info];
                    case 2:
                        error_4 = _a.sent();
                        console.error(error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MapPoolController.prototype.deleteSong = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.tournamentMapPool];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        isAuth = _a;
                        if (!isAuth)
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.body.id)
                            return [2 /*return*/, this.clientError(res, "No song id provided")];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery("DELETE FROM pool_link WHERE id = ?", [req.body.id])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_5 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_5)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MapPoolController;
}(controller_1.controller));
exports.MapPoolController = MapPoolController;
