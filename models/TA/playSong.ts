import { load, Root } from "protobuf-typescript";
import type { GameplayParameters } from "./gameplayParameters";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/play_song.proto');
})();

export class PlaySong {
    gameplayParameters: GameplayParameters;
    floatingScoreboard: boolean;
    streamSync: boolean;
    disablePause: boolean;
    disableFail: boolean;

    static ParseFrom(buffer: Buffer) {
        const playSong = root.lookupType("TournamentAssistantShared.Models.Packets.PlaySong");
        const message = playSong.decode(buffer);
        return playSong.toObject(message);
    }
}