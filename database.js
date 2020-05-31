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
        this.con = mysql_1.default.createPool({
            host: "us-cdbr-east-05.cleardb.net",
            user: "bf459e897fa39a",
            password: "88303776",
            database: "heroku_11100f74419df40",
            connectionLimit: 10
            // host: "sql230.main-hosting.eu",
            // user: "u826845424_beatKhanaTest",
            // password: "tY5p5DsA91ay",
            // database: "u826845424_beatKhanaTest"
        });
        // this.connectDb();
        // this.connected = true;
    }
    database.prototype.query = function (sql, callback) {
        this.con.getConnection(function (err, connection) {
            if (err)
                throw err;
            var result;
            // Use the connection
            connection.query(sql, function (error, results, fields) {
                // When done with the connection, release it.
                result = results;
                // console.log(results);
                connection.release();
                // console.log(results);
                // Handle error after the release.
                if (error)
                    throw error;
                return callback(result);
                // Don't use the connection here, it has been returned to the pool.
            });
        });
    };
    return database;
}());
exports.database = database;
