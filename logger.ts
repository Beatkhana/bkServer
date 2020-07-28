import { database } from './database';

export class logger {
    db = new database();

    constructor () {}

    createLog(userId: string, log:string) {
        let time = new Date().toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '');
        this.db.preparedQuery("INSERT INTO logs (userId, log, time) VALUES (?)", [[userId, log, time]], (err, result) => {
            if (err) console.error(err);
        });
    }
}