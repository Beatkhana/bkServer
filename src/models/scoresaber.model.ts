export interface Badge {
    image: string;
    description: string;
}

export interface ScoreStats {
    totalScore: number;
    totalRankedScore: number;
    averageRankedAccuracy: number;
    totalPlayCount: number;
    rankedPlayCount: number;
}

export module Scoresaber {
    export interface Metadata {
        total: number;
        page: number;
        itemsPerPage: number;
    }
    export interface Leaderboard {
        leaderboardInfo: LeaderboardInfo;
        scores: Score[] | null;
    }

    export interface LeaderboardInfo {
        id: number;
        songHash: string;
        songName: string;
        songSubName: string;
        songAuthorName: string;
        levelAuthorName: string;
        difficulty: Difficulty;
        maxScore: number;
        createdDate: Date;
        rankedDate: Date;
        qualifiedDate: Date;
        lovedDate: Date;
        ranked: boolean;
        qualified: boolean;
        loved: boolean;
        maxPP: number;
        stars: number;
        plays: number;
        dailyPlays: number;
        positiveModifiers: boolean;
        coverImage: string;
        playerScore: Score | null;
        difficulties: Difficulty[];
    }

    export interface LeaderboardInfoCollection {
        leaderboards: LeaderboardInfo[];
        metadata: Metadata;
    }

    export interface ScoreCollection {
        scores: Score[];
        metadata: Metadata;
    }

    export interface Difficulty {
        leaderboardId: number;
        difficulty: number;
        gameMode: string;
        difficultyRaw: string;
    }

    export interface Score {
        id: number;
        leaderboardPlayerInfo?: LeaderboardPlayer;
        rank: number;
        baseScore: number;
        modifiedScore: number;
        pp: number;
        weight: number;
        modifiers: string;
        multiplier: number;
        badCuts: number;
        missedNotes: number;
        maxCombo: number;
        fullCombo: boolean;
        hmd: number;
        timeSet: Date;
    }

    export interface LeaderboardPlayer {
        id: string;
        name: string;
        profilePicture: string;
        country: string;
        permissions: number;
        role: string;
    }

    export interface LeaderboardFilterOptions {
        verified: boolean;
        ranked: boolean;
        minStar: number;
        maxStar: number;
        category: Category;
        sortDirection: SortDirection;
    }

    export interface Player {
        id: string;
        name: string;
        profilePicture: string;
        bio: string;
        country: string;
        pp: number;
        rank: number;
        countryRank: number;
        role: string;
        badges: Badge[] | null;
        histories: string;
        scoreStats: ScoreStats | null;
        permissions: number;
        banned: boolean;
        inactive: boolean;
    }

    export enum Category {
        Trending = "trending",
        DateRanked = "rank_date",
        ScoresSet = "scores",
        StarDifficulty = "max_pp",
        Author = "levelAuthorName",
        DateQualified = "qualified_date"
    }

    export enum SortDirection {
        Descending = "desc",
        Ascending = "asc"
    }

    export function getCategoryFromNumber(category: number): Category {
        switch (category) {
            case 0: {
                return Category.Trending;
            }
            case 1: {
                return Category.DateRanked;
            }
            case 2: {
                return Category.ScoresSet;
            }
            case 3: {
                return Category.StarDifficulty;
            }
            case 4: {
                return Category.Author;
            }
        }
        return Category.Trending;
    }

    export function getNumberFromCategory(category: Category): number {
        switch (category) {
            case Category.Trending: {
                return 0;
            }
            case Category.DateRanked: {
                return 1;
            }
            case Category.ScoresSet: {
                return 2;
            }
            case Category.StarDifficulty: {
                return 3;
            }
            case Category.Author: {
                return 4;
            }
        }
        return 0;
    }

    export function getSortDirectionFromNumber(direction: number): SortDirection {
        switch (direction) {
            case 0: {
                return SortDirection.Descending;
            }
            case 1: {
                return SortDirection.Ascending;
            }
        }
        return SortDirection.Descending;
    }

    export function getNumberFromSortDirection(direction: SortDirection): number {
        switch (direction) {
            case SortDirection.Descending: {
                return 0;
            }
            case SortDirection.Ascending: {
                return 1;
            }
        }
    }

    export function getDifficultyLabel(input: number): string | null {
        switch (input) {
            case 1:
                return "Easy";
            case 3:
                return "Normal";
            case 5:
                return "Hard";
            case 7:
                return "Expert";
            case 9:
                return "Expert+";
        }
        return null;
    }

    export function getDifficultyNumber(input: string): number | null {
        switch (input) {
            case "Easy":
                return 1;
            case "Normal":
                return 3;
            case "Hard":
                return 5;
            case "Expert":
                return 7;
            case "ExpertPlus":
            case "Expert+":
                return 9;
            default:
                return null;
        }
    }
}
