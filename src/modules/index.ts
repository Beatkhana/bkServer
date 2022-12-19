import express from "express";
import { wssServer } from "../controllers/websocket/server";
import DatabaseService from "../services/database";
import sessionService from "../services/session";
import { cronController } from "./cronLoader";
import expressLoader from "./express";
import router from "./router";

export default abstract class ModuleLoader {
    public static async init({ app }: { app: express.Application }) {
        await DatabaseService.init();
        await sessionService();
        // await logger({ app });
        await expressLoader({ app });
        // await rateLimit({ app });
        await router({ app });

        wssServer.init();

        await cronController.setCrons();
        // await cronController.setCrons();
        // await MatchRoundController.init();
        // await StreamElementsManager.init();

        // liveMatchCon.start();
        // twitch();
    }
}
