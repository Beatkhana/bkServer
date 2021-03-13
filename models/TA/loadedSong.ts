import { load, Root } from "protobuf-typescript";
import type { PreviewBeatmapLevel } from "./previewBeatmapLevel";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/loaded_song.proto');
})();

export class LoadedSong {
    level: PreviewBeatmapLevel;

    static ParseFrom(buffer: Buffer) {
        const loadedSong = root.lookupType("TournamentAssistantShared.Models.Packets.LoadedSong");
        const message = loadedSong.decode(buffer);
        return loadedSong.toObject(message);
    }
}