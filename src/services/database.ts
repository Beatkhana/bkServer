import mysql from "mysql";
import config from "../config";
let con: mysql.Pool;

// export class database {
//     // to remove
//     public oldCon: mysql.Pool;
//     public connected: boolean = false;

//     constructor() {
//         if (!con) {
//             con = mysql.createPool({
//                 host: config.db.host,
//                 user: config.db.username,
//                 port: +(config.db.port ?? 3306),
//                 password: config.db.password,
//                 database: config.db.database,
//                 connectionLimit: 40,
//                 charset: "utf8mb4",
//                 timezone: "utc"
//             });
//         }
//         this.oldCon = mysql.createPool({
//             host: config.db.host,
//             user: config.db.username,
//             port: +(config.db.port ?? 3306),
//             password: config.db.password,
//             database: config.db.database,
//             connectionLimit: 40,
//             charset: "utf8mb4",
//             timezone: "utc"
//         });
//     }

//     query(sql: string, callback: Function) {
//         this.oldCon.getConnection(function (err, connection) {
//             if (err) throw err;
//             var query = connection.query(sql, function (error, results, fields) {
//                 let result = results;
//                 err = error;
//                 connection.release();
//                 return callback(err, result);
//             });
//         });
//     }

//     preparedQuery(sql: string, params: any[], callback: Function) {
//         this.oldCon.getConnection(function (err, connection) {
//             if (err) throw err;
//             var result;
//             var query = connection.query(sql, params, function (error, results, fields) {
//                 result = results;
//                 connection.release();
//                 return callback(error, result);
//             });
//         });
//     }

//     async aQuery(sql: string, params: any[] = []) {
//         return new Promise<any[]>((resolve, reject) => {
//             con.query(sql, params, (err: any, result: any, fields: any) => {
//                 if (err) reject(err);
//                 resolve(result);
//             });
//         });
//     }

//     async asyncPreparedQuery(sql: string, params: any[] = []) {
//         return new Promise((resolve, reject) => {
//             this.oldCon.query(sql, params, (err, result, fields) => {
//                 if (err) reject(err);
//                 resolve(result);
//             });
//         });
//     }

//     async paginationQuery(table: string, page: number, perPage: number, sql: string, params: any[] = []) {
//         let numRecords: any = await this.asyncPreparedQuery("SELECT COUNT(*) as numRows FROM ??", [table]);
//         numRecords = numRecords[0].numRows;
//         if (page <= numRecords / perPage) {
//             sql += " LIMIT ? OFFSET ?";
//             params.push(+perPage);
//             params.push(page * perPage);
//             return new Promise((resolve, reject) => {
//                 let query = this.oldCon.query(sql, params, (err, result, fields) => {
//                     if (err) reject(err);
//                     // console.log(query.sql);
//                     resolve({ total: numRecords, data: result });
//                 });
//             });
//         } else {
//             return { err: "Invalid requested page" };
//         }
//     }
// }

export interface IQueryResponse {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
}

type queryResponseType<T> = T extends IQueryResponse ? IQueryResponse : T[];

export default abstract class DatabaseService {
    static init() {
        return new Promise<void>(resolve => {
            if (!con) {
                con = mysql.createPool({
                    host: config.db.host,
                    user: config.db.username,
                    port: +(config.db.port ?? 3306),
                    password: config.db.password,
                    database: config.db.database,
                    connectionLimit: 40,
                    charset: "utf8mb4",
                    timezone: "utc"
                });
            }
            resolve();
        });
    }

    public static async query<T = IQueryResponse>(sql: string, params: any[] = []): Promise<queryResponseType<T>> {
        return new Promise<queryResponseType<T>>((resolve, reject) => {
            if (!con) {
                reject("Connection not defined");
            }
            con.query(sql, params, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    public static async nestedQuery<T = IQueryResponse>(sql: string, params: any[] = []): Promise<queryResponseType<T>> {
        return new Promise<queryResponseType<T>>((resolve, reject) => {
            if (!con) reject("Connection not defined");
            con.query({ sql: sql, nestTables: true }, params, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    public static async queryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
        const qResult = await this.query<T>(sql, params);
        if (Array.isArray(qResult) && qResult.length > 0) {
            return qResult[0];
        } else {
            return null;
        }
    }

    public static async nestedQueryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
        const qResult = await this.nestedQuery<T>(sql, params);
        if (Array.isArray(qResult) && qResult.length > 0) {
            return qResult[0];
        } else {
            return null;
        }
    }

    public static async paginationQuery(table: string, page: number, perPage: number, sql: string, params: any[] = []) {
        let numRecords: any = await this.query("SELECT COUNT(*) as numRows FROM ??", [table]);
        numRecords = numRecords[0].numRows;
        if (page <= numRecords / perPage) {
            sql += " LIMIT ? OFFSET ?";
            params.push(+perPage);
            params.push(page * perPage);
            return new Promise(async (resolve, reject) => {
                try {
                    resolve({ total: numRecords, data: await this.query(sql, params) });
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            return { err: "Invalid requested page" };
        }
    }
}
