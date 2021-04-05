import { load, Root } from "protobuf-typescript";
import type { Beatmap } from "./beatmap";
import type { Player } from "./player";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/song_finished.proto');
})();

export class SongFinished {
    user: Player;
    beatmap: Beatmap;
    type: CompletionType;
    score: number;

    static ParseFrom(buffer: Buffer) {
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