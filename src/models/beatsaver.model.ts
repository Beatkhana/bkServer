export declare module Beatsaver {

    export interface Uploader {
        id: number;
        name: string;
        hash: string;
        avatar: string;
    }

    export interface Metadata {
        bpm: number;
        duration: number;
        songName: string;
        songSubName: string;
        songAuthorName: string;
        levelAuthorName: string;
    }

    export interface Stats {
        plays: number;
        downloads: number;
        upvotes: number;
        downvotes: number;
        score: number;
    }

    export interface ParitySummary {
        errors: number;
        warns: number;
        resets: number;
    }

    export interface Diff {
        njs: number;
        offset: number;
        notes: number;
        bombs: number;
        obstacles: number;
        nps: number;
        length: number;
        characteristic: string;
        difficulty: string;
        events: number;
        chroma: boolean;
        me: boolean;
        ne: boolean;
        cinema: boolean;
        seconds: number;
        paritySummary: ParitySummary;
    }

    export interface Version {
        hash: string;
        key: string;
        state: string;
        createdAt: Date;
        sageScore: number;
        diffs: Diff[];
        downloadURL: string;
        coverURL: string;
        previewURL: string;
    }

    export interface map {
        id: string;
        name: string;
        description: string;
        uploader: Uploader;
        metadata: Metadata;
        stats: Stats;
        uploaded: Date;
        automapper: boolean;
        ranked: boolean;
        qualified: boolean;
        versions: Version[];
    }

}

