import { load, Root } from "protobuf-typescript";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/load_song.proto');
})();

export class LoadSong {
    levelId: string;
    customHostUrl: string;

    static ParseFrom(buffer: Buffer) {
        const loadSong = root.lookupType("TournamentAssistantShared.Models.Packets.LoadSong");
        const message = loadSong.decode(buffer);
        return loadSong.toObject(message);
    }
}