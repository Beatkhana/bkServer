import express, { response } from 'express';
import { tournaments } from './tournaments';
import { userAuth } from './userAuth';
import { rankings } from './rankings';
import { logger } from './logger';

import * as apiAuth from 'api-key-auth'
// import e from 'express';

const tournament = new tournaments();
const ranking = new rankings();
const user = new userAuth();
// const auth = new apiAuth();
const router = express.Router();
const baseUrl = '/api';

const log = new logger();

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

// const apiKeys = new Map();
// apiKeys.set('123456789', {
//     id: 1,
//     name: 'app1',
//     secret: 'secret1'
// });
// apiKeys.set('987654321', {
//     id: 2,
//     name: 'app2',
//     secret: 'secret2'
// });

// function getSecret(keyId, done) {
//     if (!apiKeys.has(keyId)) {
//         return done(new Error('Unknown api key'));
//     }
//     const clientApp = apiKeys.get(keyId);
//     done(null, clientApp.secret, {
//         id: clientApp.id,
//         name: clientApp.name
//     });
// }

router.get(baseUrl + '/protected', (req, res) => {
    res.send(req.headers);
});

// Routes
router.get(baseUrl, function (req, res) {
    res.send({ 'hello there': 'general kenobi' });
});

router.get(baseUrl + '/login', function (req, res) {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}&state=${req.query.url}`);
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

router.put(baseUrl + '/user/:id', function (req, res) {
    hasPerms(req, 2, auth => {
        if (auth) {
            user.update(req.params.id, req.body, (response) => {
                res.send(response);
            });
            return null;
        } else if (req.session.user[0]['discordId'] == req.params.id) {
            req.session.user[0] = { ...req.session.user[0], ...req.body };
            user.update(req.params.id, req.body, (response) => {
                res.send(response);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

router.post(baseUrl + '/newUser', function (req, res) {
    if (req.session.newUsr[0]) {
        let usrData = { links: req.body, discordId: req.session.newUsr[0]['discordId'] };
        user.newUser(usrData, (result) => {
            // req.session.destroy(() => { });
            log.createLog(req.session.newUsr[0]['discordId'], 'Created an account');
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

router.get(baseUrl + '/user/by-ss/:id', function (req, res) {
    ranking.getUserSS(req.params.id, (result: any) => {
        res.send(result);
    })
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

// Get all tournaments
router.get(baseUrl + '/tournaments', function (req, res) {
    if (req.session.user != null) {
        hasPerms(req, 2, isAuth => {
            if (isAuth) {
                tournament.getActive((result: any) => {
                    res.send(result);
                }, -1);
            } else {
                tournament.getActive((result: any) => {
                    res.send(result);
                }, req.session.user[0]['discordId']);
            }
        })
    } else {
        tournament.getActive((result: any) => {
            res.send(result);
        });
    }
});

router.get(baseUrl + '/tournament/archived', function (req, res) {
    tournament.getArchived((result: any) => {
        res.send(result);
    });
});

// Get tournament
router.get(baseUrl + '/tournament/:id', function (req, res) {
    if (req.session.user != null) {
        hasPerms(req, 2, isAuth => {
            if (isAuth) {
                tournament.getTournament(req.params.id, (result: any) => {
                    res.send(result);
                }, -1);
            } else {
                tournament.getTournament(req.params.id, (result: any) => {
                    res.send(result);
                }, req.session.user[0]['discordId']);
            }
        });
        return null;
    } else {
        tournament.getTournament(req.params.id, (result: any) => {
            res.send(result);
        });
        return null;
    }
});

// create tournament
router.post(baseUrl + '/tournament', function (req, res) {
    hasPerms(req, 1, auth => {
        if (auth) {
            tournament.save(req.body, (response) => {
                res.send(response);
                log.createLog(req.session.user[0]['discordId'], 'Created a tournament');
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

//delete tournament
router.post(baseUrl + '/tournament/delete/:id', function (req, res) {
    hasPerms(req, 1, auth => {
        if (auth) {
            tournament.delete(parseInt(req.params.id), (response) => {
                res.send(response);
                log.createLog(req.session.user[0]['discordId'], 'Deleted a tournament with id ' + req.params.id);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

// update tournament
router.put(baseUrl + '/tournament/:id', function (req, res) {
    isAdminOwner(req, req.params.id, auth => {
        if (auth) {
            tournament.update({ "tournament": req.body, "id": req.params.id }, (response) => {
                res.send(response);
                log.createLog(req.session.user[0]['discordId'], 'Updated a tournament with id ' + req.params.id);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

// save quals score
router.post(baseUrl + '/tournament/:id/qualifiers', function (req, res) {
    tournament.checkKey(req.params.id, req.headers.authorization)
        .then(isAuth => {
            if (isAuth) {
                req.body.tournamentId = req.params.id;
                tournament.saveQualScore(req.body)
                    .then(response => {
                        res.send(response)
                    })
                    .catch((err) => {
                        console.error(err);
                        res.sendStatus(500);
                    });
                // res.send(req.body);
            } else {
                res.sendStatus(401);
            }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
});

// get qualifiers scores
router.get(baseUrl + '/tournament/:id/qualifiers', function (req, res) {
    tournament.getQualsScores(req.params.id)
        .then(response => res.send(response))
        .catch(err => {
            console.error(err);
            res.sendStatus(500);
        })
});

// bracket testing
router.get(baseUrl + '/tournament/:id/bracketTest', function (req, res) {
    // isAdminOwner(req, req.params.id, auth => {
    //     if (auth) {
    //         tournament.update({ "tournament": req.body, "id": req.params.id }, (response) => {
    //             res.send(response);
    //             log.createLog(req.session.user[0]['discordId'], 'Updated a tournament with id ' + req.params.id);
    //         });
    //         return null;
    //     } else {
    //         res.sendStatus(401);
    //         return null;
    //     }
    // });
    // tournament.generateBracket(req.params.id, response => {
    //     res.send(response);
    // })
    tournament.generateBracket(req.params.id)
        .then(response => {
            res.send(response);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
});

// Update tournament settings
router.put(baseUrl + '/tournament/:id/settings', function (req, res) {
    isAdminOwner(req, req.params.id, auth => {
        if (auth) {
            tournament.updateSettings(req.body, (response) => {
                res.send(response);
                log.createLog(req.session.user[0]['discordId'], 'Updated a tournament settings with id ' + req.params.id);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

// Sign up for tournament settings
router.post(baseUrl + '/tournament/:id/signUp', function (req, res) {
    if (req.session.user[0] != null) {
        if (req.body.userId != null) {
            isAdminOwner(req, req.params.id, isAuth => {
                if (isAuth) {
                    tournament.signUp(req.body, response => {
                        res.send(response);
                        log.createLog(req.session.user[0]['discordId'], `Signed user(${req.body.userId}) up to a tournament (${req.params.id})`);
                    });
                    return null;
                } else {
                    res.sendStatus(401);
                    return null;
                }
            });
        } else {
            req.body.userId = req.session.user[0].discordId;
            tournament.signUp(req.body, response => {
                res.send(response);
                log.createLog(req.session.user[0]['discordId'], `Signed up to a tournament (${req.params.id})`);
            });
        }
    } else {
        res.sendStatus(401);
        return null;
    }
});

// Get participants
router.get(baseUrl + '/tournament/:id/participants', function (req, res) {
    isAdminOwner(req, req.params.id, isAuth => {
        if (isAuth) {
            tournament.participants(req.params.id, response => {
                res.send(response);
            }, true);
            return null;
        } else if (req.session.user != null) {
            tournament.participants(req.params.id, response => {
                res.send(response);
            }, false, req.session.user[0].discordId);
            return null;
        } else {
            tournament.participants(req.params.id, response => {
                res.send(response);
            });
            return null;
        }
    })
});

// update participant sign up
router.put(baseUrl + '/updateParticipant/:id/:participantId', function (req, res) {
    isAdminOwner(req, req.params.id, isAuth => {
        req.body.participantId = req.params.participantId;
        req.body.tournamentId = req.params.id;
        if (isAuth) {
            req.body.discordId = req.session.user[0].discordId;
            tournament.updateParticipant(req.body, true, response => {
                log.createLog(req.session.user[0]['discordId'], `Updated user(${req.body.userId}) sign up on a tournament (${req.params.id})`);
                res.send(response);
            });
            return null;
        } else if (req.session.user != null) {
            req.body.discordId = req.session.user[0].discordId;
            tournament.updateParticipant(req.body, false, response => {
                log.createLog(req.session.user[0]['discordId'], `Updated their sign up on a tournament (${req.params.id})`);
                res.send(response);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    })
});

router.post(baseUrl + '/tournament/:id/deleteParticipant', function (req, res) {
    isAdminOwner(req, req.params.id, isAuth => {
        if (isAuth) {
            tournament.removeParticipant(req.body, response => {
                log.createLog(req.session.user[0]['discordId'], `Removed user(${req.body.userId}) as a participant on a tournament (${req.params.id})`);
                res.send(response);
            });
            return null;
        } else {
            res.sendStatus(401)
            return null;
        }
    })
});

// archive tournament
router.put(baseUrl + '/archiveTournament', function (req, res) {
    hasPerms(req, 2, auth => {
        if (auth) {
            tournament.archive(req.body, (response) => {
                log.createLog(req.session.user[0]['discordId'], `Archived a tournament (${req.params.id})`);
                res.send(response);
            });
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

// Add map pool
router.post(baseUrl + '/tournament/:id/addPool', function (req, res) {
    isAdminOwner(req, req.params.id, auth => {
        if (auth) {
            tournament.addPool(req.body, (response) => {
                log.createLog(req.session.user[0]['discordId'], `Created a map pool for a tournament (${req.body.tournamentId})`);
                res.send(response);
            });
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

// get map pools
router.get(baseUrl + '/tournament/:id/map-pools', function (req, res) {
    if (req.headers.authorization != null) {
        tournament.checkKey(req.params.id, req.headers.authorization)
            .then(isAuth => {
                tournament.getMapPools(req.params.id, isAuth)
                    .then(response => {
                        res.send(response)
                    });
                // if (isAuth) {
                //     tournament.getMapPools(req.params.id, (result: any) => {
                //         res.send(result);
                //     }, true);
                // } else {
                //     tournament.getMapPools(req.params.id, (result: any) => {
                //         res.send(result);
                //     });
                // }
            })
            .catch((err) => {
                console.error(err);
                res.sendStatus(500);
            });
    } else {
        isAdminOwner(req, req.params.id, auth => {
            tournament.getMapPools(req.params.id, auth)
                .then(response => {
                    res.send(response)
                });
            //     if (auth) {
            //         tournament.getMapPools(req.params.id, (result: any) => {
            //             res.send(result);
            //         }, true);
            //         return null;
            //     } else {
            //         tournament.getMapPools(req.params.id, (result: any) => {
            //             res.send(result);
            //         });
            //         return null;
            //     }
        });
    }

});

// Udate map pools
router.put(baseUrl + '/tournament/:id/map-pools', function (req, res) {
    if (req.headers.authorization != null) {
        tournament.checkKey(req.params.id, req.headers.authorization)
            .then(isAuth => {
                if (isAuth) {
                    tournament.updatePool(req.body, (result) => {
                        res.send(result);
                    });
                    // return null;
                } else {
                    res.sendStatus(401);
                    // return null;
                }
            })
            .catch((err) => {
                console.error(err);
                res.sendStatus(500);
            });
    } else {
        isAdminOwner(req, req.params.id, auth => {
            if (auth) {
                tournament.updatePool(req.body, (result) => {
                    res.send(result);
                });
                return null;
            } else {
                res.sendStatus(401);
                return null;
            }
        });
    }
});

// Add song
router.post(baseUrl + '/tournament/:id/addSong', function (req, res) {
    if (req.headers.authorization != null) {
        tournament.checkKey(req.params.id, req.headers.authorization)
            .then(isAuth => {
                if (isAuth) {
                    tournament.addSong(req.body, (response) => {
                        log.createLog(req.headers.authorization, `Added a song a map pool (${req.body.poolId}) for a tournament (${req.body.tournamentId})`);
                        res.send(response);
                    });
                    // return null;
                } else {
                    res.sendStatus(401);
                    // return null;
                }
            })
            .catch((err) => {
                console.error(err);
                res.sendStatus(500);
            });
    } else {
        isAdminOwner(req, req.body.tournamentId, auth => {
            if (auth) {
                tournament.addSong(req.body, (response) => {
                    log.createLog(req.session.user[0]['discordId'], `Added a song a map pool (${req.body.poolId}) for a tournament (${req.body.tournamentId})`);
                    res.send(response);
                });
                return null;
            } else {
                res.sendStatus(401);
                return null;
            }
        });
    }
});

// Delete song from pool
router.post(baseUrl + '/tournament/:id/deleteSong', function (req, res) {
    if (req.headers.authorization != null) {
        tournament.checkKey(req.params.id, req.headers.authorization)
            .then(isAuth => {
                if (isAuth) {
                    tournament.deleteSong(req.body.id, (response) => {
                        log.createLog(req.headers.authorization, `Deleted a song a map pool (${req.body.poolId}) for a tournament (${req.body.tournamentId})`);
                        res.send(response);
                    });
                    // return null;
                } else {
                    res.sendStatus(401);
                    // return null;
                }
            })
            .catch((err) => {
                console.error(err);
                res.sendStatus(500);
            });
    } else {
        isAdminOwner(req, req.body.tournamentId, auth => {
            if (auth) {
                tournament.deleteSong(req.body.id, (response) => {
                    log.createLog(req.session.user[0]['discordId'], `Deleted a song a map pool (${req.body.poolId}) for a tournament (${req.body.tournamentId})`);
                    res.send(response);
                });
                return null;
            } else {
                res.sendStatus(401);
                return null;
            }
        });
    }
});

// Calendar events
router.get(baseUrl + '/events', function (req, res) {
    tournament.events((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/rankings', function (req, res) {
    ranking.getRanks(req.query.page, req.query.perPage)
        .then(response => {
            res.send(response);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
    // ranking.getRanks((result: any) => {
    //     res.send(result);
    // });
});

router.get(baseUrl + '/team', function (req, res) {
    ranking.getTeam((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/logs', function (req, res) {
    hasPerms(req, 2, isAuth => {
        if (isAuth) {
            log.getLogs2(req.query.page, req.query.perPage)
                .then(response => {
                    res.send(response);
                })
            return null;
        } else {
            res.sendStatus(401);
            return null;
        }
    });
});

module.exports = router;

// Auth stuff
function isAdminOwner(req, tournamentId, callback: Function) {
    if (req.session.user != null) {
        tournament.isOwner(req.session.user != null && req.session.user[0]['discordId'], tournamentId, (isOwner) => {
            hasPerms(req, 1, isAdmin => {
                if (isAdmin || isOwner) {
                    return callback(true);
                } else {
                    return callback(false);
                }
            });
        })
    } else {
        return callback(false);
    }
}

function hasPerms(req, level, callback: Function) {
    if (req.session.user != null) {
        user.getUserRoles(req.session.user[0].discordId, (data: Array<any>) => {
            if (data != null && data.length > 0) {
                let userRoles = data.map(x => x.roleId);
                if (Math.min(...userRoles) <= level) {
                    return callback(true);
                } else {
                    return callback(false);
                }
            } else {
                return callback(false);
            }
        });
    } else {
        return callback(false);
    }
}