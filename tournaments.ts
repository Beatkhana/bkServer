import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';



export class tournaments {
    db = new database();

    constructor () {
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }

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

    getArchived(callback:Function) {
        var data:any = [];
        const result = this.db.query("SELECT * FROM tournaments WHERE archived = 1",(result: any) => {
            return callback(result);
        });
    }

    getTournament(id:string, callback:Function) {
        var data:any = [];
        const result = this.db.query(`SELECT * FROM tournaments WHERE id = ${id}`,(result: any) => {
            return callback(result);
        });
    }

    save(data:any, callback:Function) {
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();
        fs.writeFile('./public/assets/images/'+data.imgName, base64Img, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        data.image = 'assets/images/'+data.imgName;
        delete data.imgName;
        console.log(data);
        const result = this.db.preparedQuery(`INSERT INTO tournaments SET ?`, [data] ,(result: any) => {
            return callback(result);
        });
    }

    archive(data:any, callback:Function) {
        console.log(data);
        data = data.id;
        let id = data.id;
        delete data.id;
        data.archived = 1;
        console.log(data);
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data, 'id', id] ,(result: any) => {
            return callback(result);
        });
    }

}