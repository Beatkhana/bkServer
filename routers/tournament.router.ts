import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';

const tournamentRouter: Router = Router();
const tournamentCon: TournamentController = new TournamentController();

tournamentRouter.get('/tournament/:tourneyId/signedUp', (req, res) => tournamentCon.isSignedUp(req, res));
tournamentRouter.get('/tournament/:tourneyId/staff', (req, res) => tournamentCon.getStaff(req, res));

tournamentRouter.post('/tournament/:tourneyId/staff', (req, res) => tournamentCon.addStaff(req, res));

export { tournamentRouter }