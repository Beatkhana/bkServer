"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentListRouter = void 0;
var express_1 = require("express");
var tournamentList_controller_1 = require("../controllers/tournamentList.controller");
var tournamentListRouter = express_1.Router();
exports.tournamentListRouter = tournamentListRouter;
var listCon = new tournamentList_controller_1.tournamentListController();
tournamentListRouter.get('/tournament/archived', function (req, res) { return listCon.getArchive(req, res); });
