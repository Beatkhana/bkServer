"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketType = exports.Packet = void 0;
var uuid_1 = require("uuid");
var Packet = /** @class */ (function () {
    //Size of the header, the info we need to parse the specific packet
    // 4x byte - "moon"
    // int - packet type
    // int - packet size
    // 16x byte - size of from id
    // 16x byte - size of packet id
    // packetHeaderSize!: number;
    function Packet(specificPacket, type) {
        this.Size = 0;
        this.SpecificPacketSize = 44;
        this.Id = uuid_1.v4();
        this.From = uuid_1.v4();
        this.Type = type;
        this.SpecificPacket = specificPacket;
    }
    Packet.encodePacket = function (specificPacket) {
        var enc = new TextEncoder();
        var type = this.toBytesInt32(specificPacket.Type);
        var size = this.toBytesInt32(JSON.stringify(specificPacket.SpecificPacket).length);
        specificPacket.SpecificPacketSize = JSON.stringify(specificPacket.SpecificPacket).length;
        specificPacket.Size = 44 + specificPacket.SpecificPacketSize;
        specificPacket.Id = uuid_1.v4();
        specificPacket.From = uuid_1.v4();
        var buffArray = [enc.encode("moon"), new Uint8Array(type), new Uint8Array(size), Uint8Array.from(uuid_1.parse(uuid_1.NIL)), Uint8Array.from(uuid_1.parse(uuid_1.NIL)), enc.encode(JSON.stringify(specificPacket.SpecificPacket))];
        var flattened = Uint8ClampedArray.from(buffArray.reduce(function (a, b) { return __spread(a, b); }, []));
        return flattened;
    };
    Packet.prototype.isPacket = function (packet) {
        return packet.substr(0, 4) == 'moon';
    };
    Packet.toBytesInt32 = function (num) {
        var arr = new ArrayBuffer(4);
        var view = new DataView(arr);
        view.setUint32(0, num, false);
        return arr;
    };
    return Packet;
}());
exports.Packet = Packet;
var PacketType;
(function (PacketType) {
    PacketType[PacketType["Acknowledgement"] = 0] = "Acknowledgement";
    PacketType[PacketType["Command"] = 1] = "Command";
    PacketType[PacketType["Connect"] = 2] = "Connect";
    PacketType[PacketType["ConnectResponse"] = 3] = "ConnectResponse";
    PacketType[PacketType["Event"] = 4] = "Event";
    PacketType[PacketType["File"] = 5] = "File";
    PacketType[PacketType["ForwardingPacket"] = 6] = "ForwardingPacket";
    PacketType[PacketType["LoadedSong"] = 7] = "LoadedSong";
    PacketType[PacketType["LoadSong"] = 8] = "LoadSong";
    PacketType[PacketType["PlaySong"] = 9] = "PlaySong";
    PacketType[PacketType["Response"] = 10] = "Response";
    PacketType[PacketType["ScoreRequest"] = 11] = "ScoreRequest";
    PacketType[PacketType["ScoreRequestResponse"] = 12] = "ScoreRequestResponse";
    PacketType[PacketType["SongFinished"] = 13] = "SongFinished";
    PacketType[PacketType["SongList"] = 14] = "SongList";
    PacketType[PacketType["SubmitScore"] = 15] = "SubmitScore";
})(PacketType = exports.PacketType || (exports.PacketType = {}));
