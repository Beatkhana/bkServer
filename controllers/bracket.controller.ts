import express from "express";
import { bracketMatch } from "../models/bracket.model";
import { authRequest } from "../models/models";
import { bslMatch } from "../models/tournament.models";
import { auth } from "./auth.controller";
import { controller } from "./controller";

export class bracketController extends controller {

    @auth()
    async getBracket(args: authRequest) {
        let { req, res, auth } = args;
        let bracketData = await this.bracketData(req.params.id);
        return res.send(bracketData);
    }

    @auth()
    async getBracketMatch(args: authRequest) {
        let { req, res, auth } = args;
        let match: bracketMatch | null = await this.bracketMatchData(req.params?.tourneyId, req.params?.matchId);
        if (match) {
            return res.send(match);
        } else {
            return this.clientError(res, 'Invalid match ID or tournament ID');
        }
    }

    @auth()
    async updateBracket(args: authRequest) {
        let { req, res, auth } = args;
        let id = req.params.tourneyId;
        let data = req.body;
        let isAuth = await auth.admin() || await auth.owner();
        if (!isAuth) return this.unauthorized(res);
        if (data.status == 'update') {
            try {
                await this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "in_progress" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId]);
            } catch (error) {
                return this.fail(res, error);
            }
            let tmpMatch = await this.bracketMatchData(req.params.tourneyId, data.matchId);
            this.emitter.emit('bracketMatch', tmpMatch);
            return this.ok(res);
        } else if (data.status == 'complete') {
            try {
                await this.db.asyncPreparedQuery('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "complete" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId]);
            } catch (error) {
                return this.fail(res, error);
            }

            const settings: any = await this.db.asyncPreparedQuery("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
            const bracket = await this.bracketDataOld(id);
            let thisMatch: bslMatch = bracket.find(x => x.id == data.matchId);
            let winner = '';
            let loser = '';
            if (data.p1Score > data.p2Score) {
                winner = thisMatch.p1;
                loser = thisMatch.p2;
            } else {
                winner = thisMatch.p2;
                loser = thisMatch.p1;
            }
            if (settings[0].type == 'single_elim') {
                let winnersRound = thisMatch.round + 1;
                let maxRound = Math.max.apply(Math, bracket.map(x => x.round))
                if (winnersRound <= maxRound) {
                    let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                    let playerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                    let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                    try {
                        await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [playerIdentifier, winner, nextMatch.id]);
                        let tmpMatch = await this.bracketMatchData(req.params.tourneyId, nextMatch.id);
                        this.emitter.emit('bracketMatch', tmpMatch);
                    } catch (error) {
                        return this.fail(res, error);
                    }
                }

                let tmpMatch = await this.bracketMatchData(req.params.tourneyId, data.matchId);
                this.emitter.emit('bracketMatch', tmpMatch);
                return this.ok(res);
            } else if (settings[0].type == 'double_elim') {


                if (thisMatch.round >= 0) {
                    // winner
                    let winnersRound = thisMatch.round + 1;
                    let maxRound = Math.max.apply(Math, bracket.map(x => x.round));
                    if (winnersRound < maxRound) {
                        let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                        let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(req.params.tourneyId, nextMatch.id);
                            this.emitter.emit('bracketMatch', tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }

                        // loser
                        let loserRound = -1;
                        let loserMatch = Math.floor(thisMatch.matchNum / 2);
                        let loserIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                        if (thisMatch.round > 0) {
                            loserIdentifier = 'p1';
                            loserRound = thisMatch.round * -2;
                            if ((thisMatch.round % 3) % 2 == 0) {
                                loserMatch = thisMatch.matchNum % 2 == 0 ? thisMatch.matchNum + 1 : thisMatch.matchNum - 1;
                            } else {
                                loserMatch = bracket.filter(x => x.round == 0).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1
                            }
                            if (maxRound - 2 == thisMatch.round) {
                                loserMatch = 0;
                            }
                        }
                        let loserNextMatch = bracket.find(x => x.round == loserRound && x.matchNum == loserMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [loserIdentifier, loser, loserNextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(req.params.tourneyId, loserNextMatch.id);
                            this.emitter.emit('bracketMatch', tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    } else if (winnersRound == maxRound && data.p1Score < data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET p1 = ?, p2 = ?, bye = 0 WHERE id = ?', [winner, loser, nextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(req.params.tourneyId, nextMatch.id);
                            this.emitter.emit('bracketMatch', tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    } else if (winnersRound == maxRound && data.p1Score > data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await this.db.asyncPreparedQuery('UPDATE bracket SET bye = 1 WHERE id = ?', [nextMatch.id])
                            let tmpMatch = await this.bracketMatchData(req.params.tourneyId, nextMatch.id);
                            this.emitter.emit('bracketMatch', tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    }
                } else if (thisMatch.round < 0) {
                    let winnersRound = thisMatch.round - 1;
                    let minRound = Math.min.apply(Math, bracket.map(x => x.round));
                    let maxRound = Math.max.apply(Math, bracket.map(x => x.round));
                    let winnersMatch = 0;
                    let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? 'p1' : 'p2';
                    if (winnersRound > minRound) {
                        winnersMatch = thisMatch.round * -1 % 2 == 1 ? thisMatch.matchNum : Math.floor(thisMatch.matchNum / 2);
                    } else if (winnersRound == minRound - 1) {
                        winnersRound = maxRound - 1;
                        winnersMatch = 0;
                        winnerIdentifier = 'p2';
                    }
                    let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                    if (thisMatch.round * -1 % 2 == 1) winnerIdentifier = 'p2';
                    try {
                        await this.db.asyncPreparedQuery('UPDATE bracket SET ?? = ? WHERE id = ?', [winnerIdentifier, winner, nextMatch.id])
                    } catch (error) {
                        return this.fail(res, error);
                    }
                    let tmpMatch = await this.bracketMatchData(req.params.tourneyId, data.matchId);
                    this.emitter.emit('bracketMatch', tmpMatch);
                    return this.ok(res);
                }


            }
            let tmpMatch = await this.bracketMatchData(req.params.tourneyId, data.matchId);
            this.emitter.emit('bracketMatch', tmpMatch);
            return this.ok(res);
        }
        return this.fail(res, 'Something went wrong');
    }

    private async bracketData(id: number | string) {
        const bracketData: any = await this.db.aQuery(`SELECT bracket.*,
        u1.globalRank as p1Rank,
        u2.globalRank as p2Rank,
        u1.name as p1Name,
        u2.name as p2Name,
        u1.country as p1Country,
        u2.country as p2Country,
        u1.avatar as p1Avatar,
        u2.avatar as p2Avatar,
        u1.twitchName as p1Twitch,
        u2.twitchName as p2Twitch,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.tournamentId = ? `, [id]);

        let matches: bracketMatch[] = [];
        for (const row of bracketData) {
            let match: bracketMatch = {
                id: row.id,
                status: row.status,
                matchNum: row.matchNum,
                tournamentId: row.tournamentId,
                p1: {
                    id: row.p1,
                    ssId: row.p1ssId,
                    name: row.p1Name,
                    avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == 'a_' ? '.gif' : '.webp') : null,
                    score: row.p1Score,
                    country: row.p1Country,
                    seed: row.p1Seed,
                    forfeit: row.p1Forfeit,
                    twitch: row.p1Twitch,
                    rank: row.p1GlobalRank,
                },
                p2: {
                    id: row.p2,
                    ssId: row.p2ssId,
                    name: row.p2Name,
                    avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == 'a_' ? '.gif' : '.webp') : null,
                    score: row.p2Score,
                    country: row.p2Country,
                    seed: row.p2Seed,
                    forfeit: row.p2Forfeit,
                    twitch: row.p2Twitch,
                    rank: row.p2GlobalRank,
                },
                round: row.round
            }
            matches.push(match);
        }
        return matches;
    }

    private async bracketDataOld(id: number | string) {
        const bracketData: any = await this.db.aQuery(`SELECT bracket.*,
        u1.globalRank as p1Rank,
        u2.globalRank as p2Rank,
        u1.name as p1Name,
        u2.name as p2Name,
        u1.country as p1Country,
        u2.country as p2Country,
        u1.avatar as p1Avatar,
        u2.avatar as p2Avatar,
        u1.twitchName as p1Twitch,
        u2.twitchName as p2Twitch,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.tournamentId = ? `, [id]);
        return bracketData;
    }

    private async bracketMatchData(tourneyId: string | number, matchId: string | number) {
        const matchData = await this.db.aQuery(`SELECT bracket.*,
        u1.globalRank as p1GlobalRank,
        u2.globalRank as p2GlobalRank,
        u1.name as p1Name,
        u2.name as p2Name,
        u1.country as p1Country,
        u2.country as p2Country,
        u1.avatar as p1Avatar,
        u2.avatar as p2Avatar,
        u1.twitchName as p1Twitch,
        u2.twitchName as p2Twitch,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.id = ? AND bracket.tournamentId = ?`, [matchId, tourneyId]);
        if (matchData.length < 1) return null;
        let row = matchData[0];
        let match: bracketMatch = {
            id: row.id,
            status: row.status,
            matchNum: row.matchNum,
            tournamentId: row.tournamentId,
            p1: {
                id: row.p1,
                ssId: row.p1ssId,
                name: row.p1Name,
                avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == 'a_' ? '.gif' : '.webp') : null,
                score: row.p1Score,
                country: row.p1Country,
                seed: row.p1Seed,
                forfeit: row.p1Forfeit,
                twitch: row.p1Twitch,
                rank: row.p1GlobalRank,
            },
            p2: {
                id: row.p2,
                ssId: row.p2ssId,
                name: row.p2Name,
                avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == 'a_' ? '.gif' : '.webp') : null,
                score: row.p2Score,
                country: row.p2Country,
                seed: row.p2Seed,
                forfeit: row.p2Forfeit,
                twitch: row.p2Twitch,
                rank: row.p2GlobalRank,
            },
            round: row.round
        }
        return match;
    }

}