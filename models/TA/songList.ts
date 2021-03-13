import { load, Root } from "protobuf-typescript";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/song_list.proto');
})();

export class SongList {
    levels: PreviewBeatmapLevel[];

    static ParseFrom(buffer: Buffer) {
        const songList = root.lookupType("TournamentAssistantShared.Models.Packets.SongList");
        const message = songList.decode(buffer);
        return songList.toObject(message);
    }
}