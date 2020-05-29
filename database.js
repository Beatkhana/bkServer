"use strict";
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
        this.con = mysql_1.default.createConnection({
            host: "us-cdbr-east-05.cleardb.net",
            user: "bf459e897fa39a",
            password: "88303776",
            database: "heroku_11100f74419df40"
        });
        this.connectDb();
        this.connected = true;
    }
    database.prototype.query = function (sql, callback) {
        this.con.query(sql, function (err, result, fields) {
            if (err)
                console.log('error');
            return callback(result);
        });
    };
    database.prototype.connectDb = function () {
        this.con.connect(function (err) {
            if (err)
                this.connectDb();
            console.log("Connected!");
        });
    };
    return database;
}());
exports.database = database;
