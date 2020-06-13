import mysql from 'mysql';
import { connect } from 'http2';
// const mysql = mysql;

export class database {

    public con: any;
    public connected: boolean = false;

    constructor() {
        this.con = mysql.createPool({
            host: "us-cdbr-east-05.cleardb.net",
            user: "bf459e897fa39a",
            password: "88303776",
            database: "heroku_11100f74419df40",
            connectionLimit: 10
            // host: "sql230.main-hosting.eu",
            // user: "u826845424_beatKhanaTest",
            // password: "Vl0M6MbwGFyj",
            // database: "u826845424_beatKhanaTest"
        });


        // this.connectDb();
        // this.connected = true;
    }

    query(sql: string, callback: Function) {
        this.con.getConnection(function (err, connection) {
            if (err) throw err;
            var result;
            connection.query(sql, function (error, results, fields) {
                result = results;
                connection.release();
                if (error) throw error;
                return callback(result);
            });
        });
    }

    preparedQuery(sql:string, params: any[], callback:Function) {
        this.con.getConnection(function (err, connection) {
            if (err) throw err;
            var result;
            var query = connection.query(sql, params, function (error, results, fields) {
                result = results;
                connection.release();
                console.log(query.sql);
                if (error) throw error;
                return callback(result);
            });
        });
    }
}
