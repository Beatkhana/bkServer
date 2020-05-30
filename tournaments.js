"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournaments = void 0;
var database_1 = require("./database");
var tournaments = /** @class */ (function () {
    function tournaments() {
        // public con: mysql.Connection;
        // public connected: boolean = false;
        this.db = new database_1.database();
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }
    tournaments.prototype.getAll = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments", function (result) {
            return callback(result);
        });
    };
    tournaments.prototype.getActive = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments WHERE archived = 0", function (result) {
            return callback(result);
        });
    };
    tournaments.prototype.getArchived = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments WHERE archived = 1", function (result) {
            return callback(result);
        });
    };
    tournaments.prototype.getTournament = function (id, callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments WHERE id = " + id, function (result) {
            return callback(result);
        });
    };
    return tournaments;
}());
exports.tournaments = tournaments;
