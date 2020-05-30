import express from 'express';
import { tournaments } from './tournaments';
import { userAuth } from './userAuth';

const tournament = new tournaments();
const user = new userAuth();
const router = express.Router();
const baseUrl = '/api';
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
        user.sendCode(req.query.code.toString(), () => {
            res.redirect('/');
        });
    }else {
        res.redirect('/');
    }
});

router.get(baseUrl + '/user', function (req, res) {
    res.send(user.getUser());
});

router.get(baseUrl + '/tournament/archived', function (req, res) {
    // console.log(req.params)
    tournament.getArchived((result: any) => {
        res.send(result);
    });
}); 

router.get(baseUrl + '/tournament/:id', function (req, res) {
    console.log(req.params)
    tournament.getTournament(req.params.id,(result: any) => {
        res.send(result);
    });
}); 

module.exports = router;