import * as express from "express";
import { authController } from "../controllers/auth";

export interface authRequest {
    req: express.Request;
    res: express.Response;
    auth?: authController;
}
