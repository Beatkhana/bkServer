import { Router } from 'express';
import { tournamentListController } from '../controllers/tournamentList.controller';

const tournamentListRouter: Router = Router();
const listCon: tournamentListController = new tournamentListController();

tournamentListRouter.get('/tournament/archived', (req, res) => listCon.getArchive(req, res));
// bracketRouter.get('/tournament/:tourneyId/bracket/:matchId', (req, res) => bracketCon.getBracketMatch({ req: req, res: res }));

// bracketRouter.put('/tournament/:tourneyId/bracket/:matchId', (req, res) => bracketCon.updateBracket({ req: req, res: res }))

export { tournamentListRouter }