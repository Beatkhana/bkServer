"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var tournaments_1 = require("./tournaments");
var userAuth_1 = require("./userAuth");
var tournament = new tournaments_1.tournaments();
var user = new userAuth_1.userAuth();
var router = express_1.default.Router();
var baseUrl = '/api';
var session = require('express-session');
// Routes
router.get(baseUrl, function (req, res) {
    res.send({ hello: 'there' });
});
router.get(baseUrl + '/tournaments', function (req, res) {
    tournament.getActive(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/discordAuth', function (req, res) {
    if (req.query.code) {
        user.sendCode(req.query.code.toString(), function (usrRes) {
            req.session.user = usrRes;
            res.redirect('/');
        });
    }
    else {
        res.redirect('/');
    }
});
router.get(baseUrl + '/user', function (req, res) {
    // console.log(req.session); 
    // res.send(user.getUser());
    // console.log(req.session);
    res.send(req.session.user);
});
router.get(baseUrl + '/logout', function (req, res) {
    req.session.destroy(function () { });
    // user.logOut()
    res.redirect('/');
});
router.post(baseUrl + '/tournament', function (req, res) {
    // tournament.getArchived((result: any) => {
    //     res.send(result);
    // });
    // console.log(req.session.user)
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.save(req.body, function (sqlRes) {
            res.send(sqlRes);
        });
    }
});
router.put(baseUrl + '/archiveTournament', function (req, res) {
    // tournament.getArchived((result: any) => {
    //     res.send(result);
    // });
    // console.log(req.session.user)
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.archive(req.body, function (sqlRes) {
            res.send(sqlRes);
        });
    }
});
router.get(baseUrl + '/tournament/archived', function (req, res) {
    tournament.getArchived(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/tournament/:id', function (req, res) {
    // console.log(req.params)
    tournament.getTournament(req.params.id, function (result) {
        res.send(result);
    });
});
module.exports = router;
