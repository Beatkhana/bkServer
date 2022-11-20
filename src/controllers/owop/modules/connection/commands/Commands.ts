import { server } from "../../../server";
import { permissions } from "../player/permissions";

var config = require("../../../config");
const commandsPermissions = require("./commandPermissions.json");

export class Commands {

    world: any;
    command: any;
    args: any;
    client: any;

    constructor(chat, client, world) {
        chat = chat.substr(1);
        this.world = world
        this.command = chat.split(" ")[0].toLowerCase();
        this.args = chat.split(" ");
        this.args.shift();
        this.client = client;
        server.events.emit("command", this.client, this.command, this.args)
        if (typeof this[this.command] == "function" && this.command != "sendTo") {
            if (commandsPermissions[this.command] <= this.client.rank) {
                this[this.command]();
            }
            /* else {
                              this.client.send("You can't use this command!")
                          }*/
        }
        /* else if (typeof this[this.command] == "undefined") {
                    this.client.send("Command not recognized")
                }*/
    }
    adminlogin() {
        var password = this.args.join(" ");
        if (password == config.adminlogin) {
            this.client.setRank(permissions.admin)
            this.client.send("Server: You are now an admin. Do /help for a list of commands.")
        } else {
            this.client.send("Wrong password.")
        }
    }
    modlogin() {
        var password = this.args.join(" ");
        if (password == config.modlogin) {
            this.client.setRank(permissions.mod)
            this.client.send("Server: You are now an moderator. Do /help for a list of commands.")
        } else {
            this.client.send("Wrong password.")
        }
    }
    nick() {
        var newNick = this.args.join(" ");
        if (this.client.rank < permissions.admin) {
            newNick = newNick.replace(/\n/gm, "")
        }
        if (newNick.length == 0) {
            this.client.nick = "";
            this.client.send("Nickname reset.");
            return;
        }
        if (newNick.length <= config.maxNickLength || this.client.rank > permissions.user) {
            this.client.nick = newNick;
            this.client.send(`Nickname set to: "${newNick}"`);
        } else {
            this.client.send(`Nickname too long! (Max: "${config.maxNickLength}")`); //wat are you doing
        }
    }
    setprop() {
        var property = this.args[0];
        var value = this.args;
        value.shift()
        value = value.join(" ").trim()
        if (property && value) {
            server.manager.set_prop(this.world.name, property, value)
            server.players.sendToAll(`DEVSet world property ${property} to ${value}`, permissions.admin)
        } else if (property && !value) {
            this.client.send(`Value of ${property} is ${server.manager.get_prop(this.world.name, property, "undefined")}`)
        } else if (!property) {
            this.client.send("Usage:\n /setprop [property] [value]\n or /setprop [property] to get value")
        }
    }
    sayraw() {
        var message = this.args.join(" ");
        if (message) {
            server.players.sendToAll(message);
        } else {
            this.client.send("Usage:\n /sayraw [message]")
        }
    }
    broadcast() {
        var message = this.args.join(" ");
        if (message) {
            server.players.sendToAll(`<span style='color: #ffff00'>[GLOBAL]</span> ${message}`)
        } else {
            this.client.send("Usage:\n /broadcast [message]")
        }
    }
    stealth() {
        if (!this.client.stealth) {
            this.client.stealth = true;
            this.client.send("Stealth mode enabled");
        } else {
            this.client.stealth = false;
            this.client.send("Stealth mode disabled");
        }
    }
    setrank() {
        var id = parseInt(this.args[0]);
        var target = this.world.clients.find(function (client) {
            return client.id == id
        });
        var rank = parseInt(this.args[1]);

        if (isNaN(rank)) {
            this.client.send("Usage:\n /setrank [target id] [new rank from 0 to 3]")
        } else if (!target) {
            this.client.send(`Cannot find client with id ${id}`)
        } else if (target.rank >= this.client.rank) {
            this.client.send("You cannot change the rank of players who have a higher rank than you or equal.")
        } else {
            this.client.send(`Changed rank of ${target.id} (${target.rank}) to `)
            target.setRank(rank)
        }
    }
    pass() {
        var password = this.args.join(" ");
        if (password == server.manager.get_prop(this.world.name, "pass")) {
            this.client.setRank(1);
        } else if (password == server.manager.get_prop(this.world.name, "modlogin")) {
            this.client.setRank(2);
            this.client.send("Server: You are now an moderator. Do /help for a list of commands.")
        } else {
            this.client.send("Wrong password.");
        }
    }
    tp() {
        let target

        let x, y

        let message
        switch (this.args.length) {
            case 3:
                //tp id x y
                target = this.world.clients.find(function (item) {
                    return item.id == this.args[0]
                }.bind(this))

                if (target) {
                    x = this.args[1]
                    y = this.args[2]
                    message = `Teleported player ${this.args[0]} (${target.x_pos}, ${target.y_pos}) to ${x},${y}`
                } else {
                    message = `Error! Player '${this.args[0]}' not found!`
                }
                break
            case 2:
                //tp x y
                target = this.client
                x = this.args[0]
                y = this.args[1]

                message = `Teleported to ${x} ${y}`
                break
            case 1:
                //tp id
                var destination = this.world.clients.find(function (item) {
                    return item.id == this.args[0]
                }.bind(this))

                if (destination) {
                    target = this.client
                    x = Math.floor(destination.x_pos / 16)
                    y = Math.floor(destination.y_pos / 16)
                    message = `Teleported to player ${this.args[0]} (${x},${y})`
                } else {
                    message = `Error! Player '${this.args[0]}' not found!`
                }
                break
            default:
                this.client.send("To change the position of another player: /tp id x y");
                this.client.send("To teleport to another player: /tp id");
                this.client.send("To change your location: /tp x y");
                break
        }

        if (target) {
            target.teleport(x, y)
            this.client.send(message)
        }
    }
    tpall() {
        for (let i = 0; i < this.world.clients.length; i++) {
            let client = this.world.clients[i];
            if (client.rank != commandsPermissions[this.command]) {
                client.teleport(Math.floor(this.client.x_pos / 16), Math.floor(this.client.y_pos / 16))
            }
        }
        this.client.send(`Teleported all clients to ${this.client.x_pos}, ${this.client.y_pos}`)
    }
    kick() {
        let id = parseInt(this.args[0]);
        let target = this.world.clients.find(function (item) {
            return item.id == id
        }.bind(this))
        if (target) {
            target.ws.close();
            server.players.sendToWorld(this.world.name, `DEVKicked: ${id} (${target.ip})`, commandsPermissions[this.command])
        } else if (!id) {
            this.client.send("Usage:\n /kick [id]")
        } else if (!target) {
            this.client.send(`User with id ${id} not found.`)
        }
    }
    ao() {
        var msg = this.args.join(" ");
        if (msg) {
            server.players.sendToAll(` [${this.client.world}] [${this.client.id}] ${this.client.nick}: ${msg}`, commandsPermissions[this.command])
        } else {
            this.client.send("Usage:\n /ao [message]")
        }
    }
    whois() {
        let id = parseInt(this.args[0]);
        let target = this.world.clients.find(function (item) {
            return item.id == id
        }.bind(this))
        if (target) {
            this.client.send(
                `Client informations:\n` +
                `-> id: ${target.id}\n` +
                `-> nick: ${target.nick}\n` +
                `-> ip: ${target.ip}\n` +
                `-> rank: ${target.rank}\n` +
                `-> tool: ${target.tool}\n` +
                `-> color: R ${target.col_r} G ${target.col_g} B ${target.col_b}\n` +
                `-> x, y: ${target.x_pos}, ${target.y_pos}\n` +
                `-> stealth: ${target.stealth}`
            )
        } else if (!target) {
            this.client.send(`User with id ${id} not found.`)
        } else if (!id) {
            this.client.send("Usage:\n /whois [id]")
        }
    }
    banip() { //crazy
        let ip = this.args[0];

        if (ip) {
            let duration = Math.abs(parseInt(this.args[1]));
            if (isNaN(duration)) duration = 0;
            let durationTimeUnit = this.args[2] || "seconds";
            let reason = this.args;
            reason.shift();
            reason.shift();
            reason.shift();
            reason = reason.join(" ");
            reason = reason.length ? reason : server.config.messages.defaultBanReason;
            let realDuration = duration * 1000;
            let perm = duration === 0;

            if (durationTimeUnit == "m" || durationTimeUnit == "minutes") {
                realDuration = realDuration * 60;
            } else if (durationTimeUnit == "h" || durationTimeUnit == "hours") {
                realDuration = realDuration * 60 * 60;
            } else if (durationTimeUnit == "d" || durationTimeUnit == "days") {
                realDuration = realDuration * 60 * 60 * 24;
            } else if (durationTimeUnit == "y" || durationTimeUnit == "years") {
                realDuration = realDuration * 60 * 60 * 24 * 365;
            }
            server.bansManager.addBanIp(ip, reason, realDuration);
            server.players.sendToAll(`DEVBanned ip ${ip}. Reason: ${reason}`, commandsPermissions[this.command]);
            let banString = `${server.config.messages.unbanMessage}\nYou are permanently banned!\nReason: ${reason}`;
            if (!perm) {
                let banEndsAfter = server.bansManager.generateString(server.bansManager.banEndsAfter(ip));
                banString = `${server.config.messages.unbanMessage}\nYou are banned for ${banEndsAfter}\nReason: ${reason}`
            }
            server.players.getAllPlayersWithIp(ip).forEach((client) => {
                client.send(banString);
                client.ws.close();
            });
        } else {
            this.client.send("Usage:\n /banip [ip] [duration] [timeunit] [reason]");
        }
    }
    ban() { // crazy and ugly sorry
        let needle = this.args[0];
        let target = this.world.clients.find(function (item) {
            return item.id == needle || item.discordId == needle || item.nick == needle;
        }.bind(this))

        if (target) {
            let ip = target.ip;
            let duration = Math.abs(parseInt(this.args[1]));
            if (isNaN(duration)) duration = 0;
            let durationTimeUnit = this.args[2] || "seconds";
            let reason = this.args;
            reason.shift();
            reason.shift();
            reason.shift();
            reason = reason.join(" ");
            reason = reason.length ? reason : server.config.messages.defaultBanReason;
            let realDuration = duration * 1000;
            let perm = duration === 0;

            if (durationTimeUnit == "m" || durationTimeUnit == "minutes") {
                realDuration = realDuration * 60;
            } else if (durationTimeUnit == "h" || durationTimeUnit == "hours") {
                realDuration = realDuration * 60 * 60;
            } else if (durationTimeUnit == "d" || durationTimeUnit == "days") {
                realDuration = realDuration * 60 * 60 * 24;
            } else if (durationTimeUnit == "y" || durationTimeUnit == "years") {
                realDuration = realDuration * 60 * 60 * 24 * 365;
            }
            server.bansManager.addBanIp(ip, reason, realDuration);

            var discordId = this.client.discordId;
            if (discordId) {
                server.discordBansManager.addBanDiscordId(discordId, reason, realDuration);
                server.players.sendToAll(`DEVBanned discordId ${discordId}. Reason: ${reason}`, commandsPermissions[this.command]);
            }

            server.players.sendToAll(`DEVBanned ip ${ip}. Reason: ${reason}`, commandsPermissions[this.command]);
            let banString = `${server.config.messages.unbanMessage}\nYou are permanently banned!\nReason: ${reason}`;
            if (!perm) {
                let banEndsAfter = server.bansManager.generateString(server.bansManager.banEndsAfter(ip));
                banString = `${server.config.messages.unbanMessage}\nYou are banned for ${banEndsAfter}\nReason: ${reason}`
            }
            server.players.getAllPlayersWithIp(ip).forEach((client) => {
                client.send(banString);
                client.ws.close();
            });

            if (discordId) {
                server.players.getAllPlayersWithDiscordId(discordId).forEach((client) => {
                    client.send(banString);
                    client.ws.close();
                });
            }

        } else if (!target && needle) {
            this.client.send(`User not found.`)
        } else {
            this.client.send("Usage:\n /ban [id,discordID,nickname] [duration] [timeunit] [reason]");
        }
    }
    unbanip() {
        let ip = this.args[0];
        if (ip) {
            server.bansManager.unBanIp(ip)
            server.players.sendToAll(`DEVUnBanned ip ${ip}`, commandsPermissions[this.command]);
        } else {
            this.client.send("Usage:\n /unbanip [ip]");
        }
    }
    kickip() {
        let ip = this.args[0];
        var clients = server.players.getAllPlayersWithIp(ip);
        clients.forEach(function (client) {
            client.ws.close()
        })
        server.players.sendToAll(`DEVKicked ${clients.length} clients with ip ${ip}`, commandsPermissions[this.command])
    }
    disconnect() {
        this.client.send("Disconnected");
        this.client.ws.close();
    }
    help() {
        let helpString = "Commands: "
        for (var commandName in commandsPermissions) {
            let permission = commandsPermissions[commandName];
            if (permission <= this.client.rank) {
                helpString += `${commandName}, `
            }
        }
        helpString = helpString.slice(0, helpString.length - 2)
        this.client.send(helpString)
    }
    bans() {
        var string = "Bans:\n";
        for (var i in server.bansManager.bans) {
            var ban = server.bansManager.bans[i];
            string += `${i}: ${ban.reason}`
        }
        this.client.send(string)
    }
    tellraw() {
        var id = parseInt(this.args[0]);
        var message = this.args;
        message.shift()
        message = message.join(" ")
        var target = this.world.clients.find(function (item) {
            return item.id == id
        }.bind(this))
        if (message && target) {
            target.send(message);
            this.client.send("Message sent.")
        } else if (!target && message) {
            this.client.send(`User with id ${id} not found.`)
        } else if (!id) {
            this.client.send("Usage:\n /tellraw [id] [message]")
        }
    }
    tell() {
        let id = parseInt(this.args[0])

        let msg = this.args;
        msg.shift();
        msg = msg.join(" ");

        let target = this.world.clients.find(function (target) {
            return target.id == id;
        });

        if (target && msg) {
            this.client.send(`-> You tell ${target.id}: ${msg}.`)
            target.send(`-> ${this.client.id} tells you: ${msg}.`)
        } else if (!target && msg) {
            this.client.send(`User ${id} not found.`)
        } else {
            this.client.send("Usage:\n /tell [id] [msg]")
        }
    }
    getid() {
        var nick = this.args.join(" ");
        var listOfIds = [];

        if (nick) {
            for (var i = 0; i < this.world.clients.length; i++) {
                var client = this.world.clients[i]

                if (client.nick == nick) {
                    listOfIds.push(client.id);
                }
            }
            if (listOfIds.length) {
                var ids = listOfIds.join(", ")
                this.client.send(`There is total ${listOfIds.length}.\nIds: ${ids}`)
            } else {
                this.client.send("There is no ids")
            }
        } else {
            this.client.send("Usage:\n /getId [nick]")
        }
    }
    save() {
        server.manager.updateDatabase();
    }
    doas() {

    }
}

// module.exports = Commands;
