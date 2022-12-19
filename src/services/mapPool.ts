import { Prisma } from ".prisma/client";
import { IMapPool } from "../models/mapPool";
import { prisma } from "./database";

export class MapPoolService {
    public static async getMapPools(tournamentId: bigint, isAuth: boolean = false) {
        const pools = await prisma.map_pools.findMany({
            where: {
                tournamentId: tournamentId,
                ...(!isAuth && {
                    live: true
                })
            },
            include: {
                pool_link: {
                    include: {
                        event_map_options: isAuth
                    }
                }
            }
        });
        let mapPools: Map<number, IMapPool.Pool> = new Map();

        for (const pool of pools) {
            const songs =
                pool.pool_link?.map(x => {
                    const eventOptions =
                        x.event_map_options?.length > 0
                            ? x.event_map_options.map(x => {
                                  return {
                                      flags: x.flags,
                                      playerOptions: x.playerOptions,
                                      selectedCharacteristics: x.selCharacteristic,
                                      difficulty: x.difficulty
                                  };
                              })[0]
                            : null;
                    return {
                        id: x.id,
                        hash: x.songHash,
                        name: x.songName,
                        songAuthor: x.songAuthor,
                        levelAuthor: x.levelAuthor,
                        diff: x.songDiff,
                        key: x.key,
                        ssLink: x.ssLink,
                        numNotes: x.numNotes,
                        options: isAuth ? eventOptions : null
                    };
                }) ?? [];
            mapPools.set(pool.id, {
                id: pool.id,
                tournamentId: pool.tournamentId,
                poolName: pool.poolName,
                image: pool.image,
                description: pool.description,
                live: pool.live,
                is_qualifiers: pool.is_qualifiers,
                songs: songs
            });
        }
        return mapPools;
    }

    public static async getPool(poolId: number, isAuth: boolean = false): Promise<IMapPool.Pool | null> {
        const pool = await prisma.map_pools.findFirst({
            where: {
                id: poolId,
                ...(!isAuth && {
                    live: true
                })
            },
            include: {
                pool_link: {
                    include: {
                        event_map_options: isAuth
                    }
                }
            }
        });
        if (!pool) return null;

        const songs = pool.pool_link.map(x => {
            const eventOptions =
                x.event_map_options.length > 0
                    ? x.event_map_options.map(x => {
                          return {
                              flags: x.flags,
                              playerOptions: x.playerOptions,
                              selectedCharacteristics: x.selCharacteristic,
                              difficulty: x.difficulty
                          };
                      })[0]
                    : null;
            return {
                id: x.id,
                hash: x.songHash,
                name: x.songName,
                songAuthor: x.songAuthor,
                levelAuthor: x.levelAuthor,
                diff: x.songDiff,
                key: x.key,
                ssLink: x.ssLink,
                numNotes: x.numNotes,
                options: isAuth ? eventOptions : null
            };
        });
        return {
            id: pool.id,
            tournamentId: pool.tournamentId,
            poolName: pool.poolName,
            image: pool.image,
            description: pool.description,
            live: pool.live,
            is_qualifiers: pool.is_qualifiers,
            songs: songs
        };
    }

    public static async removeSong(songId: number) {
        return await prisma.pool_link.delete({
            where: {
                id: songId
            }
        });
    }

    public static async removePool(poolId: number) {
        return await prisma.map_pools.delete({
            where: {
                id: poolId
            }
        });
    }

    public static async updatePool(poolId: number, data: Prisma.map_poolsUpdateInput) {
        return await prisma.map_pools.update({
            data: data,
            where: {
                id: poolId
            }
        });
    }

    public static async addSongsToPool(songs: Prisma.pool_linkCreateManyInput[]) {
        return await prisma.pool_link.createMany({
            data: songs
        });
    }

    public static async clearQualsPool(tournamentId: bigint) {
        return await prisma.map_pools.updateMany({
            data: {
                is_qualifiers: false
            },
            where: {
                tournamentId: tournamentId
            }
        });
    }

    public static async createPool(data: Prisma.map_poolsCreateInput) {
        return await prisma.map_pools.create({
            data: data
        });
    }
}
