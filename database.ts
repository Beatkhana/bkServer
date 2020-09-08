import mysql from 'mysql';
import { connect } from 'http2';
// const mysql = mysql;

export class database {

    public con: any;
    public connected: boolean = false;

    constructor() {
        const env = process.env.NODE_ENV || 'production';
        // console.log(env);
        if (env == 'production') {
            // this.con = mysql.createPool({
            //     host: "us-cdbr-east-02.cleardb.com",
            //     user: "bdaa6c4e2efd54",
            //     password: "f84071f4",
            //     database: "heroku_da687e9a34aa489",
            //     connectionLimit: 10,
            //     charset: 'utf8mb4',
            //     timezone: 'utc'
            // });
            this.con = mysql.createPool({
                host: "213.190.6.106",
                user: "u826845424_bkLive",
                password: "5%Gy88OoPje5",
                database: "u826845424_bkLive",
                connectionLimit: 10,
                charset: 'utf8mb4',
                timezone: 'utc'
            });
        } else {
            // this.con = mysql.createPool({
            //     host: "us-cdbr-east-05.cleardb.net",
            //     user: "bf459e897fa39a",
            //     password: "88303776",
            //     database: "heroku_11100f74419df40",
            //     connectionLimit: 10
            // });
            this.con = mysql.createPool({
                host: "localhost",
                user: "dan",
                password: "test",
                database: "heroku_11100f74419df40",
                connectionLimit: 10,
                charset: 'utf8mb4',
                timezone: 'utc'
            });
            // this.con = mysql.createPool({
            //     host: "213.190.6.106",
            //     user: "u826845424_bkLive",
            //     password: "5%Gy88OoPje5",
            //     database: "u826845424_bkLive",
            //     connectionLimit: 10,
            //     charset: 'utf8mb4',
            //     timezone: 'utc'
            // });
        }
    }

    query(sql: string, callback: Function) {
        this.con.getConnection(function (err, connection) {
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
        this.con.getConnection(function (err, connection) {
            if (err) throw err;
            var result;
            var query = connection.query(sql, params, function (error, results, fields) {
                result = results;
                connection.release();
                // console.log(query.sql);
                // if (error) throw error;
                return callback(error, result);
            });
        });
    }

    async asyncPreparedQuery(sql: string, params: any[] = []) {
        return new Promise((resolve, reject) => {
            this.con.query(sql, params, (err, result, fields) => {
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
                let query = this.con.query(sql, params, (err, result, fields) => {
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
