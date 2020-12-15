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
exports.auth = exports.authController = void 0;
var controller_1 = require("./controller");
var authController = /** @class */ (function (_super) {
    __extends(authController, _super);
    function authController(req) {
        var _a, _b, _c, _d;
        var _this = _super.call(this) || this;
        _this.userId = null;
        _this.apiKey = null;
        _this.tourneyId = null;
        // private db: database = new database();
        _this.adminRoles = [1];
        _this.staffRoles = [1, 2];
        _this.mapPoolRoles = [1, 3];
        _this.mapPoolHeadRoles = [1, -1];
        _this.coordinatorRoles = [1, 2, 4];
        _this.userId = req.session.user ? (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user[0]) === null || _b === void 0 ? void 0 : _b.discordId : undefined;
        _this.tourneyId = (_c = req.params) === null || _c === void 0 ? void 0 : _c.tourneyId;
        _this.apiKey = (_d = req.headers) === null || _d === void 0 ? void 0 : _d.authorization;
        return _this;
    }
    authController.prototype.getUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM users WHERE discordId = ?", [this.userId])];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user[0]];
                }
            });
        });
    };
    authController.prototype.getRoles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var roleIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.userId != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.aQuery('SELECT roleId FROM roleassignment WHERE userId = ?', [this.userId])];
                    case 1:
                        roleIds = _a.sent();
                        roleIds = roleIds.map(function (x) { return +x.roleId; });
                        return [2 /*return*/, roleIds];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    authController.prototype.admin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoles()];
                    case 1:
                        userRoles = _a.sent();
                        if (userRoles != null && userRoles.some(function (x) { return _this.adminRoles.includes(x); })) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    authController.prototype.staff = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoles()];
                    case 1:
                        userRoles = _a.sent();
                        if (userRoles != null && userRoles.some(function (x) { return _this.staffRoles.includes(x); })) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    authController.prototype.mapPool = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoles()];
                    case 1:
                        userRoles = _a.sent();
                        if (userRoles != null && userRoles.some(function (x) { return _this.mapPoolRoles.includes(x); })) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    authController.prototype.poolHead = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoles()];
                    case 1:
                        userRoles = _a.sent();
                        if (userRoles != null && userRoles.some(function (x) { return _this.mapPoolHeadRoles.includes(x); })) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    authController.prototype.coordinator = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoles()];
                    case 1:
                        userRoles = _a.sent();
                        if (userRoles != null && userRoles.some(function (x) { return _this.coordinatorRoles.includes(x); })) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    authController.prototype.owner = function () {
        return __awaiter(this, void 0, void 0, function () {
            var owner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournaments WHERE id = ? AND owner = ?", [this.tourneyId, this.userId])];
                    case 1:
                        owner = _a.sent();
                        return [2 /*return*/, owner.length == 1];
                }
            });
        });
    };
    authController.prototype.validKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM api_keys WHERE tournamentId = ? AND api_key = ?", [this.tourneyId, this.apiKey])];
                    case 1:
                        key = _a.sent();
                        return [2 /*return*/, key.length == 1];
                }
            });
        });
    };
    return authController;
}(controller_1.controller));
exports.authController = authController;
function auth() {
    return function (target, key, descriptor) {
        var original = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var req = args[0].req;
            var auth = new authController(req);
            var newArgs = [{
                    req: args[0].req,
                    res: args[0].res,
                    auth: auth
                }];
            return original.apply(this, newArgs);
        };
        return descriptor;
    };
}
exports.auth = auth;
