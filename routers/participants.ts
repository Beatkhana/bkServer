import { Router } from 'express';
import { ParticipantsController } from '../controllers/participants';
import { TournamentController } from '../controllers/tournament.controller';

const participantsRouter: Router = Router();
const participantsCon: ParticipantsController = new ParticipantsController();

// participantsRouter.get('/tournament/:tourneyId/allParticipants', (req, res) => participantsCon.getAllParticipants(req, res));
participantsRouter.get('/tournament/:tourneyId/participants', (req, res) => participantsCon.getParticipants(req, res));

export { participantsRouter }