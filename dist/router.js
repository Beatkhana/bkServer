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
    res.redirect("https://discordapp.com/api/oauth2/authorize?client_id=" + CLIENT_ID + "&scope=identify&response_type=code&redirect_uri=" + redirect + "&state=" + req.query.url);
});
router.get(baseUrl + '/discordAuth', function (req, res) {
    if (req.query.code) {
        user.sendCode(req.query.code.toString(), function (usrRes, newUsr) {
            if (newUsr === void 0) { newUsr = false; }
            if (!newUsr) {
                req.session.user = usrRes;
                if (req.query.state != undefined) {
                    res.redirect("" + req.query.state);
                }
                else {
                    res.redirect('/');
                }
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
router.put(baseUrl + '/user/:id', function (req, res) {
    isAdmin(req, function (auth) {
        if (auth) {
            user.update(req.params.id, req.body, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
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
// Get all tournaments
router.get(baseUrl + '/tournaments', function (req, res) {
    if (req.session.user != null) {
        isAdmin(req, function (isAuth) {
            if (isAuth) {
                tournament.getActive(function (result) {
                    res.send(result);
                }, -1);
            }
            else {
                tournament.getActive(function (result) {
                    res.send(result);
                }, req.session.user[0]['discordId']);
            }
        });
    }
    else {
        tournament.getActive(function (result) {
            res.send(result);
        });
    }
});
router.get(baseUrl + '/tournament/archived', function (req, res) {
    console.log('bitch');
    tournament.getArchived(function (result) {
        res.send(result);
    });
});
// Get tournament
router.get(baseUrl + '/tournament/:id', function (req, res) {
    if (req.session.user != null) {
        isAdmin(req, function (isAuth) {
            if (isAuth) {
                tournament.getTournament(req.params.id, function (result) {
                    res.send(result);
                }, -1);
            }
            else {
                tournament.getTournament(req.params.id, function (result) {
                    res.send(result);
                }, req.session.user[0]['discordId']);
            }
        });
        return null;
    }
    else {
        tournament.getTournament(req.params.id, function (result) {
            res.send(result);
        });
        return null;
    }
});
// create tournament
router.post(baseUrl + '/tournament', function (req, res) {
    isAdmin(req, function (auth) {
        if (auth) {
            tournament.save(req.body, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
//delete tournament
router.post(baseUrl + '/tournament/delete/:id', function (req, res) {
    isAdmin(req, function (auth) {
        if (auth) {
            tournament.delete(parseInt(req.params.id), function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// update tournament
router.put(baseUrl + '/tournament/:id', function (req, res) {
    isAdminOwner(req, req.params.id, function (auth) {
        if (auth) {
            tournament.update({ "tournament": req.body, "id": req.params.id }, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// Update tournament settings
router.put(baseUrl + '/tournament/:id/settings', function (req, res) {
    isAdminOwner(req, req.params.id, function (auth) {
        if (auth) {
            tournament.updateSettings(req.body, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// Sign up for tournament settings
router.post(baseUrl + '/tournament/:id/signUp', function (req, res) {
    if (req.session.user[0] != null) {
        req.body.userId = req.session.user[0].discordId;
        tournament.signUp(req.body, function (response) {
            res.send(response);
        });
    }
    else {
        res.sendStatus(401);
        return null;
    }
});
// Get participants
router.get(baseUrl + '/tournament/:id/participants', function (req, res) {
    tournament.participants(req.params.id, function (response) {
        res.send(response);
    });
    return null;
});
// archive tournament
router.put(baseUrl + '/archiveTournament', function (req, res) {
    isAdmin(req, function (auth) {
        if (auth) {
            tournament.archive(req.body, function (response) {
                res.send(response);
            });
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// Add map pool
router.post(baseUrl + '/tournament/addPool', function (req, res) {
    isAdminOwner(req, req.body.tournamentId, function (auth) {
        if (auth) {
            tournament.addPool(req.body, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// get map pools
router.get(baseUrl + '/map-pools/:id', function (req, res) {
    isAdminOwner(req, req.params.id, function (auth) {
        if (auth) {
            tournament.getMapPools(req.params.id, function (result) {
                res.send(result);
            }, true);
            return null;
        }
        else {
            tournament.getMapPools(req.params.id, function (result) {
                res.send(result);
            });
            return null;
        }
    });
});
// Udate map pools
router.put(baseUrl + '/map-pools/:id', function (req, res) {
    isAdminOwner(req, req.params.id, function (auth) {
        if (auth) {
            tournament.updatePool(req.body, function (result) {
                res.send(result);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// Add song
router.post(baseUrl + '/tournament/addSong', function (req, res) {
    isAdminOwner(req, req.body.tournamentId, function (auth) {
        if (auth) {
            tournament.addSong(req.body, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// Delete song from pool
router.post(baseUrl + '/map-pools/deleteSong', function (req, res) {
    isAdminOwner(req, req.body.tournamentId, function (auth) {
        if (auth) {
            tournament.deleteSong(req.body.id, function (response) {
                res.send(response);
            });
            return null;
        }
        else {
            res.sendStatus(401);
            return null;
        }
    });
});
// Calendar events
router.get(baseUrl + '/events', function (req, res) {
    tournament.events(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/rankings', function (req, res) {
    ranking.getRanks(function (result) {
        res.send(result);
    });
});
router.get(baseUrl + '/team', function (req, res) {
    ranking.getTeam(function (result) {
        res.send(result);
    });
});
module.exports = router;
// Auth stuff
function isAdminOwner(req, tournamentId, callback) {
    tournament.isOwner(req.session.user != null && req.session.user[0]['discordId'], tournamentId, function (isOwner) {
        if ((req.session.user != null && req.session.user[0]['roleIds'].indexOf('1') > -1) || isOwner) {
            callback(true);
            return null;
        }
        else {
            callback(false);
            return null;
        }
    });
}
function isAdmin(req, callback) {
    if (req.session.user == null || req.session.user[0]['roleIds'].indexOf('1') == -1) {
        callback(false);
        return null;
    }
    else {
        callback(true);
        return null;
    }
}
