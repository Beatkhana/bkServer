import mysql from 'mysql';
// const mysql = mysql;
declare const con: mysql.Connection;

export class database {

    public con: mysql.Connection;
    public connected: boolean = false;

    constructor() {



        // this.con.connect(function (err: any) {
        //     // if (err) throw err
        //     // console.log("Connected!");
        //     // if (err) {                                     // or restarting (takes a while sometimes).
        //     //     console.log('error when connecting to db:', err);
        //     //     setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        //     // }
        // });

        // this.connected = true;
        this.handleDisconnect();
    }

    query(sql: string, callback: Function) {

        this.con.query(sql, function (err, result, fields) {
            if (err) throw err;
            return callback(result);
        });
    }

    handleDisconnect() {
        this.con = mysql.createConnection({
            host: "us-cdbr-east-05.cleardb.net",
            user: "bf459e897fa39a",
            password: "88303776",
            database: "heroku_11100f74419df40"
        }); // Recreate the connection, since
        // the old one cannot be reused.

        this.con.connect(function (err) {              // The server is either down
            if (err) {                                     // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(this.handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
            }                                     // to avoid a hot loop, and to allow our node script to
        });                                     // process asynchronous requests in the meantime.
        // If you're also serving http, display a 503 error.
        this.con.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                this.handleDisconnect();                         // lost due to either server restart, or a
            } else {                                      // connnection idle timeout (the wait_timeout
                throw err;                                  // server variable configures this)
            }
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
