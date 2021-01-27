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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAController = void 0;
var controller_1 = require("./controller");
var ta_websocket_1 = require("./ta.websocket");
var wsClients = [];
var TAController = /** @class */ (function (_super) {
    __extends(TAController, _super);
    function TAController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.taEnabledTournaments = [];
        return _this;
    }
    TAController.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.db.aQuery("SELECT tournamentId, ta_url, ta_password FROM tournament_settings WHERE ta_url IS NOT NULL")];
                    case 1:
                        _a.taEnabledTournaments = _b.sent();
                        this.connectToTA();
                        this.emitter.on("getTAState", function (data) {
                            data.t = wsClients.find(function (x) { return x.tournamentId == data.t; });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    TAController.prototype.connectToTA = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.taEnabledTournaments), _c = _b.next(); !_c.done; _c = _b.next()) {
                var tournament = _c.value;
                var tmp = new ta_websocket_1.taWebSocket(tournament.tournamentId, tournament.ta_url, tournament.ta_password);
                wsClients.push(tmp);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    TAController.updateConnection = function (tournamentId, url, password) {
        var clientI = wsClients.findIndex(function (x) { return x.tournamentId == tournamentId; });
        if (clientI > -1) {
            wsClients[clientI].close();
            wsClients.splice(clientI, 1);
            wsClients.push(new ta_websocket_1.taWebSocket(tournamentId, url, password));
        }
        else {
            wsClients.push(new ta_websocket_1.taWebSocket(tournamentId, url, password));
        }
    };
    TAController.prototype.closeTa = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wsClients_1, wsClients_1_1, client;
            var e_2, _a;
            return __generator(this, function (_b) {
                try {
                    for (wsClients_1 = __values(wsClients), wsClients_1_1 = wsClients_1.next(); !wsClients_1_1.done; wsClients_1_1 = wsClients_1.next()) {
                        client = wsClients_1_1.value;
                        client.close();
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (wsClients_1_1 && !wsClients_1_1.done && (_a = wsClients_1.return)) _a.call(wsClients_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    return TAController;
}(controller_1.controller));
exports.TAController = TAController;
