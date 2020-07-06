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
        var env = process.env.NODE_ENV || 'prod';
        if (env == 'prod') {
            this.con = mysql_1.default.createPool({
                host: "us-cdbr-east-02.cleardb.com",
                user: "bdaa6c4e2efd54",
                password: "f84071f4",
                database: "heroku_da687e9a34aa489",
                connectionLimit: 10
            });
        }
        else {
            this.con = mysql_1.default.createPool({
                host: "us-cdbr-east-05.cleardb.net",
                user: "bf459e897fa39a",
                password: "88303776",
                database: "heroku_11100f74419df40",
                connectionLimit: 10
            });
        }
        // this.con = mysql.createPool({
        //     // host: "us-cdbr-east-05.cleardb.net",
        //     // user: "bf459e897fa39a",
        //     // password: "88303776",
        //     // database: "heroku_11100f74419df40",
        //     connectionLimit: 10,
        //     // host: "sql230.main-hosting.eu",
        //     host: "213.190.6.106",
        //     user: "u826845424_beatKhanaTest",
        //     password: "Vl0M6MbwGFyj",
        //     database: "u826845424_beatKhanaTest"
        // });
    }
    database.prototype.query = function (sql, callback) {
        this.con.getConnection(function (err, connection) {
            if (err)
                throw err;
            var result;
            var query = connection.query(sql, function (error, results, fields) {
                // console.log(query.sql);
                result = results;
                err = error;
                connection.release();
                // if (error) throw error;
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
                // console.log(query.sql);
                // if (error) throw error;
                return callback(error, result);
            });
        });
    };
    return database;
}());
exports.database = database;
