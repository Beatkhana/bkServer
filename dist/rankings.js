"use strict";
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
        var result = this.db.query("SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, \n        CAST(`users`.`discordId` AS CHAR) as discordId,\n        CAST(`users`.`ssId` AS CHAR) as ssId,\n        `users`.`name`,\n        `users`.`twitchName`,\n        `users`.`avatar`,\n        `users`.`globalRank`,\n        `users`.`localRank`,\n        `users`.`country`,\n        `users`.`tourneyRank`,\n        `users`.`TR`,\n        `users`.`pronoun`, \n        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames\n        FROM users\n        LEFT JOIN roleassignment ra ON ra.userId = users.discordId\n        LEFT JOIN roles r ON r.roleId = ra.roleId\n        WHERE r.roleId = 1 OR r.roleId = 2 OR r.roleId = 6\n        GROUP BY users.discordId", function (err, result) {
            result.map(function (e) {
                e.roleIds = e.roleIds.split(', ').map(function (x) { return +x; });
                e.roleNames = e.roleNames.split(', ');
            });
            return callback(result);
        });
    };
    rankings.prototype.getRanks = function (page, perPage) {
        if (page === void 0) { page = 0; }
        if (perPage === void 0) { perPage = 25; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.paginationQuery('users', page, perPage, "SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank, globalRank=0, globalRank")];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    rankings.prototype.getUser = function (userId, callback) {
        this.db.preparedQuery("SELECT u.discordId, u.ssId, u.name, u.twitchName, u.avatar, u.globalRank, u.localRank, u.country, u.tourneyRank, u.TR, u.pronoun, GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tournaments FROM users u\n        LEFT JOIN participants p ON p.userId = u.discordId\n        LEFT JOIN tournaments t ON p.tournamentId = t.id\n        LEFT JOIN tournament_settings ts ON p.tournamentId = ts.tournamentId\n        WHERE u.discordId = ? AND ts.public = 1\n        GROUP BY u.discordId", [userId], function (err, result) {
            console.log(err);
            return callback(result);
        });
    };
    rankings.prototype.getUserSS = function (userId, callback) {
        this.db.preparedQuery("SELECT u.discordId, u.ssId, u.name, u.twitchName, u.avatar, u.globalRank, u.localRank, u.country, u.tourneyRank, u.TR, u.pronoun, GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tournaments FROM users u\n        LEFT JOIN participants p ON p.userId = u.discordId\n        LEFT JOIN tournaments t ON p.tournamentId = t.id\n        WHERE u.ssId = ?\n        GROUP BY u.discordId", [userId], function (err, result) {
            return callback(result);
        });
    };
    return rankings;
}());
exports.rankings = rankings;
