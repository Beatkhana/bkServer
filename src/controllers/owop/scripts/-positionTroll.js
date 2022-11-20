module.exports = (() => {
    const Discord = require("discord.js");
    let name = "positionTroll"
    let version = "1.0.0"

    function install() {
        server.events.on("playerUpdate", function (client, x, y) {
            //server.updateClock(client.world, )
            let world = server.worlds.find(function (world) {
                return world.name == client.world
            });
            server.updateClock.doUpdatePixel(world.name, {
                x: Math.floor(client.x_pos / 16),
                y: Math.floor(client.y_pos / 16),
                r: client.col_r,
                g: client.col_g,
                b: client.col_b
            })
            for (var w in world.clients) {
                var cli = world.clients[w];
                var upd = {
                    id: cli.id,
                    x: client.x_pos,
                    y: client.y_pos,
                    r: cli.col_r,
                    g: cli.col_g,
                    b: cli.col_b,
                    tool: cli.tool
                };
                server.updateClock.doUpdatePlayerPos(world.name, upd)
            }
        })
    }
    return {
        name,
        version,
        install
    }
})()