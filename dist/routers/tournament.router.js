"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentRouter = void 0;
var express_1 = require("express");
var tournament_controller_1 = require("../controllers/tournament.controller");
var tournamentRouter = express_1.Router();
exports.tournamentRouter = tournamentRouter;
var tournamentCon = new tournament_controller_1.TournamentController();
tournamentRouter.get('/tournament/:tourneyId/signedUp', function (req, res) { return tournamentCon.isSignedUp(req, res); });
tournamentRouter.get('/tournament/:tourneyId/staff', function (req, res) { return tournamentCon.getStaff(req, res); });
tournamentRouter.get('/tournament/:tourneyId', function (req, res) { return tournamentCon.getTournament(req, res); });
tournamentRouter.post('/tournament/:tourneyId/staff', function (req, res) { return tournamentCon.addStaff(req, res); });
tournamentRouter.post('/tournament/:tourneyId/signUp', function (req, res) { return tournamentCon.signUp(req, res); });
tournamentRouter.post('/tournament', function (req, res) { return tournamentCon.createTournament(req, res); });
tournamentRouter.delete('/tournament/:tourneyId', function (req, res) { return tournamentCon.deleteTournament(req, res); });
tournamentRouter.put('/tournament/:tourneyId/settings', function (req, res) { return tournamentCon.updateSettings(req, res); });
tournamentRouter.put('/tournament/:tourneyId', function (req, res) { return tournamentCon.updateTournament(req, res); });
tournamentRouter.put('/archiveTournament', function (req, res) { return tournamentCon.archive(req, res); });
