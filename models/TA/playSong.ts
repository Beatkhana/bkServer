import { load } from "protobuf-typescript";
import type { GameplayParameters } from "./gameplayParameters";

export class PlaySong {
    gameplayParameters: GameplayParameters;
    floatingScoreboard: boolean;
    streamSync: boolean;
    disablePause: boolean;
    disableFail: boolean;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/play_song.proto');
        const playSong = root.lookupType("TournamentAssistantShared.Models.Packets.PlaySong");
        const message = playSong.decode(buffer);
        return playSong.toObject(message);
    }
}