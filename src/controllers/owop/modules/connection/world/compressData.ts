import { protocol } from "../../server/protocol";

export function compress_data_to(data, tileX, tileY, protection) {
    var result = new Uint8Array(16 * 16 * 3 + 10 + 4);
    var s = 16 * 16 * 3;
    var compressedPos = [];
    var compBytes = 3;
    var lastclr = data[2] << 16 | data[1] << 8 | data[0];
    var t = 1;
    for (var i = 3; i < data.length; i += 3) {
        var clr = data[i + 2] << 16 | data[i + 1] << 8 | data[i];
        compBytes += 3;
        if (clr == lastclr) {
            ++t;
        } else {
            if (t >= 3) {
                compBytes -= t * 3 + 3;
                compressedPos.push({
                    pos: compBytes,
                    length: t
                });
                compBytes += 5 + 3;
            }
            lastclr = clr;
            t = 1;
        }
    }
    if (t >= 3) {
        compBytes -= t * 3;
        compressedPos.push({
            pos: compBytes,
            length: t
        });
        compBytes += 5;
    }
    var totalcareas = compressedPos.length;
    var msg = new DataView(result.buffer);
    msg.setUint8(0, protocol.server.chunkLoad);
    msg.setInt32(1, tileX, true);
    msg.setInt32(5, tileY, true);
    msg.setUint8(9, protection);

    var curr = 10; // as unsigned8

    msg.setUint16(curr, s, true);
    curr += 2; // size of unsigned 16 bit ints

    msg.setUint16(curr, totalcareas, true);

    curr += 2; // uint16 size

    for (var i = 0; i < compressedPos.length; i++) {
        var point = compressedPos[i];
        msg.setUint16(curr, point.pos, true)
        curr += 2; // uint16 size
    }

    var di = 0;
    var ci = 0;
    for (var i = 0; i < compressedPos.length; i++) {
        var point = compressedPos[i];
        while (ci < point.pos) {
            msg.setUint8(curr + (ci++), data[di++]);
        }
        msg.setUint16(curr + ci, point.length, true);
        ci += 2; // uint16 size
        msg.setUint8(curr + (ci++), data[di++]);
        msg.setUint8(curr + (ci++), data[di++]);
        msg.setUint8(curr + (ci++), data[di++]);
        di += point.length * 3 - 3;
    }
    while (di < s) {
        msg.setUint8(curr + (ci++), data[di++]);
    }
    var size = compBytes + totalcareas * 2 + 10 + 2 + 2;
    return result.slice(0, size);
}
// module.exports = compress_data_to
