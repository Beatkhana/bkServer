import mysql from 'mysql';
import { connect } from 'http2';
// const mysql = mysql;
let con: mysql.Pool;

export class database {

    // to remove
    public oldCon: any;
    public connected: boolean = false;

    constructor() {
        const env = process.env.NODE_ENV || 'production';
        // console.log(env);
        if (!con) {
            if (env == 'production') {
                // con = mysql.createPool({
                //     host: "localhost",
                //     user: "dan",
                //     password: "root",
                //     database: "bk",
                //     connectionLimit: 100,
                //     charset: 'utf8mb4',
                //     timezone: 'utc'
                // });
                con = mysql.createPool({
                    host: "localhost",
                    user: "dan",
                    password: "test",
                    database: "bk",
                    connectionLimit: 100,
                    charset: 'utf8mb4',
                    timezone: 'utc'
                });
            } else {
                con = mysql.createPool({
                    host: "localhost",
                    user: "dan",
                    password: "test",
                    database: "bk",
                    connectionLimit: 100,
                    charset: 'utf8mb4',
                    timezone: 'utc'
                });
            }
            
        }
        if (env == 'production') {
            this.oldCon = mysql.createPool({
                host: "localhost",
                user: "dan",
                password: "root",
                database: "bk",
                connectionLimit: 100,
                charset: 'utf8mb4',
                timezone: 'utc'
            });
        } else {
            this.oldCon = mysql.createPool({
                host: "localhost",
                user: "dan",
                password: "test",
                database: "bk",
                connectionLimit: 100,
                charset: 'utf8mb4',
                timezone: 'utc'
            });
        }
    }

    query(sql: string, callback: Function) {
        this.oldCon.getConnection(function (err, connection) {
            if (err) throw err;
            var query = connection.query(sql, function (error, results, fields) {
                let result = results;
                err = error;
                connection.release();
                // if (error) throw error;
                // console.log(query.sql)
                return callback(err, result);
            });
        });
    }

    preparedQuery(sql: string, params: any[], callback: Function) {
        this.oldCon.getConnection(function (err, connection) {
            if (err) throw err;
            var result;
            var query = connection.query(sql, params, function (error, results, fields) {
                result = results;
                connection.release();
                return callback(error, result);
            });
        });
    }

    async aQuery(sql: string, params: any[] = []) {
        return new Promise<any[]>((resolve, reject) => {
            con.query(sql, params, (err: any, result: any, fields: any) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    async asyncPreparedQuery(sql: string, params: any[] = []) {
        return new Promise((resolve, reject) => {
            this.oldCon.query(sql, params, (err, result, fields) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    async paginationQuery(table: string, page: number, perPage: number, sql: string, params: any[] = []) {
        let numRecords: any = await this.asyncPreparedQuery('SELECT COUNT(*) as numRows FROM ??', [table]);
        numRecords = numRecords[0].numRows;
        if(page <= numRecords/perPage) {
            sql += " LIMIT ? OFFSET ?";
            params.push(+perPage);
            params.push(page*perPage);
            return new Promise((resolve, reject) => {
                let query = this.oldCon.query(sql, params, (err, result, fields) => {
                    if (err) reject(err);
                    // console.log(query.sql);
                    resolve({total: numRecords, data: result});
                });
            });
        } else {
            return {err: 'Invalid requested page'};
        }
    }
}
