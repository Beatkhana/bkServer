module.exports = (() => {
  const Discord = require("discord.js");
  let name = "Discord Gateway"
  let version = "1.0.0"

  function install() {
    let config = new server.ConfigManager(name, { //shitty
      guildId: "",
      channelId: { //channelId: world
        "": "main"
      },
      botToken: "",
      botControlRole: "",
    }).config

    const bot = new Discord.Client({
      disableEveryone: true
    });
    server.bot = bot;

    function getKeyByValue(object, value) {
      for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
          if (object[prop] === value)
            return prop;
        }
      }
      return false;
    }
    bot.on("message", async (message) => {
      if (config.channelId[message.channel.id]) {
        if (message.author.bot) return;
        if (message.channel.type === "dm") return;

        //if (configg.enablePings == false) message.content = message.content.replace(/<@([0-9]+)>/g, "(here ping)");

        if (world) {
          server.players.sendToWorld(config.channelId[message.channel.id], `[D] ${message.author.username}: ${message.content}`)
        }
      }
    });
    server.events.on("chat", function(client, msg) {
      var channelId = getKeyByValue(config.channelId, client.world)
      if (channelId == false) return;
      let before = client.before.replace(/<(?:alt=("|')(.+?)\1|.|\n)+>/gm, "$2");
      bot.guilds.get(config.guildId).channels.get(channelId).send(`${before}: ${msg}`)
    })
    bot.login(config.botToken);
  }
  return {
    install,
    name,
    version
  }
})()
