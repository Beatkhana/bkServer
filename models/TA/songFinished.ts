import { load } from "protobuf-typescript";
import type { Beatmap } from "./beatmap";
import type { Player } from "./player";

export class SongFinished {
    user: Player;
    beatmap: Beatmap;
    type: CompletionType;
    score: number;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/song_finished.proto');
        const songFinished = root.lookupType("TournamentAssistantShared.Models.Packets.SongFinished");
        const message = songFinished.decode(buffer);
        return songFinished.toObject(message);
    }
}

export enum CompletionType {
    Passed,
    Failed,
    Quit
}