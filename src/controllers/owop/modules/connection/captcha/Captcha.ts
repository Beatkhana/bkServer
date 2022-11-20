import { request } from "http";
import { protocol } from "../../server/protocol";
import { captchaStates } from "./captchaStates";
let config = require("../../../config.json");
let verifedIps = {};

export class Captcha {

    client: any;
    state: string;

    constructor(client, worlds) {
        this.client = client;
        this.state = "waiting"
    }

    show() {
        let security = config.captcha.security;
        if (security < 1 || security > 3) {
            security = 0;
        }
        switch (security) {
            case 0:
                this.sendState("ok");
                break;
            case 1:
                if (verifedIps[this.client.ip]) {
                    this.sendState("ok");
                } else {
                    this.sendState("waiting");
                }
                break;
            case 2:
                this.sendState("waiting");
                break;
            case 3:
                this.sendState("waiting");
                break;
        }
    }

    sendState(state) {
        this.state = state;
        this.client.send(new Uint8Array([protocol.server.captcha, captchaStates[state]]))
    }

    async onToken(message) {
        if (!message.startsWith(config.captcha.clientSideVerificationKey)) return;
        let key = message.slice(config.captcha.clientSideVerificationKey.length);
        let security = config.captcha.security;
        if (security < 1 || security > 3) {
            security = 0;
        }
        this.sendState("veryfying")
        switch (security) {
            case 1: //save ips (shows only once)
                if (!verifedIps[this.client.ip]) {
                    var success = await this.verifyToken(key);
                    if (success == true) {
                        this.sendState("ok")
                        verifedIps[this.client.ip] = true
                    } else {
                        this.sendState("invaild");
                        this.client.ws.close();
                    }
                }
                break;
            case 2: //don't save ip (allways show)
                var success = await this.verifyToken(key);
                //console.log(success)
                if (success == true) {
                    this.sendState("ok")
                } else {
                    this.sendState("invaild");
                    this.client.ws.close();
                }
                break; //one once (if player will send captcha verify second time KILL)
            case 3:
                if (verifedIps[this.client.ip]) {

                }
                break
        }
    }

    verifyToken(key) {
        if (config.captcha.bypass) {
            if (key == "LETMEINPLZ" + config.captcha.bypass) {
                return true;
            }
        }
        return new Promise(function (resolve, reject) {
            request(`https://www.google.com/recaptcha/api/siteverify?secret=${config.captcha.serverKey}&response=${key}`, function (error, response, body) {
                if (error) {
                    resolve(false)
                    return;
                };
                body = body.replace(/\r/g, '');
                var jsonresponse = JSON.parse(body);
                resolve(jsonresponse.success);
            }.bind(resolve))
        })
    }
}
// module.exports = Captcha
