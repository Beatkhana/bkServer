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

        const result = this.db.query("SELECT * FROM tournaments", (result: any) => {
            return callback(result);
        });
    }

    getActive(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT * FROM tournaments WHERE archived = 0", (result: any) => {
            return callback(result);
        });
    }

    getArchived(callback: Function) {
        var data: any = [];
        const result = this.db.query("SELECT * FROM tournaments WHERE archived = 1", (result: any) => {
            return callback(result);
        });
    }

    getTournament(id: string, callback: Function) {
        var data: any = [];
        const result = this.db.query(`SELECT * FROM tournaments WHERE id = ${id}`, (result: any) => {
            return callback(result);
        });
    }

    save(data: any, callback: Function) {
        let base64String = data.image;
        let base64Img = base64String.split(';base64,').pop();
        // fs.writeFile('./public/assets/images/' + data.imgName, base64Img, { encoding: 'base64' }, function (err) {
        //     console.log('File created');
        // });
        // console.log(data);

        let imgName = data.imgName;
        imgName = imgName.substring(0, imgName.indexOf('.')) + '.webp';

        // jimp
        const buf = Buffer.from(base64Img, 'base64');
        sharp(buf)
            .resize({ width: 550 })
            // .webp({ lossless: true })
            .toFile('./public/assets/images/' + imgName)
            .catch(err => { console.log(err) });

        // jimp.read(buf, (err, image) => {
        //     if (err) throw err;
        //     else {
        //         if(image.bitmap.width > 550) {
        //             image.resize(550,jimp.AUTO)
        //             .quality(100)
        //             .write('./public/assets/images/' + imgName);
        //         }else {
        //             image.write('./public/assets/images/' + imgName);
        //         }
        //         console.log(imgName);
        //     }
        // });


        data.image = 'assets/images/' + imgName;
        delete data.imgName;
        console.log(data);

        const result = this.db.preparedQuery(`INSERT INTO tournaments SET ?`, [data], (result: any) => {
            return callback(result);
        });
    }

    archive(data: any, callback: Function) {
        console.log(data);
        data = data.id;
        let id = data.id;
        delete data.id;
        data.archived = 1;
        console.log(data);
        const result = this.db.preparedQuery(`UPDATE tournaments SET ? WHERE ?? = ?`, [data, 'id', id], (result: any) => {
            return callback(result);
        });
    }

}