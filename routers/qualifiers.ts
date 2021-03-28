import { Router } from 'express';
import { QualifiersController } from '../controllers/qualifiers';

const qualifiersRouter: Router = Router();
const qualsCon: QualifiersController = new QualifiersController();

qualifiersRouter.post('/tournament/:tourneyId/qualifiers', (req, res) => qualsCon.saveScore(req, res));
qualifiersRouter.put('/tournament/:tourneyId/updateFlags', (req, res) => qualsCon.updateFlags(req, res));
qualifiersRouter.put('/tournament/:tourneyId/updateFlags', (req, res) => qualsCon.updateFlags(req, res));
qualifiersRouter.post('/tournament/:tourneyId/qualifiers/sessions/add', (req, res) => qualsCon.addSession(req, res));
qualifiersRouter.post('/tournament/:tourneyId/qualifiers/sessions/assign', (req, res) => qualsCon.assignSession(req, res));
qualifiersRouter.get('/tournament/:tourneyId/qualifiers/sessions/current', (req, res) => qualsCon.userSession(req, res));
qualifiersRouter.get('/tournament/:tourneyId/qualifiers/sessions/all', (req, res) => qualsCon.sessions(req, res));
qualifiersRouter.delete('/tournament/:tourneyId/qualifiers/sessions/delete/:id', (req, res) => qualsCon.deleteSession(req, res));
qualifiersRouter.get('/tournament/:tourneyId/qualifiers/sessions', (req, res) => qualsCon.getSessions(req, res));
qualifiersRouter.get('/tournament/:tourneyId/qualifiers', (req, res) => qualsCon.getScores(req, res));

export { qualifiersRouter }