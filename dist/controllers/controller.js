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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = void 0;
var database_1 = require("../database");
var event_controller_1 = require("./event.controller");
var ajv_1 = __importDefault(require("ajv"));
var controller = /** @class */ (function () {
    function controller() {
        this.env = process.env.NODE_ENV || 'production';
        this.db = new database_1.database();
        this.CLIENT_ID = '721696709331386398';
        this.CLIENT_SECRET = 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6';
        this.emitter = event_controller_1.emitter;
        this.ajv = new ajv_1.default();
    }
    controller.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    controller.prototype.getSettings = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var set;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id])];
                    case 1:
                        set = _a.sent();
                        return [2 /*return*/, set[0]];
                }
            });
        });
    };
    controller.prototype.validate = function (schema, data) {
        var validate = this.ajv.compile(schema);
        if (validate(data)) {
            return true;
        }
        else {
            return validate.errors;
        }
    };
    controller.jsonResponse = function (res, code, message) {
        return res.status(code).json({ message: message });
    };
    controller.prototype.ok = function (res, dto) {
        if (!!dto) {
            res.type('application/json');
            return res.status(200).json(dto);
        }
        else {
            return res.status(200).json();
        }
    };
    controller.prototype.created = function (res) {
        return res.sendStatus(201);
    };
    controller.prototype.clientError = function (res, message) {
        return controller.jsonResponse(res, 400, message ? message : 'Unauthorized');
    };
    controller.prototype.unauthorized = function (res, message) {
        return controller.jsonResponse(res, 401, message ? message : 'Unauthorized');
    };
    controller.prototype.forbidden = function (res, message) {
        return controller.jsonResponse(res, 403, message ? message : 'Forbidden');
    };
    controller.prototype.notFound = function (res, message) {
        return controller.jsonResponse(res, 404, message ? message : 'Not found');
    };
    controller.prototype.conflict = function (res, message) {
        return controller.jsonResponse(res, 409, message ? message : 'Conflict');
    };
    controller.prototype.tooMany = function (res, message) {
        return controller.jsonResponse(res, 429, message ? message : 'Too many requests');
    };
    controller.prototype.todo = function (res) {
        return controller.jsonResponse(res, 400, 'TODO');
    };
    controller.prototype.fail = function (res, error) {
        console.error(error);
        return res.status(500).json({
            message: error.toString()
        });
    };
    controller.prototype.formatDate = function (date) {
        var d = new Date(date);
        return d.toISOString().slice(0, 19).replace('T', ' ');
    };
    controller.prototype.randHash = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    controller.prototype.isBase64 = function (str) {
        var base64regex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i;
        return base64regex.test(str);
    };
    controller.prototype.sumProperty = function (items, prop) {
        if (items == null)
            return 0;
        return items.reduce(function (a, b) {
            return b[prop] == null ? a : a + b[prop];
        }, 0);
    };
    return controller;
}());
exports.controller = controller;
