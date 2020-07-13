"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var tournaments_1 = require("./tournaments");
var userAuth_1 = require("./userAuth");
var rankings_1 = require("./rankings");
var tournament = new tournaments_1.tournaments();
var ranking = new rankings_1.rankings();
var user = new userAuth_1.userAuth();
var router = express_1.default.Router();
var baseUrl = '/api';
var session = require('express-session');
var CLIENT_ID = '721696709331386398';
var CLIENT_SECRET = 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6';
var env = process.env.NODE_ENV || 'production';
var redirect = "";
if (env == 'production') {
    redirect = encodeURIComponent('https://beatkhana.com/api/discordAuth');
}
else {
    redirect = encodeURIComponent('http://localhost:4200/api/discordAuth');
}
// Routes
router.get(baseUrl, function (req, res) {
    res.send({ 'hello there': 'general kenobi' });
});
router.get(baseUrl + '/login', function (req, res) {
    res.redirect("https://discordapp.com/api/oauth2/authorize?client_id=" + CLIENT_ID + "&scope=identify&response_type=code&redirect_uri=" + redirect);
});
router.get(baseUrl + '/tournaments', function (req, res) {
    tournament.getActive(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/discordAuth', function (req, res) {
    if (req.query.code) {
        user.sendCode(req.query.code.toString(), function (usrRes, newUsr) {
            if (newUsr === void 0) { newUsr = false; }
            if (!newUsr) {
                req.session.user = usrRes;
                res.redirect('/');
            }
            else {
                req.session.newUsr = usrRes;
                res.redirect('/sign-up');
            }
        });
    }
    else {
        res.redirect('/');
    }
});
router.get(baseUrl + '/user', function (req, res) {
    res.send(req.session.user);
});
router.post(baseUrl + '/newUser', function (req, res) {
    if (req.session.newUsr[0]) {
        var usrData = { links: req.body, discordId: req.session.newUsr[0]['discordId'] };
        user.newUser(usrData, function (result) {
            // req.session.destroy(() => { });
            req.session.user = result;
            res.send({ message: 'success' });
        });
    }
    else {
        res.sendStatus(400);
    }
});
router.get(baseUrl + '/users', function (req, res) {
    ranking.allUsers(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/user/:id', function (req, res) {
    ranking.getUser(req.params.id, function (result) {
        res.send(result);
    });
});
// logout
router.get(baseUrl + '/logout', function (req, res) {
    req.session.destroy(function () { });
    res.redirect('/');
});
// create tournament
router.post(baseUrl + '/tournament', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.save(req.body, function (sqlRes) {
            res.send(sqlRes);
        });
    }
    else {
        res.sendStatus(401);
    }
});
//delete tournament
router.post(baseUrl + '/tournament/delete/:id', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.delete(parseInt(req.params.id), function (sqlRes) {
            res.send(sqlRes);
        });
    }
    else {
        res.sendStatus(401);
    }
});
// update tournament
router.put(baseUrl + '/tournament/:id', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, function (isOwner) {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.update({ "tournament": req.body, "id": req.params.id }, function (sqlRes) {
                res.send(sqlRes);
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});
// archive tournament
router.put(baseUrl + '/archiveTournament', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.archive(req.body, function (sqlRes) {
            res.send(sqlRes);
        });
    }
    else {
        res.sendStatus(401);
    }
});
// Add map pool
router.post(baseUrl + '/tournament/addPool', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, function (isOwner) {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.addPool(req.body, function (sqlRes) {
                res.send(sqlRes);
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});
// get map pools
router.get(baseUrl + '/map-pools/:id', function (req, res) {
    tournament.getMapPools(req.params.id, function (result) {
        res.send(result);
    });
});
// Add song
router.post(baseUrl + '/tournament/addSong', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, function (isOwner) {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.addSong(req.body, function (sqlRes) {
                res.send(sqlRes);
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});
// Calendar events
router.get(baseUrl + '/events', function (req, res) {
    tournament.events(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/tournament/archived', function (req, res) {
    tournament.getArchived(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/tournament/:id', function (req, res) {
    tournament.getTournament(req.params.id, function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/rankings', function (req, res) {
    ranking.getRanks(function (result) {
        res.send(result);
    });
});
module.exports = router;
