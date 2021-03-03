import { load } from "protobuf-typescript";

export class LoadSong {
    levelId: string;
    customHostUrl: string;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/load_song.proto');
        const loadSong = root.lookupType("TournamentAssistantShared.Models.Packets.LoadSong");
        const message = loadSong.decode(buffer);
        return loadSong.toObject(message);
    }
}