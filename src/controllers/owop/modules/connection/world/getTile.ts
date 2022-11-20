import { server } from "../../../server";
import { compress_data_to } from "./compressData";

export function getTile(worldName, tileX, tileY) {
    var tile = server.manager.get_chunk(worldName, tileX, tileY);
    if (!tile) {
        tile = new Uint8Array(16 * 16 * 3);
        for (var i = 0; i < 16 * 16 * 3; i++) {
            tile[i] = 255;
        }
    }
    var tileProtect = server.manager.chunk_is_protected(worldName, tileX, tileY)
    return compress_data_to(tile, tileX, tileY, tileProtect)
}
// module.exports = getTile
