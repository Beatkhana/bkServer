import express from 'express';
import { tournaments } from './tournaments';
import { userAuth } from './userAuth';

const tournament = new tournaments();
const user = new userAuth();
const router = express.Router();
const baseUrl = '/api';

const session = require('express-session');

// Routes
router.get(baseUrl, function (req, res) {
    res.send({ hello: 'there' });
});

router.get(baseUrl + '/tournaments', function (req, res) {
    tournament.getActive((result: any) => {
        res.send(result);
    });
});

router.get(baseUrl + '/discordAuth', function (req, res) {
    if(req.query.code){
        // console.log(req.query.code);
        user.sendCode(req.query.code.toString(), (usrRes) => {
            // console.log(user.getUser())
            // res.redirect('/');
            // req.session
            req.session.user = usrRes;
            // res.send(usrRes);
            res.redirect('/');
        });
    }else {
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
    req.session.destroy(()=>{});
    // user.logOut()
    res.redirect('/');
});

router.get(baseUrl + '/tournament/archived', function (req, res) {
    tournament.getArchived((result: any) => {
        res.send(result);
    });
}); 

router.get(baseUrl + '/tournament/:id', function (req, res) {
    // console.log(req.params)
    tournament.getTournament(req.params.id,(result: any) => {
        res.send(result);
    });
}); 

module.exports = router;