import express from "express";
import config from "./src/config";
import { owopWS, wss } from "./src/controllers/websocket/server";
import ModuleLoader from "./src/modules";

async function startServer() {
    const app = express();

    await ModuleLoader.init({ app });

    const server = app.listen(config.appPort, () => {
        console.info("Server now listening on " + config.appPort);
        console.info("Running in " + config.env + " mode");
    });
    // allow websocket connections
    server.on("upgrade", (request: any, socket: any, head: any) => {
        wss.handleUpgrade(request, socket, head, (socket: any) => {
            wss.emit("connection", socket, request);
        });
    });
}
startServer();
