import { server } from "../server";

import { Client } from './connection/player/Client';
import { permissions } from "./connection/player/permissions";
import { WorldTemplate } from "./connection/world/worldTemplate";
import { Captcha } from "./connection/captcha/Captcha";
import { Commands } from "./connection/commands/Commands";
import { Case } from "./connection/player/cases";

export class Connection {
    ws: any;
    req: any;
    world: any;
    client: any;
    player: boolean;
    captcha: any;
    constructor(ws, req) {
        this.ws = ws;
        this.req = req;
        this.world = null;
        this.client = new Client(ws, req);
        this.player = false
        this.captcha = new Captcha(this.client, server.worlds);

        ws.on("message", this.onMessage.bind(this));
        ws.on("close", this.onClose.bind(this));
        ws.on("error", this.onError.bind(this));

        this.captcha.show()
    }
    onMessage(message) {
        var data = new Uint8Array(message)
        var dv = new DataView(data.buffer)
        var len = message.length;
        var isBinary = (typeof message == "object");
        if (this.player && isBinary && this.captcha.state == "ok") {
            //cases
            new Case(message, this.client, this.world)
        } else if (this.player && !isBinary && this.captcha.state == "ok") {
            if (!this.client.chatBucket.canSpend(1)) return;
            if (len > 1 && message[len - 1] == String.fromCharCode(10)) {
                var chat = message.slice(0, len - 1).trim();

                console.log(`World name: ${this.client.world} id/nick: ${before} ip: ${this.client.ip} message: ${chat}`);
                if (chat.length <= 512 || this.client.rank > permissions.user) {
                    if (chat[0] == "/") {
                        new Commands(chat, this.client, this.world)
                    } else {
                        if (this.client.rank < permissions.mod) {
                            var string = chat.split("\n").slice(0, 3).join("\n"); //weirdo way
                            string += chat.split("\n").slice(3).join("")
                            chat = string;
                        }
                        var tmpIsStaff = this.client.rank > permissions.user
                        var tmpIsMod = this.client.rank == permissions.mod
                        var tmpIsAdmin = this.client.rank == permissions.admin
                        var before = "";
                        if (this.client.stealth) {
                            tmpIsAdmin = false;
                            tmpIsMod = false;
                            tmpIsStaff = false;
                        }
                        if (tmpIsAdmin) before += "(A) ";
                        if (tmpIsMod) before += "(M) ";
                        if (this.client.nick && !tmpIsStaff) {
                            before += `[${this.client.id}] ${this.client.nick}`;
                        } else if (this.client.nick && tmpIsStaff) {
                            before += this.client.nick;
                        }
                        if (!this.client.nick) {
                            before += this.client.id;
                        }
                        this.client.before = before

                        server.players.sendToWorld(this.client.world, before + ": " + chat);
                        server.events.emit("chat", this.client, chat)
                    }
                }
            }
        } else if (!this.player && isBinary && this.captcha.state == "ok") {

            //player on real connect
            if (len > 2 && len - 2 <= 24 /*&& dv.getUint16(len - 2, true) == 1234 //world verification*/) {
                for (var i = 0; i < data.length - 2; i++) {
                    this.client.world += String.fromCharCode(data[i]);
                }
                this.client.world = this.client.world.replace(/[^a-zA-Z0-9\._]/gm, "").toLowerCase();
                if (!this.client.world) this.client.world = "main";
                this.world = server.worlds.find(function (world) {
                    return world.name == this.client.world
                }.bind(this));
                if (!this.world) {
                    server.manager.world_init(this.client.world)
                    this.world = new WorldTemplate(this.client.world);
                    server.worlds.push(this.world)
                    server.events.emit("newWorld", this.world)
                }

                this.client.setRank(permissions.none);

                if (this.req.session.user?.length > 0) {
                    // bk role ids
                    // 1: Site Admin
                    // 2: Site Staff
                    // 7: Owop Admin
                    // 8: Owop Mod
                    if (this.req.session?.user[0].roleIds.includes("1") || this.req.session?.user[0].roleIds.includes("7")) {
                        this.client.setRank(permissions.admin);
                    } else if (this.req.session?.user[0].roleIds.includes("2") || this.req.session?.user[0].roleIds.includes("8")) {
                        this.client.setRank(permissions.mod);
                    } else {
                        this.client.setRank(permissions.user);
                    }
                }
                // var pass = server.manager.get_prop(this.world.name, "pass");
                // if (pass) {
                //     this.client.send("[Server] This world has a password set. Use '/pass PASSWORD' to unlock drawing.")
                //     this.client.setRank(permissions.none)
                // }
                var motd = server.manager.get_prop(this.world.name, "motd")
                if (motd) {
                    this.client.send(motd)
                }

                this.client.setId(this.world.latestId)
                this.world.latestId++
                this.player = true;
                this.world.clients.push(this.client);

                server.events.emit("join", this.client)

                // send client list to that client
                server.updateClock.doUpdatePlayerPos(this.world.name, {
                    id: this.client.id,
                    x: 0,
                    y: 0,
                    r: 0,
                    g: 0,
                    b: 0,
                    tool: 0
                });

                for (var w in this.world.clients) {
                    var cli = this.world.clients[w];
                    var upd = {
                        id: cli.id,
                        x: cli.x_pos,
                        y: cli.y_pos,
                        r: cli.col_r,
                        g: cli.col_g,
                        b: cli.col_b,
                        tool: cli.tool
                    };

                    server.updateClock.doUpdatePlayerDiscordInfo(this.world, cli, this.client);
                    server.updateClock.doUpdatePlayerPos(this.world.name, upd);
                }
            }

        } else if (!this.player && !isBinary && this.captcha.state == "waiting") {
            this.captcha.onToken(message)
        }
    }
    onClose() {
        if (!this.world) return;
        if (!this.client) return;
        server.events.emit("leave", this.client)
        var worldIndex = server.worlds.indexOf(this.world);
        var clIdx = this.world.clients.indexOf(this.client);
        if (clIdx > -1) {
            server.updateClock.doUpdatePlayerLeave(this.world.name, this.client.id)
            delete this.world.clients[clIdx]
            this.world.clients.sort().pop()
        }
        if (!this.world.clients.length) {
            server.manager.world_unload(this.world.name);
            delete server.worlds[worldIndex]
            server.worlds.sort().pop()
        }
    }
    onError(error) {
        console.log(error);
    }
}
// module.exports = Connection
