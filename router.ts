import express from 'express';
import { tournaments } from './tournaments';
import { userAuth } from './userAuth';
import { rankings } from './rankings';
import e from 'express';

const tournament = new tournaments();
const ranking = new rankings();
const user = new userAuth();
const router = express.Router();
const baseUrl = '/api';

const session = require('express-session');

const CLIENT_ID = '721696709331386398';
const CLIENT_SECRET = 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6';

const env = process.env.NODE_ENV || 'production';
let redirect = "";
if (env == 'production') {
    redirect = encodeURIComponent('https://beatkhana.com/api/discordAuth');
} else {
    redirect = encodeURIComponent('http://localhost:4200/api/discordAuth');
}

// Routes
router.get(baseUrl, function (req, res) {
    res.send({ 'hello there': 'general kenobi' });
});

router.get(baseUrl + '/login', function (req, res) {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}&state=${req.query.url}`);
});

router.get(baseUrl + '/tournaments', function (req, res) {
    tournament.getActive((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/discordAuth', function (req, res) {
    if (req.query.code) {
        user.sendCode(req.query.code.toString(), (usrRes, newUsr = false) => {
            if (!newUsr) {
                req.session.user = usrRes;
                if (req.query.state != undefined) {
                    res.redirect(`${req.query.state}`);
                } else {
                    res.redirect('/');
                }
            } else {
                req.session.newUsr = usrRes;
                res.redirect('/sign-up');
            }
        });
    } else {
        res.redirect('/');
    }
});

router.get(baseUrl + '/user', function (req, res) {
    res.send(req.session.user);
});

router.post(baseUrl + '/newUser', function (req, res) {
    if (req.session.newUsr[0]) {
        let usrData = { links: req.body, discordId: req.session.newUsr[0]['discordId'] };
        user.newUser(usrData, (result) => {
            // req.session.destroy(() => { });
            req.session.user = result;
            res.send({ message: 'success' });
        });
    } else {
        res.sendStatus(400);
    }
});

router.get(baseUrl + '/users', function (req, res) {
    ranking.allUsers((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/user/:id', function (req, res) {
    ranking.getUser(req.params.id, (result: any) => {
        res.send(result);
    })
});

// logout
router.get(baseUrl + '/logout', function (req, res) {
    req.session.destroy(() => { });
    res.redirect('/');
});

// create tournament
router.post(baseUrl + '/tournament', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.save(req.body, (sqlRes) => {
            res.send(sqlRes);
        });
    } else {
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
        tournament.delete(parseInt(req.params.id), (sqlRes) => {
            res.send(sqlRes);
        });
    } else {
        res.sendStatus(401);
    }
});

// update tournament
router.put(baseUrl + '/tournament/:id', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, (isOwner) => {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.update({ "tournament": req.body, "id": req.params.id }, (sqlRes) => {
                res.send(sqlRes);
            });
        } else {
            res.sendStatus(401);
        }
    })
});

// archive tournament
router.put(baseUrl + '/archiveTournament', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    if (req.session.user[0]['roleIds'].indexOf('1') > -1) {
        tournament.archive(req.body, (sqlRes) => {
            res.send(sqlRes);
        });
    } else {
        res.sendStatus(401);
    }
});

// Add map pool
router.post(baseUrl + '/tournament/addPool', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, (isOwner) => {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.addPool(req.body, (sqlRes) => {
                res.send(sqlRes);
            });
        } else {
            res.sendStatus(401);
        }
    });
});

// get map pools
router.get(baseUrl + '/map-pools/:id', function (req, res) {
    if (req.session.user == null) {
        tournament.getMapPools(req.params.id, (result: any) => {
            res.send(result);
        });
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, (isOwner) => {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.getMapPools(req.params.id, (result: any) => {
                res.send(result);
            }, true);
            return null;
        } else {
            tournament.getMapPools(req.params.id, (result: any) => {
                res.send(result);
            });
            return null;
        }
    });
});

// Udate map pools
router.put(baseUrl + '/map-pools/:id', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, (isOwner) => {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.updatePool(req.body, (result) => {
                res.send(result);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

// Add song
router.post(baseUrl + '/tournament/addSong', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, (isOwner) => {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.addSong(req.body, (sqlRes) => {
                res.send(sqlRes);
            });
        } else {
            res.sendStatus(401);
        }
    })
});

// Delete song from pool
router.post(baseUrl + '/map-pools/deleteSong', function (req, res) {
    if (req.session.user == null) {
        res.sendStatus(401);
        return null;
    }
    tournament.isOwner(req.session.user[0]['discordId'], req.params.id, (isOwner) => {
        if (req.session.user[0]['roleIds'].indexOf('1') > -1 || isOwner) {
            tournament.deleteSong(req.body, (sqlRes) => {
                res.send(sqlRes);
            });
        } else {
            res.sendStatus(401);
        }
    })
});

// Calendar events
router.get(baseUrl + '/events', function (req, res) {
    tournament.events((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/tournament/archived', function (req, res) {
    tournament.getArchived((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/tournament/:id', function (req, res) {
    tournament.getTournament(req.params.id, (result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/rankings', function (req, res) {
    ranking.getRanks((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/team', function (req, res) {
    ranking.getTeam((result: any) => {
        res.send(result);
    });
});

module.exports = router;