import { Router } from 'express';
import { bracketController } from '../controllers/bracket.controller';

const bracketRouter: Router = Router();
const bracketCon: bracketController = new bracketController();

bracketRouter.get('/tournament/:id/bracket', (req, res) => bracketCon.getBracket({ req: req, res: res }));
bracketRouter.get('/tournament/:tourneyId/bracket/:matchId', (req, res) => bracketCon.getBracketMatch({ req: req, res: res }));

bracketRouter.put('/tournament/:tourneyId/bracket/:matchId', (req, res) => bracketCon.updateBracket({ req: req, res: res }))

export { bracketRouter }