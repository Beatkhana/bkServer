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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapPoolController = void 0;
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
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
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO map_pools SET ?", [req.body])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_1 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MapPoolController.prototype.getPools = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, isAuth, _a, sql, poolsRes, mapPools, _i, poolsRes_1, song, songs;
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
                        sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE map_pools.live = 1 AND tournamentId = ?";
                        if (isAuth) {
                            sql = "SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink, pool_link.numNotes, map_pools.is_qualifiers FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?";
                        }
                        return [4 /*yield*/, this.db.aQuery(sql, [auth.tourneyId])];
                    case 4:
                        poolsRes = _b.sent();
                        mapPools = {};
                        // console.log(result)
                        // if (poolsRes == undefined) return callback({});
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
                        data = req.body;
                        poolId = data.poolId;
                        delete data.poolId;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery("UPDATE map_pools SET ? WHERE id = ?", [data, poolId])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_2 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_2)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MapPoolController;
}(controller_1.controller));
exports.MapPoolController = MapPoolController;
