import compression from "compression";
import express from "express";
// import fileUpload from "express-fileupload";
import { getSessionParser } from "../services/session";

export default async ({ app }: { app: express.Application }) => {
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE");
        if ("OPTIONS" === req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        switch (err.message) {
            case "NoCodeProvided":
                return res.status(400).send({
                    status: "ERROR",
                    error: err.message
                });
            default:
                return res.status(500).send({
                    status: "ERROR",
                    error: err.message
                });
        }
    });
    const sessionParser = getSessionParser();
    if (!sessionParser) throw new Error("Failed to get session parser");
    app.use(sessionParser);
    app.use(compression());
    // app.use(fileUpload());
    app.use(express.json({ limit: "50mb" }));
    app.set("trust proxy", 2);
    app.disable("x-powered-by");
};
