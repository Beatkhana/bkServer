import { load } from "protobuf-typescript";
import type { SongList } from "./songList";
import type { Team } from "./team";
import type { User } from "./User";

export class Player implements User {
    id: string;
    name: string;
    userId: string;
    team: Team;
    playState: PlayStates;
    downloadState: DownloadStates;
    score: number;
    combo: number;
    accuracy: number;
    songPosition: number;
    songList: SongList;
    modList: string[];
    streamScreenCoordinates: Point;
    streamDelayMs: number;
    streamSyncStartMs: number;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/player.proto');
        const player = root.lookupType("TournamentAssistantShared.Models.Player");
        const message = player.decode(buffer);
        return player.toObject(message);
    }
}

export enum PlayStates {
    Waiting,
    InGame
}

export enum DownloadStates {
    None,
    Downloading,
    Downloaded,
    DownloadError
}

export interface Point {
    x: number;
    y: number;
}