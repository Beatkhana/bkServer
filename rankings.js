"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankings = void 0;
var database_1 = require("./database");
var rankings = /** @class */ (function () {
    function rankings() {
        this.db = new database_1.database();
    }
    rankings.prototype.allUsers = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM users", function (result) {
            return callback(result);
        });
    };
    rankings.prototype.getRanks = function (callback) {
        var result = this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank", function (result) {
            return callback(result);
        });
    };
    rankings.prototype.getUser = function (userId, callback) {
        this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users WHERE discordId = " + userId, function (result) {
            return callback(result);
        });
    };
    return rankings;
}());
exports.rankings = rankings;
