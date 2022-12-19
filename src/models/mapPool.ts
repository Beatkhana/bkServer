export declare namespace IMapPool {
    export interface Song {
        id: number;
        hash: string;
        name: string;
        songAuthor: string;
        levelAuthor: string;
        diff: string;
        key: string;
        ssLink: string;
        numNotes: number;
        options?: {
            flags: number;
            playerOptions: number;
            selectedCharacteristics: string;
            difficulty: number;
        };
    }

    export interface Pool {
        id: number;
        tournamentId: string | bigint;
        poolName: string;
        image: string;
        description: string;
        live: boolean;
        is_qualifiers: boolean;
        songs: Song[];
    }
}
