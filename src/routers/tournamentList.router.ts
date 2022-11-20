import { Router } from 'express';
import { tournamentListController } from '../controllers/tournamentList.controller';

const tournamentListRouter: Router = Router();
const listCon: tournamentListController = new tournamentListController();

tournamentListRouter.get('/tournament/archived', (req, res) => listCon.getArchive(req, res));
tournamentListRouter.get('/mini-tournaments', (req, res) => listCon.getActiveMini(req, res));
tournamentListRouter.get('/tournaments', (req, res) => listCon.getActive(req, res));

export { tournamentListRouter }