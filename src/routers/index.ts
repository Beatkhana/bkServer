import { Router } from "express";
import { bracketRouter } from "./bracket";
import { mapPoolRouter } from "./map_pool";
import { participantsRouter } from "./participants";
import { qualifiersRouter } from "./qualifiers";
import { tournamentRouter } from "./tournament";
import { tournamentListRouter } from "./tournamentList";
import { userRouter } from "./user.router";

export abstract class BSLRouter {
    static routes = [bracketRouter, tournamentListRouter, participantsRouter, mapPoolRouter, tournamentRouter, userRouter, qualifiersRouter];

    static async init() {
        for (const route of this.routes) {
            apiRouter.use(route);
        }
        apiRouter.use((req, res) => {
            res.status(404).send({ error: "Not found" });
        });
    }
}

export const apiRouter: Router = Router();
