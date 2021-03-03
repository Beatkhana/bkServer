import { load } from "protobuf-typescript";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";

export class LoadedSong {
    level: PreviewBeatmapLevel;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/loaded_song.proto');
        const loadedSong = root.lookupType("TournamentAssistantShared.Models.Packets.LoadedSong");
        const message = loadedSong.decode(buffer);
        return loadedSong.toObject(message);
    }
}