"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournaments = void 0;
var database_1 = require("./database");
// import jimp from 'jimp';
var sharp_1 = __importDefault(require("sharp"));
var tournaments = /** @class */ (function () {
    function tournaments() {
        this.db = new database_1.database();
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }
    tournaments.prototype.getAll = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getActive = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments WHERE archived = 0", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getArchived = function (callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments WHERE archived = 1", function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.getTournament = function (id, callback) {
        var data = [];
        var result = this.db.query("SELECT * FROM tournaments WHERE id = " + id, function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.save = function (data, callback) {
        var base64String = data.image;
        var base64Img = base64String.split(';base64,').pop();
        var imgName = data.imgName;
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';
        // jimp
        var buf = Buffer.from(base64Img, 'base64');
        sharp_1.default(buf)
            .resize({ width: 550 })
            .toFile('./public/assets/images/' + imgName)
            .catch(function (err) { console.log(err); });
        data.image = 'assets/images/' + imgName;
        delete data.imgName;
        console.log(data);
        var result = this.db.preparedQuery("INSERT INTO tournaments SET ?", [data], function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.delete = function (id, callback) {
        var result = this.db.preparedQuery("DELETE FROM tournaments WHERE id = ?", [id], function (err, result) {
            if (err)
                return callback({ 'error': err });
            return callback({ 'message': "success" });
        });
    };
    tournaments.prototype.update = function (data, callback) {
        // console.log(data);
        var result = this.db.preparedQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', data.id], function (err, result) {
            if (err)
                return callback({ 'error': err });
            return callback(result);
        });
    };
    tournaments.prototype.archive = function (data, callback) {
        // console.log(data);
        var id = data.tournament.id;
        delete data.tournament.id;
        data.tournament.archived = 1;
        // console.log(data);
        var result = this.db.preparedQuery("UPDATE tournaments SET ? WHERE ?? = ?", [data.tournament, 'id', id], function (err, result) {
            return callback(result);
        });
    };
    tournaments.prototype.isOwner = function (userId, tournamentId, callback) {
        var result = this.db.query("SELECT CAST(owner AS CHAR) as owner FROM tournaments WHERE id = " + tournamentId, function (err, result) {
            if (result[0].owner == userId) {
                return callback(true);
            }
            else {
                return callback(false);
            }
        });
    };
    return tournaments;
}());
exports.tournaments = tournaments;
