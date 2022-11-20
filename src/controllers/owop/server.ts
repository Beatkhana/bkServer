// require("./client.js")
import * as WebSocket from 'ws';

let wss;
let bkSession = {
    sessionParser: undefined
};

let devMode = false;
let testUser = null;

try {
    let bkWS = require("../event.controller");
    wss = bkWS.owopWS;

    bkSession = require("../session");
} catch (error) {
    wss = new WebSocket.Server({ port: 9000 });
    bkSession.sessionParser = (req, res, callback) => {
        callback();
    }
    beginServer();
    devMode = true;
    testUser = [
        {
            roleIds: [
                "1",
                "2",
                "3"
            ],
            discordId: "250204546943418368",
            ssId: null,
            name: "Dannypoke03",
            twitchName: "dannypoke03",
            avatar: "a_d220cf5d7955815446c626c74fe5cbb5",
            globalRank: 0,
            localRank: 0,
            country: "",
            tourneyRank: 0,
            TR: 0,
            pronoun: "He/Him",
            roleNames: [
                "Admin",
                "Map Pool",
                "Staff"
            ]
        }
    ]
}

import * as fs from 'fs';

import { Connection } from './modules/Connection';
import { UpdateClock } from "./modules/server/UpdateClock";
import * as manager from "./modules/server/manager";
var bansIgnore = false;

// var wss;
var config = require("./config.json");
var terminatedSocketServer = false;
import { ConfigManager } from "./modules/server/ConfigManager";
import { BansManager } from "./modules/server/BansManager";
import { DiscordBansManager } from "./modules/server/DiscordBansManager";
let proxy_check = require('proxycheck-node.js');
import { EventEmitter } from "events";


export const server = {
    chalk: require("chalk"),
    worlds: [],
    bans: require("./bans.json"),
    discordBans: require("./discord_bans.json"),
    config,
    updateClock: new UpdateClock(),
    manager,
    events: new EventEmitter(),
    loadedScripts: [],
    disabledScripts: [],
    ConfigManager,
    bansManager: new BansManager(),
    discordBansManager: new DiscordBansManager(),
    players: require("./modules/connection/player/players"),
    antiProxy: new proxy_check({
        api_key: config.antiProxy.key
    })
};

server.events.on("savedWorlds", function () {
    console.log("Saved Worlds")
    server.players.sendToAll("DEVSaved Worlds", 3) //3 means rank (admin)
})

function loadScripts() {
    fs.readdirSync(__dirname + "/scripts").forEach(file => {
        if (!file.startsWith("-") && file.endsWith(".js")) {
            let script = require(__dirname + "/scripts" + file);
            if (typeof script.name == "string" && typeof script.version == "string" && typeof script.install == "function") {
                script.install()
                console.log(server.chalk.green(`Loaded script ${script.name} version ${script.version}`))
                server.loadedScripts.push(file)
            } else {
                console.error(server.chalk.red(`Script ${file} doesn't follow syntax!`))
                server.disabledScripts.push(file)
            }
        }
    });
}
loadScripts()


function createWSServer() {
    // wss = new ws.Server({
    //     port: config.port
    // });
    wss.on("connection", async function (ws, req) {
        await bkSession.sessionParser(req, {}, async () => {
            if (devMode) {
                req.session = {
                    user: testUser
                }
            }
            if (terminatedSocketServer) {
                ws.send(config.closeMsg)
                ws.close();
            }
            let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(",")[0].replace('::ffff:', '');

            if (server.bansManager.checkIfIsBanned(ip)) {
                let ban = server.bansManager.bans[ip]
                if (!isNaN(ban.duration)) {
                    let banString = server.bansManager.generateString(server.bansManager.banEndsAfter(ip))
                    ws.send(`${server.config.messages.unbanMessage}\nYou are banned for ${banString}\nReason: ${ban.reason}`);
                } else {
                    ws.send(`${server.config.messages.unbanMessage}\nYou are permanently banned!\nReason: ${ban.reason}`);
                }
                ws.close();
                return;
            }

            if (server.discordBansManager.checkIfIsBanned(req.session?.user?.discordId ?? '')) {
                let ban = server.discordBansManager.bans[req.session?.user?.discordId ?? '']
                if (!isNaN(ban.duration)) {
                    let banString = server.bansManager.generateString(server.bansManager.banEndsAfter(req.session.user.discordId ?? ''))
                    ws.send(`${server.config.messages.unbanMessage}\nYou are banned for ${banString}\nReason: ${ban.reason}`);
                } else {
                    ws.send(`${server.config.messages.unbanMessage}\nYou are permanently banned!\nReason: ${ban.reason}`);
                }
                ws.close();
                return;
            }

            if (server.config.maxConnections > 0) {
                if (server.players.getAllPlayers().length >= server.config.maxConnections) { //yes ik about that if there is many players this is slow method... or not?
                    ws.send("Reached max connections limit")
                    ws.close();
                    return;
                }
            }
            if (server.config.maxConnectionsPerIp > 0) {
                if (server.players.getAllPlayersWithIp(ip).length >= server.config.maxConnectionsPerIp) { //its equal cuz this client isn't in any world
                    ws.send("Reached max connections per ip limit")
                    ws.close();
                    return;
                }
            }
            if (config.antiProxy.enabled) {
                let result = await server.antiProxy.check(ip, {
                    vpn: server.config.antiProxy.vpnCheck,
                    limit: server.config.antiProxy.limit
                });
                if (result.status == "denied" && result.message[0] == "1") {
                    console.log(server.chalk.red("Check your dashboard the queries limit reached!"))
                }
                if (result.error || !result[ip]) return;
                if (result[ip].proxy == "yes") {
                    ws.close()
                    server.bansManager.addBanIp(ip, "Proxy!", 0)
                }
            }

            new Connection(ws, req);
        });
    });
}

export function beginServer() {
    createWSServer()
    console.log("Server started. Type /help for help")
}

var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
//server controler
// if (process.platform === "win32") {
//     rl.on("SIGINT", function () {
//         return process.emit("SIGINT");
//     });
// }
async function exit() {
    console.log("Exiting...");
    for (var w in server.worlds) {
        var world = server.worlds[w];
        for (var c = 0; c < world.clients.length; c++) {
            var client = world.clients[c];
            client.send(config.messages.closeMsg);
        }
    }
    await server.manager.close_database()
    process.exit()
}
process.on("SIGINT", exit)
process.on("beforeExit", exit);

var serverOpNick = "All Seeing Overlord";
var serverOpRank = 3;

rl.on("line", function (d) {
    var msg = d.toString().trim();
    if (terminatedSocketServer) return;
    if (msg.startsWith("/")) {
        var cmdCheck = msg.slice(1).split(" ");
        cmdCheck[0] = cmdCheck[0].toLowerCase();
        var argString = cmdCheck.slice(1).join(" ").trim();
        cmdCheck.filter(x => x);
        if (cmdCheck[0] == "help") {
            console.log("/help - Lists all commands.");
            console.log("/stop, /kill - Closes the server.");
            console.log("/js, /eval <code> - Evaluates the given code.");
            console.log("/nick <nick> - Changes your nick.");
            console.log("/rank <user|moderator|admin|server|tell|discord> - Changes your rank. (Only affects messages.)");
        } else if (cmdCheck[0] == "kill" || cmdCheck[0] == "stop") {
            exit()
        } else if (cmdCheck[0] == "eval" || cmdCheck[0] == "js") {
            try {
                console.log(String(eval(argString)));
            } catch (e) {
                console.log(e);
            }
        } else if (cmdCheck[0] == "nick") {
            serverOpNick = argString;
            if (argString) {
                console.log("Nickname set to: '" + argString + "'");
            } else {
                console.log("Nickname reset.");
            }
        } else if (cmdCheck[0] == "rank") {
            var rankIndex = ["user", "moderator", "admin", "server", "tell", "discord"].indexOf(cmdCheck[1].toLowerCase())
            if (~rankIndex) {
                serverOpRank = rankIndex;
                console.log("Set rank to " + cmdCheck[1].toLowerCase() + ".");
            } else {
                console.log("Usage: /rank <user|moderator|admin|server|tell|discord>")
            }
        }
    } else {
        let sendToWorlds = (msg) => {
            for (var gw in server.worlds) {
                var worldCurrent = server.worlds[gw];
                var clientsOfWorld = worldCurrent.clients;
                for (var s = 0; s < clientsOfWorld.length; s++) {
                    var sendToClient = clientsOfWorld[s].send;
                    sendToClient(msg);
                }
            }
        }
        sendToWorlds((serverOpNick && ["[0] ", "", " ", "[Server] "][serverOpRank] || ["", "(M) ", "(A) ", "Server", "-> ", "[D] "][serverOpRank]).trimLeft() + (serverOpNick || (serverOpRank == 3 ? "" : "0")) + ": " + msg);
    }
});
// beginServer();
