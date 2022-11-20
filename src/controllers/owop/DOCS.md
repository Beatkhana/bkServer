# DOCS
Variable `server` is global well you doesn't need to require it.
**All scripts need follow syntax.**
**The makers of Node OWOP shall not be liable for damages caused by scripts of unknown origin, i.e. not from them.**
**If you create a nice script I can check it and then approve and add it to trusted scripts.**
```js
module.exports = (()=>{
	const name = "example" //script name
	const version = "1.0.0" //version
	const permissions = require("../modules/connection/player/permissions.js")
	function install() {
	let config = new server.ConfigManager(name, {
		hello: "hai"
	}).config
		server.events.on("join", function(client) {
			client.send(config.hello) //this will send to every player which will connect to world
			if(client.world == "troll") { //if player is on this world
				client.send("troll") //this sends to player message troll
				client.setRank(permissions.none) //It will set client rank to none-0
			}
			if(client.world == "infinite") {
				client.setPixelBucket([10000, 0])
			}
		})
	}
	return {
		install: install,
		name: name,
		version: version
	}
})()
```
## server
server is global variable so you dont need to require it
##### server.worlds
It's  array with worlds
To get one world you need do
```js
let world = server worlds.find(function(world) {
	return world.name == "wordName"
})
```
if you need know more about world go to file `worldTemplate.js`
##### server.ConfigManager(``scriptName``, ``defaultConfig``)
It's class which allows you to create config for your script config saves every 1 second
```js
let config = new server.ConfigManager(name, {
	hello: "hai"
}).config
console.log(config) //{hello: "hai"}
```
##### server.config
is server config it will be removed from public
##### server.events.on(`event`, `function`)
This is server events
- **join**
It emits when an client connects
it returns *client*
-  **leave**
It emits when an client leaves
returns *client*
- **newWorld**
It emits when there is no world with an name well it creates new one
returns *world*
- **requestChunk**
It emits when an client requests chunk
returns *client* *chunkX* *chunkY*
- **protectChunk**
It emits when an client protects chunk
returns *client* *chunkX* *chunkY* *newState*
- **setPixel**
It emits when an client sets pixel
returns *client* *x* *y* *color*
color is array [r, g, b]
- **playerUpdate**
It emits when an client changes tool, changes color or moves
returns *client* *x* *y* *color* *tool*
color is array [r, g, b]
- **clearChunk**
It emits when an client uses eraser tool
returns *client* *x* *y* *color*
color is array [r, g, b]
- **paste**
It emits when an client uses paste tool
returns *client* *x* *y* *newData*
newData is Uint8Array with `16*16*3` size so to get pixels do
```js
pixels = [];
for(let i = 0; i<16*16*3;) {
  pixels.push(newData.slice(i, i+3))
  i+=3
}
```

## Client
Client is class of client
##### Client.setRank(`rank`) 0-none- 1-user 2-mod 3-admin
```js
server.events.on("join", function(client) {
	if(client.world == "none") {
		client.setRank(0) //Pixel Bucket and Chat Bukcet is set automatically
	}
})
```
##### Client.setPixelBucket(`rate`, `per`)
```js
server.events.on("join", function(client) {
	if(client.world == "infinity") {
		Client.setPixelBucket(1000, 0) //Not recommended
	}
})
```
##### Client.teleport(`x`, `y`)
It teleports client to x and y
```js
server.events.on("command", function(client, command, args) {
	if(command == "troll") {
		if(client.rank >= 2) { //mod or admin
			if(args[0] == "ouf") { //if first arg equals to "ouf"
				client.teleport(666666,666666)
			}
		}
	}
})
```
##### Client.rank
It returns rank of client
##### Client.id
It returns id of client
##### Client.nick
It returns nick of client
##### Client.x_pos or Client.y_pos
returns x or y position of client
##### Client.ip
returns client ip
##### Client.world
returns client worldName
##### Client.col_r or Client.col_g or Client.col_b
returns r, g or b color of client



To get more info about Client go to Client.js
