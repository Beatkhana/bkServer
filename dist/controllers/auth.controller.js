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
    // private mapPoolRoles: number[] = [1, 3];
    // private mapPoolHeadRoles: number[] = [1, -1];
    // private coordinatorRoles: number[] = [1, 2, 4];
    function authController(req) {
        var _a, _b, _c, _d;
        var _this = _super.call(this) || this;
        _this.userId = null;
        _this.apiKey = null;
        _this.tourneyId = null;
        // private db: database = new database();
        _this.adminRoles = [1];
        _this.staffRoles = [1, 2];
        _this.tournamentHostRoles = [1, 2, 3];
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
                    case 0:
                        if (this.userId == undefined)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.db.aQuery("SELECT * FROM users WHERE discordId = ?", [this.userId])];
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
    Object.defineProperty(authController.prototype, "isAdmin", {
        // getters
        // admin
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
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
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "isStaff", {
        // staff
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
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
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "isTournamentHost", {
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var userRoles;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getRoles()];
                        case 1:
                            userRoles = _a.sent();
                            if (userRoles != null && userRoles.some(function (x) { return _this.tournamentHostRoles.includes(x); })) {
                                return [2 /*return*/, true];
                            }
                            return [2 /*return*/, false];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "isOwner", {
        // owner
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var owner;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournaments WHERE id = ? AND owner = ?", [this.tourneyId, this.userId])];
                        case 1:
                            owner = _a.sent();
                            return [2 /*return*/, owner.length == 1];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "validApiKey", {
        // api
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM api_keys WHERE tournamentId = ? AND api_key = ?", [this.tourneyId, this.apiKey])];
                        case 1:
                            key = _a.sent();
                            return [2 /*return*/, key.length == 1];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "tournamentAdmin", {
        // tournament Admin
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var adminRole;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournament_role_assignment WHERE user_id = ? AND tournament_id = ? AND role_id = 1", [this.userId, this.tourneyId])];
                        case 1:
                            adminRole = _a.sent();
                            return [2 /*return*/, adminRole.length == 1];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "tournamentMapPool", {
        // tournament map pooler
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var mapPoolRole;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournament_role_assignment WHERE user_id = ? AND tournament_id = ? AND role_id = 2", [this.userId, this.tourneyId])];
                        case 1:
                            mapPoolRole = _a.sent();
                            return [2 /*return*/, mapPoolRole.length == 1];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "tournamentCoordinator", {
        // tournament coordinator
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var coordinatorRole;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.db.aQuery("SELECT * FROM tournament_role_assignment WHERE user_id = ? AND tournament_id = ? AND role_id = 3", [this.userId, this.tourneyId])];
                        case 1:
                            coordinatorRole = _a.sent();
                            return [2 /*return*/, coordinatorRole.length == 1];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(authController.prototype, "hasAdminPerms", {
        // admin, owner, api or tournament admin
        get: function () {
            var _this = this;
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.isAdmin];
                        case 1:
                            _c = (_d.sent());
                            if (_c) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.isOwner];
                        case 2:
                            _c = (_d.sent());
                            _d.label = 3;
                        case 3:
                            _b = _c;
                            if (_b) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.validApiKey];
                        case 4:
                            _b = (_d.sent());
                            _d.label = 5;
                        case 5:
                            _a = _b;
                            if (_a) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.tournamentAdmin];
                        case 6:
                            _a = (_d.sent());
                            _d.label = 7;
                        case 7: return [2 /*return*/, (_a)];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    authController.prototype.isTournamentStaff = function () {
        var _this = this;
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.tournamentAdmin];
                    case 1:
                        _b = (_c.sent());
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.tournamentCoordinator];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        _a = _b;
                        if (_a) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.tournamentMapPool];
                    case 4:
                        _a = (_c.sent());
                        _c.label = 5;
                    case 5: return [2 /*return*/, (_a)];
                }
            });
        }); })();
    };
    // old method
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
    // public async mapPool(): Promise<boolean> {
    //     let userRoles = await this.getRoles();
    //     if (userRoles != null && userRoles.some(x => this.mapPoolRoles.includes(x))) {
    //         return true;
    //     }
    //     return false;
    // }
    // public async poolHead(): Promise<boolean> {
    //     let userRoles = await this.getRoles();
    //     if (userRoles != null && userRoles.some(x => this.mapPoolHeadRoles.includes(x))) {
    //         return true;
    //     }
    //     return false;
    // }
    // public async coordinator(): Promise<boolean> {
    //     let userRoles = await this.getRoles();
    //     if (userRoles != null && userRoles.some(x => this.coordinatorRoles.includes(x))) {
    //         return true;
    //     }
    //     return false;
    // }
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
