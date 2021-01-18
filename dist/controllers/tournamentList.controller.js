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
exports.tournamentListController = void 0;
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
var tournamentListController = /** @class */ (function (_super) {
    __extends(tournamentListController, _super);
    function tournamentListController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tournamentListController.prototype.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tournaments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT CAST(owner AS CHAR) as owner, id, name, image, date as startDate, endDate, discord, twitchLink, prize, info, archived, first, second, third FROM tournaments")];
                    case 1:
                        tournaments = _a.sent();
                        return [2 /*return*/, res.send(tournaments)];
                }
            });
        });
    };
    tournamentListController.prototype.getActive = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, user, sqlWhere, userRoles, _a, _b, tournaments;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.getUser()];
                    case 1:
                        user = _c.sent();
                        sqlWhere = "";
                        userRoles = "";
                        _a = true;
                        return [4 /*yield*/, auth.isAdmin];
                    case 2:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, auth.isStaff];
                    case 3:
                        _b = (_c.sent());
                        _c.label = 4;
                    case 4:
                        switch (_a) {
                            case _b: return [3 /*break*/, 5];
                            case user != null: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 5:
                        sqlWhere = "";
                        return [3 /*break*/, 8];
                    case 6:
                        sqlWhere = "AND (ts.public = 1 OR owner = ? OR tra.role_id IS NOT NULL)";
                        userRoles = "LEFT JOIN tournament_role_assignment tra ON tra.tournament_id = t.id AND tra.user_id = ?";
                        return [3 /*break*/, 8];
                    case 7:
                        sqlWhere = "AND ts.public = 1";
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, this.db.aQuery("SELECT t.id as tournamentId,\n        t.name,\n        t.image,\n        t.date as startDate,\n        t.endDate,\n        t.discord,\n        t.twitchLink,\n        t.prize,\n        t.info,\n        CAST(t.owner AS CHAR) as owner,\n        t.archived,\n        t.first,\n        t.second,\n        t.third,\n        ts.public\n        FROM tournaments t\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = t.id  \n        " + userRoles + "\n        WHERE archived = 0 AND t.is_mini = 0 " + sqlWhere, [user === null || user === void 0 ? void 0 : user.discordId, user === null || user === void 0 ? void 0 : user.discordId])];
                    case 9:
                        tournaments = _c.sent();
                        return [2 /*return*/, res.send(tournaments)];
                }
            });
        });
    };
    tournamentListController.prototype.getActiveMini = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, user, sqlWhere, userRoles, _a, _b, tournaments;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.getUser()];
                    case 1:
                        user = _c.sent();
                        sqlWhere = "";
                        userRoles = "";
                        _a = true;
                        return [4 /*yield*/, auth.isAdmin];
                    case 2:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, auth.isStaff];
                    case 3:
                        _b = (_c.sent());
                        _c.label = 4;
                    case 4:
                        switch (_a) {
                            case _b: return [3 /*break*/, 5];
                            case user != null: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 5:
                        sqlWhere = "";
                        return [3 /*break*/, 8];
                    case 6:
                        sqlWhere = "AND (ts.public = 1 OR owner = ? OR tra.role_id IS NOT NULL)";
                        userRoles = "LEFT JOIN tournament_role_assignment tra ON tra.tournament_id = t.id AND tra.user_id = ?";
                        return [3 /*break*/, 8];
                    case 7:
                        sqlWhere = "AND ts.public = 1";
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, this.db.aQuery("SELECT t.id as tournamentId,\n        t.name,\n        t.image,\n        t.date as startDate,\n        t.endDate,\n        t.discord,\n        t.twitchLink,\n        t.prize,\n        t.info,\n        CAST(t.owner AS CHAR) as owner,\n        t.archived,\n        t.first,\n        t.second,\n        t.third,\n        ts.public\n        FROM tournaments t\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = t.id  \n        " + userRoles + "\n        WHERE archived = 0 AND t.is_mini = 1 " + sqlWhere, [user === null || user === void 0 ? void 0 : user.discordId, user === null || user === void 0 ? void 0 : user.discordId])];
                    case 9:
                        tournaments = _c.sent();
                        return [2 /*return*/, res.send(tournaments)];
                }
            });
        });
    };
    tournamentListController.prototype.getArchive = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = +req.query.page || 0;
                        limit = +req.query.limit || 25;
                        return [4 /*yield*/, this.db.paginationQuery('tournaments', page, limit, "SELECT CAST(owner AS CHAR) as owner, id as tournamentId, name, image, date as startDate, endDate, discord, twitchLink, prize, info, archived, first, second, third FROM tournaments WHERE archived = 1 ORDER BY endDate DESC")];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, res.send(data.data)];
                }
            });
        });
    };
    return tournamentListController;
}(controller_1.controller));
exports.tournamentListController = tournamentListController;
