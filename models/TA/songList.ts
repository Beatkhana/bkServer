import { load } from "protobuf-typescript";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";

export class SongList {
    levels: PreviewBeatmapLevel[];

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/song_list.proto');
        const songList = root.lookupType("TournamentAssistantShared.Models.Packets.SongList");
        const message = songList.decode(buffer);
        return songList.toObject(message);
    }
}