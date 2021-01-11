import * as express from 'express'
import { database } from '../database';
import { settings } from '../models/settings.model';
import { emitter } from './event.controller';
import Ajv, {JSONSchemaType, DefinedError} from "ajv"
export abstract class controller {

    protected env = process.env.NODE_ENV || 'production';
    protected db = new database();

    protected CLIENT_ID = '721696709331386398';
    protected CLIENT_SECRET = 'LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6';

    protected emitter = emitter;

    protected ajv = new Ajv();

    protected delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    protected async getSettings(id: string | number): Promise<settings> {
        const set: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        return set[0];
    }

    protected validate(schema: object, data: object) {
        const validate = this.ajv.compile(schema);
        if (validate(data)) {
            return true;
        } else {
            return validate.errors;
        }
    }

    public static jsonResponse(
        res: express.Response, code: number, message: string
    ) {
        return res.status(code).json({ message })
    }

    public ok<T>(res: express.Response, dto?: T) {
        if (!!dto) {
            res.type('application/json');
            return res.status(200).json(dto);
        } else {
            return res.status(200).json();
        }
    }

    public created(res: express.Response) {
        return res.sendStatus(201);
    }

    public clientError(res: express.Response, message?: string) {
        return controller.jsonResponse(res, 400, message ? message : 'Unauthorized');
    }

    public unauthorized(res: express.Response, message?: string) {
        return controller.jsonResponse(res, 401, message ? message : 'Unauthorized');
    }

    public forbidden(res: express.Response, message?: string) {
        return controller.jsonResponse(res, 403, message ? message : 'Forbidden');
    }

    public notFound(res: express.Response, message?: string) {
        return controller.jsonResponse(res, 404, message ? message : 'Not found');
    }

    public conflict(res: express.Response, message?: string) {
        return controller.jsonResponse(res, 409, message ? message : 'Conflict');
    }

    public tooMany(res: express.Response, message?: string) {
        return controller.jsonResponse(res, 429, message ? message : 'Too many requests');
    }

    public todo(res: express.Response) {
        return controller.jsonResponse(res, 400, 'TODO');
    }

    public fail(res: express.Response, error: Error | string) {
        console.error(error);
        return res.status(500).json({
            message: error.toString()
        })
    }
}