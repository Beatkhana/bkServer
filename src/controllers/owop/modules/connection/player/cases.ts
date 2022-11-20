import { server } from "../../../server";
import { protocol } from "../../server/protocol";
import { getTile } from "../world/getTile";
import { permissions } from "./permissions";

// const protocol = require('../../server/protocol.js');
// const getTile = require('../world/getTile');
// const compress_data_to = require("../world/compressData.js")
// const permissions = require("./permissions.js")
export class Case {
    message: any;
    client: any;
    world: any;
    data: Uint8Array;
    dv: DataView;
    len: any;
    constructor(message, client, world) {
        this.message = message
        this.client = client
        this.world = world
        this.data = new Uint8Array(this.message)
        this.dv = new DataView(this.data.buffer)
        this.len = this.message.length;
        this.case()
    }
    case() {
        switch (this.len) {
            case protocol.client.rankVerification:
                var clientRank = this.dv.getUint8(0);
                if (clientRank > this.client.rank) {
                    this.client.send("Do not cheat!")
                    this.client.ws.close()
                }
                break;
            case protocol.client.requestChunk: //loading chunks
                var x = this.dv.getInt32(0, true);
                var y = this.dv.getInt32(4, true);
                server.events.emit("requestChunk", this.client, x, y)
                var tile = getTile(this.world.name, x, y);
                this.client.send(tile);
                break;
            case protocol.client.protectChunk:
                if (this.client.rank >= permissions.mod) {
                    var tileX = this.dv.getInt32(0, true);
                    var tileY = this.dv.getInt32(4, true);
                    var tile_protect = !!this.dv.getUint8(8);
                    server.events.emit("protectChunk", this.client, tileX, tileY, tile_protect)

                    server.manager.set_chunk_protection(this.world.name, tileX, tileY, tile_protect);
                    var newState = new Uint8Array(10)
                    var newState_dv = new DataView(newState.buffer);
                    newState_dv.setUint8(0, protocol.server.chunkProtected);
                    newState_dv.setInt32(1, tileX, true);
                    newState_dv.setInt32(5, tileY, true);
                    newState_dv.setUint8(9, +tile_protect);

                    server.players.sendToWorld(this.world.name, newState)
                } else {
                    this.client.ws.close()
                }
                break;
            case protocol.client.setPixel:
                if (!this.client.pixelBucket.canSpend(1)) return;
                var x = this.dv.getInt32(0, true);
                var y = this.dv.getInt32(4, true);
                var r = this.dv.getUint8(8);
                var g = this.dv.getUint8(9);
                var b = this.dv.getUint8(10);

                var tileX = Math.floor(x / 16);
                var tileY = Math.floor(y / 16);
                var pixX = x - Math.floor(x / 16) * 16;
                var pixY = y - Math.floor(y / 16) * 16;

                var distx = Math.trunc(x / 16) - Math.trunc(this.client.x_pos / (16 * 16));
                distx *= distx;
                var disty = Math.trunc(y / 16) - Math.trunc(this.client.y_pos / (16 * 16));
                disty *= disty;
                var dist = Math.sqrt(distx + disty);
                if (dist < 3 || this.client.rank == permissions.admin) {
                    if (server.manager.chunk_is_protected(this.client.world, tileX, tileY) && this.client.rank < permissions.mod) return;
                    server.events.emit("setPixel", this.client, x, y, [r, g, b])
                    server.updateClock.doUpdatePixel(this.world.name, {
                        x,
                        y,
                        r,
                        g,
                        b
                    })
                    server.manager.set_pixel(this.world.name, tileX, tileY, pixX, pixY, r, g, b)
                }
                break;
            case protocol.client.playerUpdate:
                var x = this.dv.getInt32(0, true);
                var y = this.dv.getInt32(4, true);
                var r = this.dv.getUint8(8);
                var g = this.dv.getUint8(9);
                var b = this.dv.getUint8(10);
                var tool = this.dv.getUint8(11);
                server.events.emit("playerUpdate", this.client, x, y, [r, g, b], tool)

                this.client.x_pos = x;
                this.client.y_pos = y;
                this.client.col_r = r;
                this.client.col_g = g;
                this.client.col_b = b;
                this.client.tool = tool;
                server.updateClock.doUpdatePlayerPos(this.world.name, {
                    id: this.client.id,
                    x,
                    y,
                    r,
                    g,
                    b,
                    tool
                })
                break;
            case protocol.client.clearChunk:
                if (this.client.rank >= permissions.mod) {
                    var x = this.dv.getInt32(0, true);
                    var y = this.dv.getInt32(4, true);
                    var r = this.dv.getUint8(8);
                    var g = this.dv.getUint8(9);
                    var b = this.dv.getUint8(10);

                    server.events.emit("clearChunk", this.client, x, y, [r, g, b])

                    var newData = new Uint8Array(16 * 16 * 3);
                    for (var i = 0; i < 16 * 16 * 3;) {
                        newData[i++] = r
                        newData[i++] = g
                        newData[i++] = b
                    }
                    server.manager.set_chunk_rgb(this.world.name, x, y, newData);
                    var newTileUpdated = getTile(this.world.name, x, y);

                    server.players.sendToWorld(this.world.name, newTileUpdated)
                } else {
                    this.client.ws.close();
                }
                break;
            case protocol.client.paste:
                if (this.client.rank >= permissions.admin) {
                    var x = this.dv.getInt32(0, true);
                    var y = this.dv.getInt32(4, true);
                    var offset = 8;
                    var newData = new Uint8Array(16 * 16 * 3);
                    for (var i = 0; i < 16 * 16 * 3; i++) {
                        newData[i] = this.dv.getUint8(i + offset);
                    }
                    server.events.emit("paste", this.client, x, y, newData)
                    server.manager.set_chunk_rgb(this.world.name, x, y, newData)

                    var newTileUpdated = getTile(this.world.name, x, y);
                    server.players.sendToWorld(this.world.name, newTileUpdated)
                } else {
                    this.client.ws.close();
                }
                break;
        }
    }
}

// module.exports = Case
