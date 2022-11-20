import { protocol } from '../../server/protocol';
import { Bucket } from './Bucket';
import { permissions } from './permissions';
var config = require("../../../config");

export class Client {

    ws: any;
    req: any;
    x_pos: number;
    y_pos: number;
    col_r: number;
    col_g: number;
    col_b: number;
    tool: number;
    id: number;
    discordId: string;
    nick: string;
    before: string;
    send: (data: any) => void;
    stealth: boolean;
    rank: number;
    ip: any;
    world: string;
    pixelBucket: any;
    chatBucket: any;
    x: any;
    y: any;

    constructor(ws, req) {
        this.ws = ws;
        this.req = req;
        this.x_pos = 0;
        this.y_pos = 0;
        this.col_r = 0;
        this.col_g = 0;
        this.col_b = 0;
        this.tool = 0;
        this.id = 0;
        this.discordId = "";
        this.nick = "";
        if (req.session?.user?.length > 0) {
            this.nick = req.session.user[0].name;
            this.discordId = req.session.user[0].discordId;
        }
        this.before = "";
        this.send = function (data) {
            try {
                ws.send(data);
            } catch (e) { };
        }
        this.stealth = false;
        this.rank = 0;
        this.ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(",")[0].replace('::ffff:', '');
        this.world = "";
        this.pixelBucket = new Bucket(0, 0);
        this.chatBucket = new Bucket(0, 0);
    }
    setPixelBucket(rate, per) {
        this.pixelBucket = new Bucket(rate, per);
        var quota = new Uint8Array(5)
        var quota_dv = new DataView(quota.buffer);
        quota_dv.setUint8(0, protocol.server.setPQuota);
        quota_dv.setUint16(1, rate, true);
        quota_dv.setUint16(3, per, true);
        this.send(quota);
    }
    setChatBucket(rate, per) {
        this.chatBucket = new Bucket(rate, per)
    }
    setRank(rank) {
        if (rank > 3) rank = 3
        if (rank < 0) rank = 0
        this.send(new Uint8Array([protocol.server.setRank, rank]))
        this.rank = rank
        let rankName;
        for (var i in permissions) {
            if (permissions[i] == rank) {
                rankName = i
            }
        }

        var pixelBucket = config.bucket.pixel[rankName]
        var chatBucket = config.bucket.chat[rankName]
        this.setPixelBucket(pixelBucket[0], pixelBucket[1])
        this.setChatBucket(chatBucket[0], chatBucket[1])
    }
    setId(id: Uint8Array) {
        this.id = +id;
        var id = new Uint8Array(5);
        var id_dv = new DataView(id.buffer);
        id_dv.setUint8(0, protocol.server.setId);
        id_dv.setUint32(1, this.id, true);
        this.send(id);
    }
    teleport(x, y) {
        this.x = x;
        this.y = y;
        let tp = new Uint8Array(9);
        let tp_dv = new DataView(tp.buffer);
        tp_dv.setUint8(0, protocol.server.teleport);
        tp_dv.setUint32(1, x, true);
        tp_dv.setUint32(5, y, true);
        this.send(tp);
    }
};

// module.exports = Client;
