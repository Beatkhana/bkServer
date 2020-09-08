"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qualScore = void 0;
var qualScore = /** @class */ (function () {
    function qualScore(data) {
        this.tournamentId = data.tournamentId;
        this.ssId = data.ssId;
        this.songHash = data.songHash;
        this.score = data.score;
        this.totalScore = data.totalScore;
    }
    return qualScore;
}());
exports.qualScore = qualScore;
