import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';



export class rankings {
    db = new database();

    constructor () {}

    allUsers(callback:Function) {
        var data:any = [];
        
        const result = this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users",(err, result: any) => {
            return callback(result);
        });
    }

    getTeam(callback:Function) {
        const result = this.db.query(`SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames
        FROM users
        LEFT JOIN roleassignment ra ON ra.userId = users.discordId
        LEFT JOIN roles r ON r.roleId = ra.roleId
        WHERE r.roleId = 1 OR r.roleId = 2
        GROUP BY users.discordId`,(err, result: any) => {
            result.map(e => {
                e.roleIds = e.roleIds.split(', ').map(x=>+x);
                e.roleNames = e.roleNames.split(', ');
            })
            return callback(result);
        });
    }

    getRanks(callback:Function) {
        const result = this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank",(err, result: any) => {
            return callback(result);
        });
    }

    getUser(userId:string, callback:Function) {
        this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users WHERE discordId = "+userId,(err, result: any) => {
            return callback(result);
        });
    }
}