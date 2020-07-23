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
        var result = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, \n        CAST(`users`.`discordId` AS CHAR) as discordId,\n        CAST(`users`.`ssId` AS CHAR) as ssId,\n        `users`.`name`,\n        `users`.`twitchName`,\n        `users`.`avatar`,\n        `users`.`globalRank`,\n        `users`.`localRank`,\n        `users`.`country`,\n        `users`.`tourneyRank`,\n        `users`.`TR`,\n        `users`.`pronoun`, \n        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n        FROM users\n        LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n        LEFT JOIN roles r ON r.roleId = ra.roleId\n        GROUP BY users.discordId", function (err, result) {
            return callback(result);
        });
    };
    rankings.prototype.getTeam = function (callback) {
        var result = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, \n        CAST(`users`.`discordId` AS CHAR) as discordId,\n        CAST(`users`.`ssId` AS CHAR) as ssId,\n        `users`.`name`,\n        `users`.`twitchName`,\n        `users`.`avatar`,\n        `users`.`globalRank`,\n        `users`.`localRank`,\n        `users`.`country`,\n        `users`.`tourneyRank`,\n        `users`.`TR`,\n        `users`.`pronoun`, \n        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n        FROM users\n        LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n        LEFT JOIN roles r ON r.roleId = ra.roleId\n        WHERE r.roleId = 1 OR r.roleId = 2\n        GROUP BY users.discordId", function (err, result) {
            result.map(function (e) {
                e.roleIds = e.roleIds.split(', ').map(function (x) { return +x; });
                e.roleNames = e.roleNames.split(', ');
            });
            return callback(result);
        });
    };
    rankings.prototype.getRanks = function (callback) {
        var result = this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank LIMIT 25", function (err, result) {
            return callback(result);
        });
    };
    rankings.prototype.getUser = function (userId, callback) {
        this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users WHERE discordId = " + userId, function (err, result) {
            return callback(result);
        });
    };
    return rankings;
}());
exports.rankings = rankings;
