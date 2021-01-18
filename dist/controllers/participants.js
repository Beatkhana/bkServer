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
exports.ParticipantsController = void 0;
var database_1 = require("../database");
var auth_controller_1 = require("./auth.controller");
var controller_1 = require("./controller");
var ParticipantsController = /** @class */ (function (_super) {
    __extends(ParticipantsController, _super);
    function ParticipantsController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParticipantsController.prototype.getParticipants = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, settings, battleRoyale, isAuth, userId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        if (!auth.tourneyId)
                            return [2 /*return*/, this.clientError(res, "No tournament ID provided")];
                        return [4 /*yield*/, this.getSettings(auth.tourneyId)];
                    case 1:
                        settings = _a.sent();
                        battleRoyale = settings.state == 'main_stage' && settings.type == 'battle_royale';
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 2:
                        isAuth = _a.sent();
                        userId = auth.userId;
                        return [4 /*yield*/, this.db.aQuery("SELECT p.id AS participantId,\n        CAST(p.userId AS CHAR) as userId,\n        p.forfeit,\n        p.seed,\n        p.position,\n        " + (isAuth ? 'p.comment,' : '') + "\n        " + (userId != null ? 'IF(p.userId = "' + userId + '", p.comment, null) as comment,' : '') + "\n        CAST(`u`.`discordId` AS CHAR) as discordId,\n        CAST(`u`.`ssId` AS CHAR) as ssId,\n        `u`.`name`,\n        `u`.`twitchName`,\n        `u`.`avatar`,\n        `u`.`globalRank`,\n        `u`.`localRank`,\n        `u`.`country`,\n        `u`.`tourneyRank`,\n        `u`.`TR`,\n        `u`.`pronoun`\n        FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE p.tournamentId = ? " + (!battleRoyale ? '' : 'AND p.seed != 0') + " " + (isAuth ? '' : 'AND ts.show_signups = 1'), [auth.tourneyId])];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, res.send(result)];
                }
            });
        });
    };
    ParticipantsController.prototype.getAllParticipants = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_c.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        _b = (_a = res).send;
                        return [4 /*yield*/, ParticipantsController.allParticipants(auth.tourneyId)];
                    case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    ParticipantsController.prototype.updateParticipant = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, admin, sql, data, params, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        _a = auth.userId;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, auth.validApiKey];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        if (!(_a))
                            return [2 /*return*/, this.clientError(res, "Not Logged in")];
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 3:
                        admin = _b.sent();
                        sql = "UPDATE participants SET comment = ? WHERE tournamentId = ? AND userId = ?";
                        data = req.body;
                        params = [data.comment, auth.tourneyId, auth.userId];
                        if (admin) {
                            params = [data.comment, req.params.participantId];
                            sql = "UPDATE participants SET comment = ? WHERE id = ?";
                        }
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery(sql, params)];
                    case 5:
                        result = _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_1 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ParticipantsController.prototype.removeParticipant = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.body.participantId)
                            return [2 /*return*/, this.clientError(res, "No participant ID supplied")];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.db.aQuery("DELETE FROM participants WHERE id = ?", [req.body.participantId])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_2)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ParticipantsController.prototype.eliminateParticipant = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, settings, participants, minpos, nextPos, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.hasAdminPerms];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.body.participantId)
                            return [2 /*return*/, this.clientError(res, "Participant ID not provided")];
                        return [4 /*yield*/, this.getSettings(auth.tourneyId)];
                    case 2:
                        settings = _a.sent();
                        return [4 /*yield*/, ParticipantsController.allParticipants(auth.tourneyId)];
                    case 3:
                        participants = _a.sent();
                        if (settings.type != "battle_royale")
                            return [2 /*return*/, this.clientError(res, "Tournament is not a battle royale")];
                        minpos = Math.min.apply(null, participants.map(function (x) { return x.position; }).filter(Boolean));
                        nextPos = settings.standard_cutoff;
                        if (minpos != Infinity)
                            nextPos = minpos - 1;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery("UPDATE participants SET position = ? WHERE id = ?", [nextPos, req.body.participantId])];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ParticipantsController.allParticipants = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = new database_1.database();
                        return [4 /*yield*/, db.aQuery("SELECT p.id AS participantId,\n        CAST(p.userId AS CHAR) as userId,\n        p.forfeit,\n        p.seed,\n        p.position,\n        p.comment,\n        CAST(`u`.`discordId` AS CHAR) as discordId,\n        CAST(`u`.`ssId` AS CHAR) as ssId,\n        `u`.`name`,\n        `u`.`twitchName`,\n        `u`.`avatar`,\n        `u`.`globalRank`,\n        `u`.`localRank`,\n        `u`.`country`,\n        `u`.`tourneyRank`,\n        `u`.`TR`,\n        `u`.`pronoun`\n        FROM participants p\n        LEFT JOIN users u ON u.discordId = p.userId\n        LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId\n        WHERE p.tournamentId = ?", [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return ParticipantsController;
}(controller_1.controller));
exports.ParticipantsController = ParticipantsController;
