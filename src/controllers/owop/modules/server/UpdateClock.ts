import { server } from "../../server";
import { protocol } from "./protocol";

export class UpdateClock {

    interval: number;
    updates: {};

    constructor() {
        this.interval = Math.floor(1000 / 60);
        this.updates = {}
        this.updateClock();
    }

    updateClock() {
        // var pinfo_t_SIZE = 4 + 4 + 1 + 1 + 1 + 1 + 32;
        var pinfo_t_SIZE = 4 + 4 + 1 + 1 + 1 + 1;
        var pixupd_t_SIZE = 4 + 4 + 4 + 1 + 1 + 1;

        for (var i in this.updates) {
            var plupdates = this.updates[i][0];
            var pxupdates = this.updates[i][1];
            var plleft = this.updates[i][2];

            // let nickLengths = plupdates.map(x => x.nick?.length ?? 0).reduce((a, b) => a + b, 0);
            // console.log(plupdates.map(x => x.nick?.length));
            var updSize = (1 + 1 + plupdates.length * (4 + pinfo_t_SIZE) +
                2 + pxupdates.length * pixupd_t_SIZE +
                1 + 4 * plleft.length);

            //updSize += 2;

            var upd = new Uint8Array(updSize);

            upd[0] = protocol.server.worldUpdate;

            var upd_dv = new DataView(upd.buffer);

            var offs = 2;

            var tmp = 0;
            // var enc = new TextEncoder();
            for (var u = 0; u < plupdates.length; u++) {
                var client = plupdates[u];

                upd_dv.setUint32(offs, client.id, true);
                offs += 4;

                upd_dv.setInt32(offs + 0, client.x, true);
                upd_dv.setInt32(offs + 4, client.y, true);
                upd_dv.setUint8(offs + 4 + 4, client.r);
                upd_dv.setUint8(offs + 4 + 4 + 1, client.g);
                upd_dv.setUint8(offs + 4 + 4 + 1 + 1, client.b);
                upd_dv.setUint8(offs + 4 + 4 + 1 + 1 + 1, client.tool);
                // let nick = client.nick ?? "";
                // let encodedNick = enc.encode(nick.padEnd(32, " "));
                // for (let index = 0; index < encodedNick.length; index++) {
                //     upd_dv.setUint8(offs + 4 + 4 + 1 + 1 + 1 + 1 + index, encodedNick[index]);
                // }
                offs += pinfo_t_SIZE;
                tmp++;
            }

            upd[1] = tmp;

            upd_dv.setUint16(offs, pxupdates.length, true);

            offs += 2;

            for (var u = 0; u < pxupdates.length; u++) {
                var client = pxupdates[u];

                upd_dv.setInt32(offs, u, true);
                upd_dv.setInt32(offs + 4, client.x, true);
                upd_dv.setInt32(offs + 4 + 4, client.y, true);
                upd_dv.setUint8(offs + 4 + 4 + 4, client.r);
                upd_dv.setUint8(offs + 4 + 4 + 4 + 1, client.g);
                upd_dv.setUint8(offs + 4 + 4 + 4 + 1 + 1, client.b);

                offs += pixupd_t_SIZE;
            }
            upd_dv.setUint8(offs, plleft.length); //upd_dv.setUint16(offs, plleft.length, true);

            offs += 1;

            for (var u = 0; u < plleft.length; u++) {
                var id = plleft[u]; // this is a number
                upd_dv.setUint32(offs, id, true);
                offs += 4;
            }

            delete this.updates[i];

            var wld = server.worlds.find(function (world) { return world.name == i }.bind(this));
            if (!wld) continue; // Shouldn't happen

            var clients = wld.clients;

            for (var c = 0; c < clients.length; c++) {
                var client = clients[c];
                var send = client.send;
                send(upd)
            }
        }
        setTimeout(function () { this.updateClock() }.bind(this), this.interval);
    }

    getUpdObj(world) {
        world = world.toLowerCase();
        if (!this.updates[world]) {
            this.updates[world] = [
                [],
                [],
                []
            ];
        }
        return this.updates[world]
    }

    doUpdatePlayerPos(world, client) {
        var upd = this.getUpdObj(world)[0];
        upd.push(client)
    }

    doUpdatePlayerDiscordInfo(world, client, newClient = null) {
        // Find world by name
        // var world = server.worlds.find((x) => x.name == world);
        var enc = new TextEncoder();

        var clientIdSize = 4;
        var clientNickSize = 32;
        var clientDiscordIdSize = 18;

        let clients = world.clients;
        if (newClient && client.id != newClient.id) {
            clients = clients.filter(cli => cli.id == newClient.id);
        }

        var updateSize = 1 + 1 + clients.length * (clientIdSize + clientNickSize + clientDiscordIdSize);

        var update = new Uint8Array(updateSize);
        update[0] = protocol.server.discordInfoUpdate;

        var updateDataView = new DataView(update.buffer);
        var offset = 2;
        var tmp = 0;
        for (var u = 0; u < clients.length; u++) {
            var cli = clients[u];

            updateDataView.setUint32(offset, cli.id, true);
            offset += clientIdSize;

            let nick = cli.nick ?? "";
            let encodedNick = enc.encode(nick.padEnd(clientNickSize, " "));
            for (let index = 0; index < encodedNick.length; index++) {
                updateDataView.setUint8(offset + index, encodedNick[index]);
            }

            offset += clientNickSize;

            let discordId = cli.discordId ?? "";
            let encodedDiscordId = enc.encode(discordId.padEnd(clientDiscordIdSize, " "));
            for (let index = 0; index < encodedDiscordId.length; index++) {
                updateDataView.setUint8(offset + index, encodedDiscordId[index]);
            }

            offset += clientDiscordIdSize;

            tmp++;
        }

        update[1] = tmp;
        client.send(update);
    }

    doUpdatePixel(world, pixelData) {
        var upd = this.getUpdObj(world)[1];
        upd.push(pixelData)
    }

    doUpdatePlayerLeave(world, id) {
        var upd = this.getUpdObj(world)[2];
        upd.push(id)
    }
}
// module.exports = UpdateClock
