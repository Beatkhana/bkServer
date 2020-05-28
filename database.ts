import mysql from 'mysql';
// const mysql = mysql;

export class database {

    public con: mysql.Connection;
    public connected: boolean = false;

    constructor() {
        this.con = mysql.createConnection({
            host: "localhost",
            user: "bf459e897fa39a",
            password: "88303776",
            database: "heroku_11100f74419df40"
        });


        this.con.connect(function (err: any) {
            if (err) throw err
            console.log("Connected!");
        });

        this.connected = true;
    }

    query(sql:string, callback:Function) {

        this.con.query(sql, function (err, result, fields) {
            if (err) throw err;
            return callback(result);
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
