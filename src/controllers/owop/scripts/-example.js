module.exports = (()=>{
  const discord = require("discord.js");
  function install() {
    server.events.on("join",function (client) {
      if(client.world == "main") {
        client.send("Hello emm welcome on world hello... delete this script")
      }
    })
    server.events.on("setPixel",function(client, x, y, color) {
      if(client.world == "main") {
        client.send(`Set pixel on ${x} ${y}`)
      }
    })
  }
  return {
    install,
    name: "delete this script its example",
    version: "1.0.0"
  }
})()
