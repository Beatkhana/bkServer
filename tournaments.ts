import { database } from './database';
import mysql from 'mysql';
import fs from 'fs';
// import jimp from 'jimp';
import sharp from 'sharp';



export class tournaments {
    db = new database();

    constructor() {
        // setInterval(function () {
        //     this.db.query('SELECT 1');
        // }, 5000);
    }

    getAll(callback: Function) {
        var data: any = [];

        const result = this.db.query("SELECT * FROM tournaments", (err, result: any) => {
            return callback(result);
        });
    }

    getActive(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT * FROM tournaments WHERE archived = 0", (err, result: any) => {
            return callback(result);
        });
    }

    getArchived(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT * FROM tournaments WHERE archived = 1", (err, result: any) => {
            return callback(result);
        });
    }

    getTournament(id: string, callback: Function) {
        var data: any = [];
        const result = this.db.query(`SELECT * FROM tournaments WHERE id = ${id}`, (err, result: any) => {
            return callback(result);
        });
    }

    save(data: any, callback: Function) {
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();

        let imgName = data.imgName;
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';

        // jimp
        const buf = Buffer.from(base64Img, 'base64');
        sharp(buf)
            .resize({ width: 550 })
            .toFile('./public/assets/images/' + imgName)
            .catch(err => { console.log(err) });


        data.image = 'assets/images/' + imgName;
        delete data.imgName;
        console.log(data);

        const result = this.db.preparedQuery(`INSERT INTO tournaments SET ?`, [data], (err, result: any) => {
            return callback(result);
        });
    }

    delete(id:number, callback: Function) {
        const result = this.db.preparedQuery(`DELETE FROM tournaments WHERE id = ?`, [id], (err, result: any) => {
            if (err) return callback({'error': err});
            return callback({'message': "success"});
        });
    }

    update (data: any, callback: Function) {
        // console.log(data);
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', data.id], (err, result: any) => {
            if (err) return callback({'error': err});
            return callback(result);
        });
    }

    archive(data: any, callback: Function) {
        // console.log(data);
        let id = data.tournament.id;
        delete data.tournament.id;
        data.tournament.archived = 1;
        // console.log(data);
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data.tournament, 'id', id], (err, result: any) => {
            return callback(result);
        });
    }

    isOwner(userId, tournamentId, callback: Function) {
        const result = this.db.query(`SELECT CAST(owner AS CHAR) as owner FROM tournaments WHERE id = ${tournamentId}`, (err, result: any) => {
            if(result[0].owner == userId) {
                return callback(true);
            } else {
                return callback(false);
            }
        });
    }

}