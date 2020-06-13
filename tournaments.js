"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournaments = void 0;
var database_1 = require("./database");
var fs_1 = __importDefault(require("fs"));
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
    tournaments.prototype.save = function (data, callback) {
        var base64String = data.image;
        var base64Img = base64String.split(';base64,').pop();
        fs_1.default.writeFile('public/assets/images/' + data.imgName, base64Img, { encoding: 'base64' }, function (err) {
            console.log('File created');
        });
        data.image = 'public/assets/images/' + data.imgName;
        delete data.imgName;
        console.log(data);
        var result = this.db.preparedQuery("INSERT INTO tournaments SET ?", [data], function (result) {
            return callback(result);
        });
    };
    return tournaments;
}());
exports.tournaments = tournaments;
