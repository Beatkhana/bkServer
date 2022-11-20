import { authController } from "../controllers/auth.controller";
import * as express from 'express';

export interface authRequest {
    req: express.Request
    res: express.Response
    auth?: authController
}