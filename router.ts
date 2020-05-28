import express from 'express';
import { tournaments } from './tournaments';

const tournament = new tournaments();
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

router.get(baseUrl + '/tournament/:id', function (req, res) {
    console.log(req.params)
    tournament.getTournament(req.params.id,(result: any) => {
        res.send(result);
    });
}); 

module.exports = router;