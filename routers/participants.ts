import { Router } from 'express';
import { ParticipantsController } from '../controllers/participants';
import { TournamentController } from '../controllers/tournament.controller';

const participantsRouter: Router = Router();
const participantsCon: ParticipantsController = new ParticipantsController();

participantsRouter.get('/tournament/:tourneyId/allParticipants', (req, res) => participantsCon.getAllParticipants(req, res));
participantsRouter.get('/tournament/:tourneyId/participants', (req, res) => participantsCon.getParticipants(req, res));

participantsRouter.put('/updateParticipant/:tourneyId/:participantId', (req, res) => participantsCon.updateParticipant(req, res));

participantsRouter.post('/tournament/:tourneyId/deleteParticipant', (req, res) => participantsCon.removeParticipant(req, res));
participantsRouter.post('/tournament/:tourneyId/elimParticipant', (req, res) => participantsCon.eliminateParticipant(req, res));

export { participantsRouter }