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
            // password: "tY5p5DsA91ay",
            // database: "u826845424_beatKhanaTest"
        });


        // this.connectDb();
        // this.connected = true;
    }

    query(sql: string, callback: Function) {
        // this.connectDb();
        // this.con.query(sql, function (err, result, fields) {
        //     // if (err) console.log('error');
        //     // return callback(result);
        //     if (!err) {
        //         // res.send(rows);
        //         if (this.con) {
        //             this.con.end(function (err) {
        //                 if (err) {
        //                     return console.log('error:' + err.message);
        //                 }
        //                 console.log('Close the database connection.');
        //             });
        //             return callback(result);
        //         }
        //     } else {
        //         console.log(err);
        //     }
        // });
        this.con.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            console.log('yee');
            var result;
            // Use the connection
            connection.query(sql, function (error, results, fields) {
                // When done with the connection, release it.
                result = results;
                // console.log(results);
                connection.release();
                // console.log(results);
                
                // Handle error after the release.
                if (error) throw error;
                return callback(result);

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    }

    // connectDb() {
    //     this.con.connect(function (err: any) {
    //         if (err) this.connectDb();
    //         console.log("Connected!");
    //     });
    // }
    // connect() {
    //     const con = mysql.createConnection({
    //         host: "localhost",
    //         user: "dan",
    //         password: "test",
    //         database: "bkTest"
    //     });

    //     return con;

    //     // this.con.connect(function (err: any) {
    //     //     if (err) return false
    //     //     return this.con;
    //     //     // console.log("Connected!");
    //     // });

    //     // this.connected = true;
    // }

}
