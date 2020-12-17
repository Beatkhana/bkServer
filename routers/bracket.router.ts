import { Router } from 'express';
import { bracketController } from '../controllers/bracket.controller';

const bracketRouter: Router = Router();
const bracketCon: bracketController = new bracketController();

bracketRouter.get('/tournament/:id/bracket', (req, res) => bracketCon.getBracket({ req: req, res: res }));
bracketRouter.get('/tournament/:tourneyId/bracket/:matchId', (req, res) => bracketCon.getBracketMatch({ req: req, res: res }));

bracketRouter.put('/tournament/:tourneyId/bracket/schedule/:id', (req, res) => bracketCon.scheduleMatch(req, res));
bracketRouter.put('/tournament/:tourneyId/bracket/setBestOf/:id', (req, res) => bracketCon.setBestOf(req, res));
bracketRouter.put('/tournament/:tourneyId/bracket/:matchId', (req, res) => bracketCon.updateBracket({ req: req, res: res }));

bracketRouter.post('/tournament/:id/generateBracket', (req, res) => bracketCon.saveBracket(req, res));

export { bracketRouter }