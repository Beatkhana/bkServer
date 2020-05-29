import mysql from 'mysql';
import { connect } from 'http2';
// const mysql = mysql;

export class database {

    public con: mysql.Connection;
    public connected: boolean = false;

    constructor() {
        this.con = mysql.createConnection({
            host: "us-cdbr-east-05.cleardb.net",
            user: "bf459e897fa39a",
            password: "88303776",
            database: "heroku_11100f74419df40"
        });


        // this.connectDb();
        // this.connected = true;
    }

    query(sql: string, callback: Function) {
        this.connectDb();
        this.con.query(sql, function (err, result, fields) {
            // if (err) console.log('error');
            // return callback(result);
            if (!err) {
                // res.send(rows);
                if(this.con){
                    this.con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        console.log('Close the database connection.');
                    });
                    return callback(result);
                }
            } else {
                console.log(err);
            }
        });
    }

    connectDb() {
        this.con.connect(function (err: any) {
            if (err) this.connectDb();
            console.log("Connected!");
        });
    }
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
