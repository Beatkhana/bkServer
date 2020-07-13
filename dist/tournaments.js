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
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }
    tournaments.prototype.getAll = function (callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, signup, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getActive = function (callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, signup, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 0", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getArchived = function (callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, \`date\`, endDate, \`time\`, signup, discord, twitchLink, prize, info, challongeLink, archived, \`first\`, \`second\`, third FROM tournaments WHERE archived = 1", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getTournament = function (id, callback) {
        var data = [];
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner, id, name, image, `date`, endDate, `time`, signup, discord, twitchLink, prize, info, challongeLink, archived, `first`, `second`, third FROM tournaments WHERE id = " + id, function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.save = function (data, callback) {
        var base64String = data.image;
        var base64Img = base64String.split(';base64,').pop();
        var imgName = data.imgName;
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
        // jimp
        var buf = Buffer.from(base64Img, 'base64');
        sharp_1.default(buf)
            .resize({ width: 550 })
            .toFile('./public/assets/images/' + imgName)
            .catch(function (err) { console.log(err); });
        data.image = 'assets/images/' + imgName;
        delete data.imgName;
        console.log(data);
        var result = this.db.preparedQuery("INSERT INTO tournaments SET ?", [data], function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.delete = function (id, callback) {
        var result = this.db.preparedQuery("DELETE FROM tournaments WHERE id = ?", [id], function (err, result) {
            if (err)
                return callback({ 'error': err });
            return callback({ 'message': "success" });
        });
    };
    tournaments.prototype.update = function (data, callback) {
        // console.log(data);
        var result = this.db.preparedQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', data.id], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag
            });
        });
    };
    tournaments.prototype.archive = function (data, callback) {
        // console.log(data);
        var id = data.tournament.id;
        delete data.tournament.id;
        data.tournament.archived = 1;
        // console.log(data);
        var result = this.db.preparedQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', id], function (err, result) {
            return callback(result);
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
                flag: flag
            });
        });
    };
    tournaments.prototype.getMapPools = function (tournamentId, callback) {
        this.db.preparedQuery("SELECT map_pools.id as 'poolId', map_pools.tournamentId, map_pools.poolName, map_pools.image, map_pools.description, map_pools.live, pool_link.id as 'songId', pool_link.songHash, pool_link.songName, pool_link.songAuthor, pool_link.levelAuthor, pool_link.songDiff, pool_link.key, pool_link.ssLink FROM map_pools LEFT JOIN pool_link ON pool_link.poolId = map_pools.id WHERE tournamentId = ?", [tournamentId], function (err, result) {
            var mapPools = {};
            // console.log(result)
            for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                var song = result_1[_i];
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
            //handle error
            // no
        });
    };
    tournaments.prototype.saveSong = function (data, callback) {
        this.db.preparedQuery("INSERT INTO pool_link (songHash, songName, songAuthor, levelAuthor, `key`, songDiff, ssLink, poolId) VALUES ?", [data], function (err, result) {
            var flag = false;
            if (err)
                flag = true;
            return callback({
                data: result,
                flag: flag
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
    return tournaments;
}());
exports.tournaments = tournaments;
