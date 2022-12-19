import { Prisma, tournament_settings } from "@prisma/client";
import express from "express";
import fs from "fs";
import { bracketMatch, updateMatchRequest } from "../models/bracket.model";
import { bslMatch, match } from "../models/tournament.models";
import { BracketService } from "../services/bracket";
import { ParticipantService } from "../services/participant";
import { UserService } from "../services/user";
import { shuffleArray } from "../util/helpers";
import { authController } from "./auth";
import { controller } from "./controller";

export class bracketController extends controller {
    async getBracket(req: express.Request, res: express.Response) {
        let bracketData = await BracketService.bracketData(BigInt(+req.params.id));
        return res.send(bracketData);
    }

    async getBracketMatch(req: express.Request, res: express.Response) {
        let match: bracketMatch | null = await BracketService.bracketMatchData(req.params?.tourneyId, req.params?.matchId);
        if (match) {
            return res.send(match);
        } else {
            return this.clientError(res, "Invalid match ID or tournament ID");
        }
    }

    async scheduleMatch(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let time = new Date(req.body.matchTime);
        try {
            await BracketService.updateBracketMatch(+req.params.id, {
                time: time
            });
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async setBestOf(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        if (!req.body.best_of) return this.clientError(res, "Please provide a valid best of value");
        try {
            await BracketService.updateBracketMatch(+req.params.id, {
                best_of: req.body.best_of
            });
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async updateBracketMatch(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let data = <updateMatchRequest>req.body;
        try {
            await BracketService.updateBracketMatch(+data.matchId, {
                p1: data.p1,
                p2: data.p2
            });
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async saveOverlay(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        if (!req.body.img) return this.clientError(res, "Please provide a valid best of value");
        try {
            // console.log(req.body.img);
            let savePath = this.env == "development" ? "../app/src/assets/overlay/" : __dirname + "/../public/assets/overlay/";
            // let base64Img = req.body.img.split(';base64,').pop();
            // const buf = await Buffer.from(base64Img, 'base64');
            // const webpData = await sharp(buf)
            //     .toFile(savePath+req.params.id+'.svg');

            fs.writeFile(savePath + auth.tourneyId + ".svg", req.body.img, function (err) {
                if (err) return console.log(err);
                // console.log('Hello World > helloworld.txt');
            });
            // await DatabaseService.query('UPDATE bracket SET best_of = ? WHERE id = ?', [req.body.best_of, req.params.id]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async saveBracket(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let id = auth.tourneyId;
        let data = req.body;
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let matches: Array<Prisma.bracketCreateManyInput> = [];

        // data.customPlayers: list of custom player names (string[])
        // data.players: list of user IDs (number[])

        if (data.customPlayers?.length > 0) {
            let tempMatches = await this.generateBracket(id, data.customPlayers);
            for (const match of tempMatches) {
                matches.push({
                    tournamentId: id,
                    round: match.round,
                    matchNum: match.matchNum,
                    p1: match.p1,
                    p2: match.p2,
                    bye: !!match.bye || false
                });
            }
        } else if (data.players?.length > 0) {
            // custom players but with users
            let tempMatches = await this.generateBracket(id, null, data.players);
            for (const match of tempMatches) {
                matches.push({
                    tournamentId: id,
                    round: match.round,
                    matchNum: match.matchNum,
                    p1: match.p1,
                    p2: match.p2,
                    bye: !!match.bye || false
                });
            }
        } else {
            let tempMatches = await this.generateBracket(id);
            for (const match of tempMatches) {
                matches.push({
                    tournamentId: id,
                    round: match.round,
                    matchNum: match.matchNum,
                    p1: match.p1,
                    p2: match.p2,
                    bye: !!match.bye || false
                });
            }
        }
        let sqlMatches = [];
        for (const match of matches) {
            sqlMatches.push(Object.values(match));
        }
        try {
            await BracketService.clearBracket(id);
            await BracketService.createBracket(matches);
        } catch (error) {
            return this.fail(res, error);
        }
        return this.ok(res);
    }

    // async testBracket(id: string, players?: string[], users?: string[]) {
    //     let settings = await this.getSettings(id);
    //     let rand = false;
    //     if (settings.bracket_sort_method == "random") {
    //         settings.bracket_sort_method = "discordId";
    //         rand = true;
    //     }
    //     let participants: string[];
    //     if (!players && !users) {
    //         // participants = await DatabaseService.query(
    //         //     `SELECT p.id AS participantId,
    //         // CAST(p.userId AS CHAR) as userId,
    //         // p.forfeit,
    //         // p.seed as seed,
    //         // discordId,
    //         // ssId,
    //         // \`u\`.\`name\`,
    //         // \`u\`.\`twitchName\`,
    //         // \`u\`.\`avatar\`,
    //         // \`u\`.\`globalRank\` as globalRank,
    //         // \`u\`.\`localRank\`,
    //         // \`u\`.\`country\`,
    //         // \`u\`.\`tourneyRank\` as tournamentRank,
    //         // \`u\`.\`TR\`,
    //         // \`u\`.\`pronoun\`
    //         // FROM participants p
    //         // LEFT JOIN users u ON u.discordId = p.userId
    //         // LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
    //         // WHERE p.tournamentId = ? ORDER BY ${settings.bracket_sort_method}=0, ${settings.bracket_sort_method} ${rand ? "" : "LIMIT ?"}`,
    //         //     [id, settings.bracket_limit]
    //         // ).catch(err => {
    //         //     console.error(err);
    //         // });
    //         participants = (await ParticipantService.getParticipants(BigInt(+id), undefined, false, {
    //             [settings.bracket_sort_method]: 0,
    //         })).map(x => x.userId);
    //     } else if (players && !users) {
    //         participants = players;
    //     } else if (!players && users) {
    //         let temp = await DatabaseService.query(
    //             `SELECT
    //         discordId,
    //         ssId,
    //         \`u\`.\`name\`,
    //         \`u\`.\`twitchName\`,
    //         \`u\`.\`avatar\`,
    //         \`u\`.\`globalRank\` as globalRank,
    //         \`u\`.\`localRank\`,
    //         \`u\`.\`country\`,
    //         \`u\`.\`tourneyRank\` as tournamentRank,
    //         \`u\`.\`TR\`,
    //         \`u\`.\`pronoun\`
    //         FROM users u
    //         WHERE u.discordId IN (?) ORDER BY ${settings.bracket_sort_method} = 0, ${settings.bracket_sort_method} ${rand ? "" : "LIMIT ?"}`,
    //             [users, settings.bracket_limit]
    //         ).catch(err => {
    //             console.error(err);
    //         });

    //         participants = this.mapOrder(temp, users, "discordId");
    //     }

    //     if (rand) {
    //         this.shuffle(participants);
    //     }

    //     if (participants.length > settings.bracket_limit) participants.length = settings.bracket_limit;

    //     await DatabaseService.query("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id]);
    //     if (settings.bracket_sort_method != "seed" && !players) {
    //         let i = 1;
    //         for (const participant of participants) {
    //             await DatabaseService.query(`UPDATE participants SET seed = ? WHERE id = ?`, [i, participant.participantId]);
    //             i++;
    //         }
    //     }

    //     let matches: any[];
    //     if (settings.type == "single_elim") {
    //         matches = await this.winnersRoundMatches(settings, participants, !!players);
    //     } else if (settings.type == "double_elim") {
    //         matches = await this.doubleElimMatches(settings, participants, !!players);
    //     }
    //     let bracketData = matches;
    //     matches = [];
    //     for (const row of bracketData) {
    //         let match: bracketMatch = {
    //             id: row.id,
    //             status: row.status,
    //             matchNum: row.matchNum,
    //             tournamentId: row.tournamentId,
    //             p1: {
    //                 id: row.p1,
    //                 ssId: row.p1ssId,
    //                 name: row.p1Name,
    //                 avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
    //                 score: row.p1Score,
    //                 country: row.p1Country,
    //                 seed: row.p1Seed,
    //                 forfeit: row.p1Forfeit,
    //                 twitch: row.p1Twitch,
    //                 rank: row.p1Rank
    //             },
    //             p2: {
    //                 id: row.p2,
    //                 ssId: row.p2ssId,
    //                 name: row.p2Name,
    //                 avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
    //                 score: row.p2Score,
    //                 country: row.p2Country,
    //                 seed: row.p2Seed,
    //                 forfeit: row.p2Forfeit,
    //                 twitch: row.p2Twitch,
    //                 rank: row.p2Rank
    //             },
    //             round: row.round,
    //             bye: row.bye,
    //             time: row.time,
    //             best_of: row.best_of
    //         };
    //         matches.push(match);
    //     }

    //     return matches;
    // }

    /**
     *
     * @param id tournament Id
     * @param players list of player names
     * @param users list of player ids
     * @returns list of bracket matches
     */
    async generateBracket(id: bigint, players?: string[], users?: string[]) {
        // const settings: any = await DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        let settings = await this.getSettings(id);
        let rand = false;
        if (settings.bracket_sort_method == "random") {
            settings.bracket_sort_method = "discordId";
            rand = true;
        }
        let participants: string[] = [];
        if (!players && !users) {
            const temp = await ParticipantService.getParticipants(
                BigInt(id),
                undefined,
                false,
                {
                    [settings.bracket_sort_method]: 0
                },
                rand ? undefined : settings.bracket_limit
            );
            participants = temp.map(x => x.userId);
        } else if (players && !users) {
            participants = players;
        } else if (!players && users) {
            // const temp = await UserService.searchUsersById(users, {
            //     [settings.bracket_sort_method]: 0
            // }, rand ? undefined : settings.bracket_limit);
            participants = users;
        }

        if (rand) {
            shuffleArray(participants);
        }

        if (participants.length > settings.bracket_limit) participants.length = settings.bracket_limit;

        await ParticipantService.updateTournamentParticipants(BigInt(id), { seed: 0 });
        if (settings.bracket_sort_method != "seed" && !players) {
            let i = 1;
            for (const participant of participants) {
                await ParticipantService.updateParticipant({ tournamentId: BigInt(id), participantId: +participant, data: { seed: i } });
                i++;
            }
        }

        let matches: any[];
        if (settings.type == "single_elim") {
            matches = await this.winnersRoundMatches(settings, participants);
        } else if (settings.type == "double_elim") {
            matches = await this.doubleElimMatches(settings, participants);
        }

        return matches;
    }

    private async winnersRoundMatches(settings: tournament_settings, participants: string[]) {
        let numParticipants = participants.length;
        let seeds = this.seeding(numParticipants);
        let matches: {
            id: number;
            round: number;
            matchNum: number;
            p1: string;
            p2: string;
            p1Seed: number;
            p2Seed: number;
            bye?: boolean;
        }[] = [];

        let rounds = Math.ceil(Math.log2(numParticipants));

        let byePlayers = [];
        let roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
        let totalMatches = roundMatches;
        // console.log(custom);

        // First Round
        for (let i = 0; i < seeds.length; i += 2) {
            const p1Id = participants[seeds[i] - 1];
            let isBye = true;

            const p2Id = participants[seeds[i + 1] - 1];

            if (participants[seeds[i + 1] - 1] != undefined && participants[seeds[i] - 1] != undefined) {
                isBye = false;
            }
            if (isBye) {
                let nextMatch = Math.floor(i / 2 / 2) + roundMatches + 1;
                byePlayers.push({ match: nextMatch, round: 1, matchNum: Math.floor(i / 4), player: p1Id != "" ? p1Id : p2Id });
            }
            let temp = {
                id: i / 2 + 1,
                round: 0,
                matchNum: i / 2,
                p1: p1Id,
                p2: p2Id,
                p1Seed: seeds[i],
                p2Seed: seeds[i + 1],
                bye: isBye
            };
            matches.push(temp);
        }

        for (let i = 1; i < rounds; i++) {
            let x = i + 1;
            roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
            for (let j = 0; j < roundMatches; j++) {
                let p1Id: string;
                let p2Id: string;

                if (byePlayers.some(x => x.round == i && x.matchNum == j)) {
                    let players = byePlayers.filter(x => x.round == i && x.matchNum == j);
                    p1Id = players[0].player;
                    p2Id = players[1].player;
                }
                const temp = {
                    id: totalMatches + j + 1,
                    round: i,
                    matchNum: j,
                    p1: p1Id,
                    p2: p2Id,
                    p1Seed: seeds[i],
                    p2Seed: seeds[i + 1]
                };
                matches.push(temp);
            }
            if (settings.type == "double_elim" && roundMatches == 1) {
                const temp = {
                    id: totalMatches + 2,
                    round: i + 1,
                    matchNum: 0,
                    p1: null,
                    p2: null,
                    p1Seed: 0,
                    p2Seed: 0
                };
                matches.push(temp);
            }
            totalMatches += Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
        }
        if (settings.type == "double_elim") {
            const temp = {
                id: totalMatches + 2,
                round: rounds + 1,
                matchNum: 0,
                p1: null,
                p2: null,
                p1Seed: 0,
                p2Seed: 0
            };
            matches.push(temp);
        }
        return matches;
    }

    private async doubleElimMatches(settings: tournament_settings, participants: string[]) {
        let numParticipants = participants.length;

        // Winners round
        let winnersMatches = await this.winnersRoundMatches(settings, participants);

        let losersMatchesCount = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 4;
        let loserIndex = -1;
        let losersMatches: {
            id: number;
            round: number;
            matchNum: number;
            p1: string;
            p2: string;
            p1Seed: number;
            p2Seed: number;
            bye?: boolean;
        }[] = [];

        while (losersMatchesCount > 0) {
            for (let i = 0; i < losersMatchesCount; i++) {
                let isBye = false;
                let winnerEquiv = null;
                if (loserIndex == -1) {
                    winnerEquiv = winnersMatches.find(x => x.round == 0 && x.matchNum == i * 2);
                } else if (loserIndex == -2) {
                    winnerEquiv = winnersMatches.find(x => x.round == 0 && x.matchNum == i * 2 + 1);
                }

                if (loserIndex >= -2 && winnerEquiv?.bye) {
                    isBye = true;
                }
                let temp = {
                    id: winnersMatches.length + i + 1,
                    round: loserIndex,
                    matchNum: i,
                    p1: null,
                    p2: null,
                    p1Seed: 0,
                    p2Seed: 0,
                    bye: isBye
                };
                losersMatches.push(temp);
            }
            if (loserIndex % 2 == 0) {
                losersMatchesCount = Math.floor(losersMatchesCount / 2);
            }
            loserIndex--;
        }
        let allMatches = winnersMatches.concat(losersMatches);
        return allMatches;
    }

    async updateBracket(req: express.Request, res: express.Response) {
        const auth = new authController(req);
        let id = req.params.tourneyId;
        let data = req.body;
        let isAuth = await auth.hasAdminPerms;
        if (!isAuth) return this.unauthorized(res);
        if (data.status == "update") {
            try {
                await BracketService.updateBracketMatch(+data.matchId, {
                    p1Score: +data.p1Score,
                    p2Score: +data.p2Score,
                    status: "in_progress"
                });
            } catch (error) {
                return this.fail(res, error);
            }
            let tmpMatch = await BracketService.bracketMatchData(id, data.matchId);
            this.emitter.emit("bracketMatch", tmpMatch);
            return this.ok(res);
        } else if (data.status == "complete") {
            try {
                await BracketService.updateBracketMatch(+data.matchId, {
                    p1Score: +data.p1Score,
                    p2Score: +data.p2Score,
                    status: "complete"
                });
            } catch (error) {
                return this.fail(res, error);
            }

            const settings = await this.getSettings(id);
            const bracket = await BracketService.bracketData(BigInt(id));
            let thisMatch = bracket.find(x => x.id == data.matchId);
            let winner = "";
            let loser = "";
            if (data.p1Score > data.p2Score) {
                winner = thisMatch.p1.id;
                loser = thisMatch.p2.id;
            } else {
                winner = thisMatch.p2.id;
                loser = thisMatch.p1.id;
            }
            if (settings.type == "single_elim") {
                let winnersRound = thisMatch.round + 1;
                let maxRound = Math.max.apply(
                    Math,
                    bracket.map((x: { round: any }) => x.round)
                );
                if (winnersRound <= maxRound) {
                    let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                    let playerIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                    let nextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == winnersRound && x.matchNum == winnersMatch);
                    try {
                        await BracketService.updateBracketMatch(+nextMatch.id, {
                            [playerIdentifier]: winner
                        });
                        let tmpMatch = await BracketService.bracketMatchData(id, nextMatch.id);
                        this.emitter.emit("bracketMatch", tmpMatch);
                    } catch (error) {
                        return this.fail(res, error);
                    }
                }

                let tmpMatch = await BracketService.bracketMatchData(id, data.matchId);
                this.emitter.emit("bracketMatch", tmpMatch);
                return this.ok(res);
            } else if (settings.type == "double_elim") {
                if (thisMatch.round >= 0) {
                    // winner
                    let winnersRound = thisMatch.round + 1;
                    let maxRound = Math.max.apply(
                        Math,
                        bracket.map((x: { round: any }) => x.round)
                    );
                    if (winnersRound < maxRound) {
                        let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                        let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                        let nextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await BracketService.updateBracketMatch(+nextMatch.id, {
                                [winnerIdentifier]: winner
                            });
                            let tmpMatch = await BracketService.bracketMatchData(id, nextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }

                        // loser
                        let loserRound = -1;
                        let loserMatch = Math.floor(thisMatch.matchNum / 2);
                        let loserIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                        if (thisMatch.round > 0) {
                            loserIdentifier = "p1";
                            loserRound = thisMatch.round * -2;
                            if ((thisMatch.round % 3) % 2 == 0) {
                                loserMatch = thisMatch.matchNum % 2 == 0 ? thisMatch.matchNum + 1 : thisMatch.matchNum - 1;
                            } else {
                                loserMatch = bracket.filter((x: { round: number }) => x.round == 0).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1;
                            }
                            if (maxRound - 2 == thisMatch.round) {
                                loserMatch = 0;
                            }
                        }
                        let loserNextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == loserRound && x.matchNum == loserMatch);
                        while (loserNextMatch.bye) {
                            loserRound--;
                            loserMatch = (loserRound * -1) % 2 == 0 ? loserMatch : Math.floor(loserMatch / 2);
                            if (loserRound == -3) loserIdentifier = loserIdentifier == "p1" ? "p2" : "p1";
                            loserNextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == loserRound && x.matchNum == loserMatch);
                        }
                        try {
                            await BracketService.updateBracketMatch(+nextMatch.id, {
                                [loserIdentifier]: loser
                            });
                            let tmpMatch = await BracketService.bracketMatchData(id, loserNextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    } else if (winnersRound == maxRound && data.p1Score < data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await BracketService.updateBracketMatch(+nextMatch.id, {
                                p1: winner,
                                p2: loser,
                                bye: false
                            });
                            let tmpMatch = await BracketService.bracketMatchData(id, nextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    } else if (winnersRound == maxRound && data.p1Score > data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await BracketService.updateBracketMatch(+nextMatch.id, {
                                bye: true
                            });
                            let tmpMatch = await BracketService.bracketMatchData(id, nextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    }
                } else if (thisMatch.round < 0) {
                    let winnersRound = thisMatch.round - 1;
                    let minRound = Math.min.apply(
                        Math,
                        bracket.map((x: { round: any }) => x.round)
                    );
                    let maxRound = Math.max.apply(
                        Math,
                        bracket.map((x: { round: any }) => x.round)
                    );
                    let winnersMatch = 0;
                    let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                    if (winnersRound > minRound) {
                        winnersMatch = (thisMatch.round * -1) % 2 == 1 ? thisMatch.matchNum : Math.floor(thisMatch.matchNum / 2);
                    } else if (winnersRound == minRound - 1) {
                        winnersRound = maxRound - 1;
                        winnersMatch = 0;
                        winnerIdentifier = "p2";
                    }
                    let nextMatch = bracket.find((x: { round: number; matchNum: number }) => x.round == winnersRound && x.matchNum == winnersMatch);
                    if ((thisMatch.round * -1) % 2 == 1) winnerIdentifier = "p2";
                    try {
                        await BracketService.updateBracketMatch(+nextMatch.id, {
                            [winnerIdentifier]: winner
                        });
                        let tmpMatch = await BracketService.bracketMatchData(id, nextMatch.id);
                        this.emitter.emit("bracketMatch", tmpMatch);
                    } catch (error) {
                        return this.fail(res, error);
                    }
                    return this.ok(res);
                }
            }
            let tmpMatch = await BracketService.bracketMatchData(id, data.matchId);
            this.emitter.emit("bracketMatch", tmpMatch);
            return this.ok(res);
        }
        return this.fail(res, "Something went wrong");
    }

    private seeding(numPlayers: number): Array<number> {
        const nextPlayer = (player: string | any[]) => {
            let out = [];
            let length = player.length * 2 + 1;
            for (const value of player) {
                out.push(value);
                out.push(length - value);
            }
            return out;
        };
        let rounds = Math.log(numPlayers) / Math.log(2) - 1;
        let players = [1, 2];
        for (let i = 0; i < rounds; i++) {
            players = nextPlayer(players);
        }
        return players;
    }
}
