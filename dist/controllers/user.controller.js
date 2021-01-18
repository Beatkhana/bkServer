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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
var controller_1 = require("./controller");
var auth_controller_1 = require("./auth.controller");
var sharp_1 = __importDefault(require("sharp"));
var fetch = require('node-fetch');
var userController = /** @class */ (function (_super) {
    __extends(userController, _super);
    function userController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    userController.prototype.getUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.id)
                            return [2 /*return*/, this.clientError(res, "No Id provided")];
                        return [4 /*yield*/, this.userById(req.params.id)];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, res.send(user)];
                }
            });
        });
    };
    userController.prototype.updateUserBadges = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, insetData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        if (!req.params.id)
                            return [2 /*return*/, this.clientError(res, "No user ID provided")];
                        if (!req.body)
                            return [2 /*return*/, this.clientError(res, 'Invalid request')];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, this.db.aQuery('DELETE FROM badge_assignment WHERE userId = ?', [req.params.id])];
                    case 5:
                        _b.sent();
                        if (!(req.body.length > 0)) return [3 /*break*/, 7];
                        insetData = req.body.map(function (x) { return [x, req.params.id]; });
                        return [4 /*yield*/, this.db.aQuery("INSERT INTO badge_assignment (badgeId, userId) VALUES ?", [insetData])];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: 
                    // console.log(insetData);
                    return [2 /*return*/, this.ok(res)];
                    case 8:
                        error_1 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_1)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.createBadge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, data, base64String, base64Img, savePath, buf, webpData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        base64String = data.image;
                        base64Img = base64String.split(';base64,').pop();
                        savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        data.imgName = data.imgName.split('.')[0];
                        data.imgName = data.imgName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        return [4 /*yield*/, this.db.aQuery('INSERT INTO badges (image, description) VALUES (?, ?)', [data.imgName, data.description])];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 4:
                        buf = _a.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 80, height: 30 })
                                .png()
                                // .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 5:
                        webpData = _a.sent();
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + data.imgName + '.png')];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 7:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.fail(res, error_2)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.updateBadge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, data, base64String, base64Img, savePath, buf, webpData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        data = req.body;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 10, , 11]);
                        data.imgName = data.imgName.split('.')[0];
                        data.imgName = data.imgName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        return [4 /*yield*/, this.db.aQuery('UPDATE badges SET image = ?, description = ? WHERE id = ?', [data.imgName, data.description, req.params.id])];
                    case 5:
                        _b.sent();
                        if (!(data.image != '')) return [3 /*break*/, 9];
                        base64String = data.image;
                        base64Img = base64String.split(';base64,').pop();
                        savePath = this.env == 'development' ? '../app/src/assets/badges/' : __dirname + '/../public/assets/badges/';
                        return [4 /*yield*/, Buffer.from(base64Img, 'base64')];
                    case 6:
                        buf = _b.sent();
                        return [4 /*yield*/, sharp_1.default(buf)
                                .resize({ width: 80, height: 30 })
                                .png()
                                // .webp({ lossless: true, quality: 50 })
                                .toBuffer()];
                    case 7:
                        webpData = _b.sent();
                        return [4 /*yield*/, sharp_1.default(webpData)
                                .toFile(savePath + data.imgName + '.png')];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [2 /*return*/, this.ok(res)];
                    case 10:
                        error_3 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_3)];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.deleteBadge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery('DELETE FROM badges WHERE id = ?', [req.params.id])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.ok(res)];
                    case 6:
                        error_4 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_4)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.getBadges = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, badges, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = new auth_controller_1.authController(req);
                        return [4 /*yield*/, auth.admin()];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, auth.staff()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!(_a))
                            return [2 /*return*/, this.unauthorized(res)];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.db.aQuery('SELECT * FROM badges')];
                    case 5:
                        badges = _b.sent();
                        return [2 /*return*/, res.send(badges)];
                    case 6:
                        error_5 = _b.sent();
                        return [2 /*return*/, this.fail(res, error_5)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    userController.prototype.userById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var userData2, badges, tournaments, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT \n            u.discordId, \n            u.ssId, \n            u.name, \n            u.twitchName, \n            u.avatar, \n            u.globalRank, \n            u.localRank, \n            u.country, \n            u.tourneyRank, \n            u.TR, \n            u.pronoun\n        FROM users u\n        WHERE u.discordId = ?", [id])];
                    case 1:
                        userData2 = _a.sent();
                        return [4 /*yield*/, this.db.aQuery("SELECT b.* FROM badges b\n        LEFT JOIN badge_assignment ba ON ba.badgeId = b.id\n        WHERE ba.userId = ?", [id])];
                    case 2:
                        badges = _a.sent();
                        return [4 /*yield*/, this.db.aQuery("SELECT t.name FROM participants p \n        INNER JOIN tournaments t ON p.tournamentId = t.id\n        INNER JOIN tournament_settings ts ON p.tournamentId = ts.tournamentId AND ts.public = 1\n        WHERE p.userId = ?", [id])];
                    case 3:
                        tournaments = _a.sent();
                        user = userData2[0];
                        if (!user)
                            return [2 /*return*/, null];
                        user.tournaments = tournaments.map(function (x) { return x.name; });
                        user.badges = badges;
                        return [2 /*return*/, user];
                }
            });
        });
    };
    userController.getSSData = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("https://new.scoresaber.com/api/player/" + id + "/full")];
                    case 1:
                        response = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_6 = _a.sent();
                        // console.error(error);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return userController;
}(controller_1.controller));
exports.userController = userController;
