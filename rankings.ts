import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';



export class rankings {
    db = new database();

    constructor() { }

    allUsers(callback: Function) {
        var data: any = [];

        const result = this.db.query(`SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, 
        discordId,
        ssId,
        \`users\`.\`name\`,
        \`users\`.\`twitchName\`,
        \`users\`.\`avatar\`,
        \`users\`.\`globalRank\`,
        \`users\`.\`localRank\`,
        \`users\`.\`country\`,
        \`users\`.\`tourneyRank\`,
        \`users\`.\`TR\`,
        \`users\`.\`pronoun\`, 
        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames
        FROM users
        LEFT JOIN roleassignment ra ON ra.userId = users.discordId
        LEFT JOIN roles r ON r.roleId = ra.roleId
        GROUP BY users.discordId`, (err, result: any) => {
            return callback(result);
        });
    }

    getTeam(callback: Function) {
        const result = this.db.query(`SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, 
        discordId,
        ssId,
        \`users\`.\`name\`,
        \`users\`.\`twitchName\`,
        \`users\`.\`avatar\`,
        \`users\`.\`globalRank\`,
        \`users\`.\`localRank\`,
        \`users\`.\`country\`,
        \`users\`.\`tourneyRank\`,
        \`users\`.\`TR\`,
        \`users\`.\`pronoun\`, 
        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames
        FROM users
        LEFT JOIN roleassignment ra ON ra.userId = users.discordId
        LEFT JOIN roles r ON r.roleId = ra.roleId
        WHERE r.roleId = 1 OR r.roleId = 2 OR r.roleId = 6
        GROUP BY users.discordId`, (err, result: any) => {
            result.map(e => {
                e.roleIds = e.roleIds.split(', ').map(x => +x);
                e.roleNames = e.roleNames.split(', ');
            })
            return callback(result);
        });
    }

    async getRanks(page: any = 0, perPage: any = 25) {
        const result: any = await this.db.paginationQuery('users', page, perPage, "SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank, globalRank=0, globalRank");
        return result;
        // const result = this.db.query("SELECT CAST(discordId AS CHAR) as discordId, ssId, name, twitchName, avatar, globalRank, localRank, country, tourneyRank, TR FROM users ORDER BY tourneyRank, globalRank=0, globalRank",(err, result: any) => {
        //     console.log(err)
        //     return callback(result);
        // });
    }

    getUser(userId: string, callback: Function) {
        this.db.preparedQuery(`SELECT u.discordId, u.ssId, u.name, u.twitchName, u.avatar, u.globalRank, u.localRank, u.country, u.tourneyRank, u.TR, u.pronoun, GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tournaments FROM users u
        LEFT JOIN participants p ON p.userId = u.discordId
        LEFT JOIN tournaments t ON p.tournamentId = t.id
        LEFT JOIN tournament_settings ts ON p.tournamentId = ts.tournamentId AND ts.public = 1
        WHERE u.discordId = ?
        GROUP BY u.discordId`, [userId], (err, result: any) => {
            console.log(err)
            return callback(result);
        });
    }

    getUserSS(userId: string, callback: Function) {
        this.db.preparedQuery(`SELECT u.discordId, u.ssId, u.name, u.twitchName, u.avatar, u.globalRank, u.localRank, u.country, u.tourneyRank, u.TR, u.pronoun, GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tournaments FROM users u
        LEFT JOIN participants p ON p.userId = u.discordId
        LEFT JOIN tournaments t ON p.tournamentId = t.id
        WHERE u.ssId = ?
        GROUP BY u.discordId`, [userId], (err, result: any) => {
            return callback(result);
        });
    }
}