let bansPath = "./bans.json"
let bans = require("../../bans.json");
import * as fs from 'fs';

export class BansManager {
    bans: any;

    constructor() {
        this.bans = bans;
    }

    checkIfIsBanned(ip) {
        var ban = this.bans[ip];
        if (!ban) return false;
        if (ban.duration) {
            var banned = ban.duration + ban.date > Date.now();
            if (!banned) this.unBanIp(ip);

            return banned;
        }

        return true;
    }
    writeBans() {
        try {
            fs.writeFileSync(bansPath, JSON.stringify(this.bans, null, 2));
        } catch (err) {
            if (err) console.error(err);
        }
    }

    addBanIp(ip, reason, duration = 0) {
        let ban: any = this.bans[ip] = {};
        if (duration === 0) {
            ban.reason = reason;
            ban.date = Date.now();
        } else {
            ban.reason = reason;
            ban.duration = Math.abs(duration);
            ban.date = Date.now();
        }
        this.writeBans();
        return true;
    }

    unBanIp(ip) {
        delete this.bans[ip];
        this.writeBans();
    }

    banEndsAfter(ip) { //thx stackoverflow
        if (!this.checkIfIsBanned(ip)) return false;
        var ban = this.bans[ip];
        if (!ban.duration) return false;
        var delta = Math.abs(ban.date + ban.duration - Date.now()) / 1000;

        // calculate (and subtract) whole days
        var days = Math.floor(delta / 86400);
        delta -= days * 86400;

        // calculate (and subtract) whole hours
        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;

        // calculate (and subtract) whole minutes
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        // what's left is seconds
        var seconds = Math.floor(delta % 60); // in theory the modulus is not required

        return {
            days,
            hours,
            minutes,
            seconds,
        }
    }

    generateString(ends) {
        if (!ends.days) return "";
        let string = "";
        for (var timeUnit in ends) {
            let value = ends[timeUnit]
            if (value !== 0) {
                string += `${value} ${timeUnit} `
            }
        }
        return string.slice(0, string.length - 1)
    }
}
// module.exports = BansManager
