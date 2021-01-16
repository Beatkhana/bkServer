import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';

const tournamentRouter: Router = Router();
const tournamentCon: TournamentController = new TournamentController();

tournamentRouter.get('/tournament/:tourneyId/signedUp', (req, res) => tournamentCon.isSignedUp(req, res));
tournamentRouter.get('/tournament/:tourneyId/staff', (req, res) => tournamentCon.getStaff(req, res));
tournamentRouter.get('/tournament/:tourneyId', (req, res) => tournamentCon.getTournament(req, res));

tournamentRouter.post('/tournament/:tourneyId/staff', (req, res) => tournamentCon.addStaff(req, res));
tournamentRouter.post('/tournament/:tourneyId/signUp', (req, res) => tournamentCon.signUp(req, res));
tournamentRouter.post('/tournament', (req, res) => tournamentCon.createTournament(req, res));

tournamentRouter.delete('/tournament/:tourneyId', (req, res) => tournamentCon.deleteTournament(req, res));

tournamentRouter.put('/tournament/:tourneyId/settings', (req, res) => tournamentCon.updateSettings(req, res));
tournamentRouter.put('/tournament/:tourneyId', (req, res) => tournamentCon.updateTournament(req, res));

export { tournamentRouter }