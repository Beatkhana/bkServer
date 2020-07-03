import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';



export class rankings {
    db = new database();

    constructor () {}

    allUsers(callback:Function) {
        var data:any = [];
        
        const result = this.db.query("SELECT * FROM users",(err, result: any) => {
            return callback(result);
        });
    }

    getRanks(callback:Function) {
        const result = this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank",(result: any) => {
            return callback(result);
        });
    }

    getUser(userId:string, callback:Function) {
        this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users WHERE discordId = "+userId,(result: any) => {
            return callback(result);
        });
    }
}