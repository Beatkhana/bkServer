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
exports.database = void 0;
var mysql_1 = __importDefault(require("mysql"));
// const mysql = mysql;
var database = /** @class */ (function () {
    function database() {
        this.connected = false;
        var env = process.env.NODE_ENV || 'production';
        // console.log(env);
        if (env == 'production') {
            // this.con = mysql.createPool({
            //     host: "us-cdbr-east-02.cleardb.com",
            //     user: "bdaa6c4e2efd54",
            //     password: "f84071f4",
            //     database: "heroku_da687e9a34aa489",
            //     connectionLimit: 10,
            //     charset: 'utf8mb4',
            //     timezone: 'utc'
            // });
            this.con = mysql_1.default.createPool({
                host: "213.190.6.106",
                user: "u826845424_bkLive",
                password: "5%Gy88OoPje5",
                database: "u826845424_bkLive",
                connectionLimit: 10,
                charset: 'utf8mb4',
                timezone: 'utc'
            });
        }
        else {
            // this.con = mysql.createPool({
            //     host: "us-cdbr-east-05.cleardb.net",
            //     user: "bf459e897fa39a",
            //     password: "88303776",
            //     database: "heroku_11100f74419df40",
            //     connectionLimit: 10
            // });
            this.con = mysql_1.default.createPool({
                host: "localhost",
                user: "dan",
                password: "test",
                database: "bk",
                connectionLimit: 10,
                charset: 'utf8mb4',
                timezone: 'utc'
            });
            // this.con = mysql.createPool({
            //     host: "213.190.6.106",
            //     user: "u826845424_bkLive",
            //     password: "5%Gy88OoPje5",
            //     database: "u826845424_bkLive",
            //     connectionLimit: 10,
            //     charset: 'utf8mb4',
            //     timezone: 'utc'
            // });
        }
    }
    database.prototype.query = function (sql, callback) {
        this.con.getConnection(function (err, connection) {
            if (err)
                throw err;
            var query = connection.query(sql, function (error, results, fields) {
                var result = results;
                err = error;
                connection.release();
                // if (error) throw error;
                // console.log(query.sql)
                return callback(err, result);
            });
        });
    };
    database.prototype.preparedQuery = function (sql, params, callback) {
        this.con.getConnection(function (err, connection) {
            if (err)
                throw err;
            var result;
            var query = connection.query(sql, params, function (error, results, fields) {
                result = results;
                connection.release();
                return callback(error, result);
            });
        });
    };
    database.prototype.aQuery = function (sql, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.con.query(sql, params, function (err, result, fields) {
                            if (err)
                                reject(err);
                            resolve(result);
                        });
                    })];
            });
        });
    };
    database.prototype.asyncPreparedQuery = function (sql, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.con.query(sql, params, function (err, result, fields) {
                            if (err)
                                reject(err);
                            resolve(result);
                        });
                    })];
            });
        });
    };
    database.prototype.paginationQuery = function (table, page, perPage, sql, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var numRecords;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.asyncPreparedQuery('SELECT COUNT(*) as numRows FROM ??', [table])];
                    case 1:
                        numRecords = _a.sent();
                        numRecords = numRecords[0].numRows;
                        if (page <= numRecords / perPage) {
                            sql += " LIMIT ? OFFSET ?";
                            params.push(+perPage);
                            params.push(page * perPage);
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var query = _this.con.query(sql, params, function (err, result, fields) {
                                        if (err)
                                            reject(err);
                                        // console.log(query.sql);
                                        resolve({ total: numRecords, data: result });
                                    });
                                })];
                        }
                        else {
                            return [2 /*return*/, { err: 'Invalid requested page' }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return database;
}());
exports.database = database;
