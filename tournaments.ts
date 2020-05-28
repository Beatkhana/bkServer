import { database } from './database';
import mysql from 'mysql';



export class tournaments {

    // public con: mysql.Connection;
    // public connected: boolean = false;
    db = new database();

    constructor () {}

    getAll(callback:Function) {
        var data:any = [];
        const result = this.db.query("SELECT * FROM tournaments",(result: any) => {
            return callback(result);
        });
    }

    getActive(callback:Function) {
        var data:any = [];
        const result = this.db.query("SELECT * FROM tournaments WHERE archived = 0",(result: any) => {
            return callback(result);
        });
    }

    getTournament(id:string, callback:Function) {
        var data:any = [];
        const result = this.db.query(`SELECT * FROM tournaments WHERE id = ${id}`,(result: any) => {
            return callback(result);
        });
    }

}