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

    getLogs(callback:Function) {
        this.db.query('SELECT logs.*, u.* FROM logs LEFT JOIN users u ON u.discordId = logs.userId', (err, result) => {
            callback(result);
        });
    }
}