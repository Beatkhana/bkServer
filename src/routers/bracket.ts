import { Router } from "express";
import { bracketController } from "../controllers/bracket";

const bracketRouter: Router = Router();
const bracketCon: bracketController = new bracketController();

bracketRouter.get("/tournament/:id/bracket", (req, res) => bracketCon.getBracket(req, res));
bracketRouter.get("/tournament/:tourneyId/bracket/:matchId", (req, res) => bracketCon.getBracketMatch(req, res));

bracketRouter.put("/tournament/:tourneyId/bracket/schedule/:id", (req, res) => bracketCon.scheduleMatch(req, res));
bracketRouter.put("/tournament/:tourneyId/bracket/update/:id", (req, res) => bracketCon.updateBracketMatch(req, res));
bracketRouter.put("/tournament/:tourneyId/bracket/setBestOf/:id", (req, res) => bracketCon.setBestOf(req, res));
bracketRouter.put("/tournament/:tourneyId/bracket/:matchId", (req, res) => bracketCon.updateBracket(req, res));

bracketRouter.post("/tournament/:tourneyId/generateBracket", (req, res) => bracketCon.saveBracket(req, res));
bracketRouter.post("/tournament/:tourneyId/overlay", (req, res) => bracketCon.saveOverlay(req, res));

export { bracketRouter };
