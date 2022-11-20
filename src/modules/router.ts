import express from "express";
import path from "path";
import config from "../config";
import { apiRouter, BSLRouter } from "../routers/index";

export default async ({ app }: { app: express.Application }) => {
    const mainDir = config.env == "development" ? "../../dist/public" : "../public";
    const assetDir = config.env == "development" ? "../../dist/public/assets" : "../public/assets";
    await BSLRouter.init();
    app.use("/api", apiRouter);
    app.use("/assets/fonts", (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    });
    app.use("/assets", express.static(path.join(__dirname, assetDir), { maxAge: "30d" }));
    app.use(express.static(path.join(__dirname, mainDir), { maxAge: "1d" }));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, mainDir + "/index.html"));
    });
};
