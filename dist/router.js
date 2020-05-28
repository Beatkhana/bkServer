"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var tournaments_1 = require("./tournaments");
var tournament = new tournaments_1.tournaments();
var router = express_1.default.Router();
var baseUrl = '/api';
// Routes
router.get(baseUrl, function (req, res) {
    res.send({ hello: 'there' });
});
router.get(baseUrl + '/tournaments', function (req, res) {
    tournament.getActive(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/tournament/:id', function (req, res) {
    console.log(req.params);
    tournament.getTournament(req.params.id, function (result) {
        res.send(result);
    });
});
module.exports = router;
