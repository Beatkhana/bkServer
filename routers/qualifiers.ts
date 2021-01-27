import { Router } from 'express';
import { QualifiersController } from '../controllers/qualifiers';

const qualifiersRouter: Router = Router();
const qualsCon: QualifiersController = new QualifiersController();

qualifiersRouter.post('/tournament/:tourneyId/qualifiers', (req, res) => qualsCon.saveScore(req, res));
qualifiersRouter.put('/tournament/:tourneyId/updateFlags', (req, res) => qualsCon.updateFlags(req, res));
qualifiersRouter.get('/tournament/:tourneyId/qualifiers', (req, res) => qualsCon.getScores(req, res));

export { qualifiersRouter }