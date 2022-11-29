import express from "express";
import fs from "fs";
import { bracketMatch, updateMatchRequest } from "../models/bracket.model";
import { authRequest } from "../models/models";
import { bslMatch, match, tournamentSettings } from "../models/tournament.models";
import DatabaseService from "../services/database";
import { authController } from "./auth";
import { controller } from "./controller";

export class bracketController extends controller {
    async getBracket(req: express.Request, res: express.Response) {
        let bracketData = await this.bracketData(req.params.id);
        return res.send(bracketData);
    }

    async getBracketMatch(req: express.Request, res: express.Response) {
        let match: bracketMatch | null = await this.bracketMatchData(req.params?.tourneyId, req.params?.matchId);
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
        let timeString = time.toISOString().slice(0, 19).replace("T", " ");
        try {
            await DatabaseService.query("UPDATE bracket SET time = ? WHERE id = ?", [timeString, req.params.id]);
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
            await DatabaseService.query("UPDATE bracket SET best_of = ? WHERE id = ?", [req.body.best_of, req.params.id]);
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
            await DatabaseService.query(`UPDATE bracket SET p1 = ?, p2 = ? WHERE id = ?`, [data.p1, data.p2, data.matchId]);
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
        let id = auth.tourneyId.toString();
        let data = req.body;
        if (!(await auth.hasAdminPerms)) return this.unauthorized(res);
        let matches: Array<match> = [];
        // console.log(data);

        if (data.customPlayers?.length > 0) {
            let tempMatches = await this.generateBracket(id, data.customPlayers);
            for (const match of tempMatches) {
                matches.push({
                    tournamentId: id,
                    round: match.round,
                    matchNum: match.matchNum,
                    p1: match.p1,
                    p2: match.p2,
                    bye: +match.bye || 0
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
                    bye: +match.bye || 0
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
                    bye: +match.bye || 0
                });
            }
        }
        let sqlMatches = [];
        for (const match of matches) {
            sqlMatches.push(Object.values(match));
        }
        try {
            await DatabaseService.query("DELETE FROM bracket WHERE tournamentId = ?", [id]);
            await DatabaseService.query("INSERT INTO bracket (tournamentId, round, matchNum, p1, p2, bye) VALUES ?", [sqlMatches]);
        } catch (error) {
            return this.fail(res, error);
        }
        return this.ok(res);
    }

    async testBracket(id: string, players?: string[], users?: string[]) {
        let settings = await this.getSettings(id);
        let rand = false;
        if (settings.bracket_sort_method == "random") {
            settings.bracket_sort_method = "discordId";
            rand = true;
        }
        let participants: any = [];
        if (!players && !users) {
            participants = await DatabaseService.query(
                `SELECT p.id AS participantId,
            CAST(p.userId AS CHAR) as userId,
            p.forfeit,
            p.seed as seed,
            discordId,
            ssId,
            \`u\`.\`name\`,
            \`u\`.\`twitchName\`,
            \`u\`.\`avatar\`,
            \`u\`.\`globalRank\` as globalRank,
            \`u\`.\`localRank\`,
            \`u\`.\`country\`,
            \`u\`.\`tourneyRank\` as tournamentRank,
            \`u\`.\`TR\`,
            \`u\`.\`pronoun\`
            FROM participants p
            LEFT JOIN users u ON u.discordId = p.userId
            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
            WHERE p.tournamentId = ? ORDER BY ${settings.bracket_sort_method}=0, ${settings.bracket_sort_method} ${rand ? "" : "LIMIT ?"}`,
                [id, settings.bracket_limit]
            ).catch(err => {
                console.error(err);
            });
        } else if (players && !users) {
            participants = players;
        } else if (!players && users) {
            let temp = await DatabaseService.query(
                `SELECT 
            discordId,
            ssId,
            \`u\`.\`name\`,
            \`u\`.\`twitchName\`,
            \`u\`.\`avatar\`,
            \`u\`.\`globalRank\` as globalRank,
            \`u\`.\`localRank\`,
            \`u\`.\`country\`,
            \`u\`.\`tourneyRank\` as tournamentRank,
            \`u\`.\`TR\`,
            \`u\`.\`pronoun\`
            FROM users u
            WHERE u.discordId IN (?) ORDER BY ${settings.bracket_sort_method} = 0, ${settings.bracket_sort_method} ${rand ? "" : "LIMIT ?"}`,
                [users, settings.bracket_limit]
            ).catch(err => {
                console.error(err);
            });
            participants = this.mapOrder(temp, users, "discordId");
            // console.log(participants)
        }

        if (rand) {
            this.shuffle(participants);
        }

        if (participants.length > settings.bracket_limit) participants.length = settings.bracket_limit;

        await DatabaseService.query("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id]);
        if (settings.bracket_sort_method != "seed" && !players) {
            let i = 1;
            for (const participant of participants) {
                await DatabaseService.query(`UPDATE participants SET seed = ? WHERE id = ?`, [i, participant.participantId]);
                i++;
            }
        }

        let matches: any[];
        if (settings.type == "single_elim") {
            matches = await this.winnersRoundMatches(settings, participants, !!players);
        } else if (settings.type == "double_elim") {
            matches = await this.doubleElimMatches(settings, participants, !!players);
        }
        let bracketData = matches;
        matches = [];
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
                    avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                    score: row.p1Score,
                    country: row.p1Country,
                    seed: row.p1Seed,
                    forfeit: row.p1Forfeit,
                    twitch: row.p1Twitch,
                    rank: row.p1Rank
                },
                p2: {
                    id: row.p2,
                    ssId: row.p2ssId,
                    name: row.p2Name,
                    avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                    score: row.p2Score,
                    country: row.p2Country,
                    seed: row.p2Seed,
                    forfeit: row.p2Forfeit,
                    twitch: row.p2Twitch,
                    rank: row.p2Rank
                },
                round: row.round,
                bye: row.bye,
                time: row.time,
                best_of: row.best_of
            };
            matches.push(match);
        }

        return matches;
    }

    async generateBracket(id: string, players?: string[], users?: string[]) {
        // const settings: any = await DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
        let settings = await this.getSettings(id);
        let rand = false;
        if (settings.bracket_sort_method == "random") {
            settings.bracket_sort_method = "discordId";
            rand = true;
        }
        let participants: any = [];
        if (!players && !users) {
            participants = await DatabaseService.query(
                `SELECT p.id AS participantId,
            CAST(p.userId AS CHAR) as userId,
            p.forfeit,
            p.seed as seed,
            discordId,
            ssId,
            \`u\`.\`name\`,
            \`u\`.\`twitchName\`,
            \`u\`.\`avatar\`,
            \`u\`.\`globalRank\` as globalRank,
            \`u\`.\`localRank\`,
            \`u\`.\`country\`,
            \`u\`.\`tourneyRank\` as tournamentRank,
            \`u\`.\`TR\`,
            \`u\`.\`pronoun\`
            FROM participants p
            LEFT JOIN users u ON u.discordId = p.userId
            LEFT JOIN tournament_settings ts ON ts.tournamentId = p.tournamentId
            WHERE p.tournamentId = ? ORDER BY ${settings.bracket_sort_method}=0, ${settings.bracket_sort_method} ${rand ? "" : "LIMIT ?"}`,
                [id, settings.bracket_limit]
            ).catch(err => {
                console.error(err);
            });
        } else if (players && !users) {
            participants = players;
        } else if (!players && users) {
            let temp = await DatabaseService.query(
                `SELECT 
            discordId,
            ssId,
            \`u\`.\`name\`,
            \`u\`.\`twitchName\`,
            \`u\`.\`avatar\`,
            \`u\`.\`globalRank\` as globalRank,
            \`u\`.\`localRank\`,
            \`u\`.\`country\`,
            \`u\`.\`tourneyRank\` as tournamentRank,
            \`u\`.\`TR\`,
            \`u\`.\`pronoun\`
            FROM users u
            WHERE u.discordId IN (?) ORDER BY ${settings.bracket_sort_method} = 0, ${settings.bracket_sort_method} ${rand ? "" : "LIMIT ?"}`,
                [users, settings.bracket_limit]
            ).catch(err => {
                console.error(err);
            });
            participants = this.mapOrder(temp, users, "discordId");
            // console.log(participants)
        }

        if (rand) {
            this.shuffle(participants);
        }

        if (participants.length > settings.bracket_limit) participants.length = settings.bracket_limit;

        await DatabaseService.query("UPDATE participants SET seed = 0 WHERE tournamentId = ?", [id]);
        if (settings.bracket_sort_method != "seed" && !players) {
            let i = 1;
            for (const participant of participants) {
                await DatabaseService.query(`UPDATE participants SET seed = ? WHERE id = ?`, [i, participant.participantId]);
                i++;
            }
        }

        let matches: any[];
        if (settings.type == "single_elim") {
            matches = await this.winnersRoundMatches(settings, participants, !!players);
        } else if (settings.type == "double_elim") {
            matches = await this.doubleElimMatches(settings, participants, !!players);
        }

        return matches;
    }

    private async winnersRoundMatches(settings: tournamentSettings, participants: any, custom = false, doubleElim = false): Promise<any[]> {
        let numParticipants = participants.length;
        let seeds = this.seeding(numParticipants);
        let matches: Array<match> = [];

        let rounds = Math.ceil(Math.log2(numParticipants));
        let byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
        let numMatches = numParticipants - 1;

        let byePlayers = [];
        let roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
        let totalMatches = roundMatches;
        // console.log(custom);

        // First Round
        for (let i = 0; i < seeds.length; i += 2) {
            let p1Id: string,
                p1Name: string,
                p1Avatar: string = "";
            let isBye = true;
            if (participants[seeds[i] - 1] != undefined && !custom) {
                p1Id = participants[seeds[i] - 1].discordId;
                p1Name = participants[seeds[i] - 1].name;
                p1Avatar = participants[seeds[i] - 1].avatar;
            } else if (participants[seeds[i] - 1] != undefined && custom) {
                p1Id = participants[seeds[i] - 1];
                p1Name = participants[seeds[i] - 1];
                p1Avatar = "";
            }
            // console.log(p1Id, p1Name);

            let p2Id: string,
                p2Name: string,
                p2Avatar: string = "";
            if (participants[seeds[i + 1] - 1] != undefined && !custom) {
                p2Id = participants[seeds[i + 1] - 1].discordId;
                p2Name = participants[seeds[i + 1] - 1].name;
                p2Avatar = participants[seeds[i + 1] - 1].avatar;
            } else if (participants[seeds[i + 1] - 1] != undefined && custom) {
                p2Id = participants[seeds[i + 1] - 1];
                p2Name = participants[seeds[i + 1] - 1];
                p2Avatar = "";
            }
            // console.log(participants[seeds[i + 1] - 1])
            // console.log(participants[seeds[i] - 1])
            if (participants[seeds[i + 1] - 1] != undefined && participants[seeds[i] - 1] != undefined) {
                isBye = false;
            }
            if (isBye) {
                let nextMatch = Math.floor(i / 2 / 2) + roundMatches + 1;
                byePlayers.push({ match: nextMatch, round: 1, matchNum: Math.floor(i / 4), player: p1Id != "" ? p1Id : p2Id });
            }
            let temp: bslMatch = {
                id: i / 2 + 1,
                round: 0,
                matchNum: i / 2,
                p1: p1Id,
                p2: p2Id,
                p1Score: 0,
                p2Score: 0,
                status: "",
                p1Rank: 0,
                p2Rank: 0,
                p1Seed: seeds[i],
                p2Seed: seeds[i + 1],
                p1Name: p1Name,
                p2Name: p2Name,
                p1Country: "",
                p2Country: "",
                p1Avatar: p1Avatar,
                p2Avatar: p2Avatar,
                bye: isBye
            };
            matches.push(temp);
        }
        // console.log(byePlayers);
        for (let i = 1; i < rounds; i++) {
            let x = i + 1;
            roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
            for (let j = 0; j < roundMatches; j++) {
                let p1Id: string,
                    p1Name: string,
                    p1Avatar: string = "";
                let p2Id: string,
                    p2Name: string,
                    p2Avatar: string = "";
                // if (byePlayers.some(x => x.match == totalMatches + j + 1)) {
                if (byePlayers.some(x => x.round == i && x.matchNum == j)) {
                    let players = byePlayers.filter(x => x.round == i && x.matchNum == j);
                    // console.log(players);
                    if (players[0] != undefined && !custom) {
                        p1Id = participants.find(x => x.discordId == players[0].player).discordId;
                        p1Name = participants.find(x => x.discordId == players[0].player).name;
                        p1Avatar = participants.find(x => x.discordId == players[0].player).avatar;
                    } else if (players[0] != undefined && custom) {
                        p1Id = players[0].player;
                    }
                    if (players[1] != undefined && !custom) {
                        p2Id = participants.find(x => x.discordId == players[1].player).discordId;
                        p2Name = participants.find(x => x.discordId == players[1].player).name;
                        p2Avatar = participants.find(x => x.discordId == players[1].player).avatar;
                    } else if (players[1] != undefined && custom) {
                        p2Id = players[1].player;
                    }
                }
                let temp: bslMatch = {
                    id: totalMatches + j + 1,
                    round: i,
                    matchNum: j,
                    p1: p1Id,
                    p2: p2Id,
                    p1Score: 0,
                    p2Score: 0,
                    status: "",
                    p1Rank: 0,
                    p2Rank: 0,
                    p1Seed: seeds[i],
                    p2Seed: seeds[i + 1],
                    p1Name: p1Name,
                    p2Name: p2Name,
                    p1Country: "",
                    p2Country: "",
                    p1Avatar: p1Avatar,
                    p2Avatar: p2Avatar
                };
                matches.push(temp);
            }
            if (settings.type == "double_elim" && roundMatches == 1) {
                let temp: bslMatch = {
                    id: totalMatches + 2,
                    round: i + 1,
                    matchNum: 0,
                    p1: null,
                    p2: null,
                    p1Score: 0,
                    p2Score: 0,
                    status: "",
                    p1Rank: 0,
                    p2Rank: 0,
                    p1Seed: 0,
                    p2Seed: 0,
                    p1Name: "",
                    p2Name: "",
                    p1Country: "",
                    p2Country: "",
                    p1Avatar: "",
                    p2Avatar: ""
                };
                matches.push(temp);
            }
            totalMatches += Math.pow(2, Math.ceil(Math.log2(numParticipants))) / Math.pow(2, x);
        }
        if (settings.type == "double_elim") {
            let temp: bslMatch = {
                id: totalMatches + 2,
                round: rounds + 1,
                matchNum: 0,
                p1: null,
                p2: null,
                p1Score: 0,
                p2Score: 0,
                status: "",
                p1Rank: 0,
                p2Rank: 0,
                p1Seed: 0,
                p2Seed: 0,
                p1Name: "",
                p2Name: "",
                p1Country: "",
                p2Country: "",
                p1Avatar: "",
                p2Avatar: ""
            };
            matches.push(temp);
        }
        return matches;
    }

    private async doubleElimMatches(settings: tournamentSettings, participants: any, custom = false): Promise<any[]> {
        let numParticipants = participants.length;
        let seeds = this.seeding(numParticipants);
        let matches: Array<match> = [];

        let rounds = Math.log2(numParticipants);
        let byes = Math.pow(2, Math.ceil(Math.log2(numParticipants))) - numParticipants;
        let numMatches = numParticipants - 1;

        let byePlayers = [];
        let roundMatches = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 2;
        let totalMatches = roundMatches;

        // Winners round
        let winnersMatches = await this.winnersRoundMatches(settings, participants, custom);

        let losersMatchesCount = Math.pow(2, Math.ceil(Math.log2(numParticipants))) / 4;
        let loserIndex = -1;
        let losersMatches: Array<match> = [];
        while (losersMatchesCount > 0) {
            for (let i = 0; i < losersMatchesCount; i++) {
                let isBye = false;
                let winnerEquiv = null;
                if (loserIndex == -1) {
                    winnerEquiv = winnersMatches.find(x => x.round == 0 && x.matchNum == i * 2);
                } else if (loserIndex == -2) {
                    winnerEquiv = winnersMatches.find(x => x.round == 0 && x.matchNum == i * 2 + 1);
                }
                // console.log(winnerEquiv);
                if (loserIndex >= -2 && winnerEquiv?.bye) {
                    isBye = true;
                    // console.log(true);
                }
                let temp: bslMatch = {
                    id: winnersMatches.length + i + 1,
                    round: loserIndex,
                    matchNum: i,
                    p1: null,
                    p2: null,
                    p1Score: 0,
                    p2Score: 0,
                    status: "",
                    p1Rank: 0,
                    p2Rank: 0,
                    p1Seed: 0,
                    p2Seed: 0,
                    p1Name: "",
                    p2Name: "",
                    p1Country: "",
                    p2Country: "",
                    p1Avatar: "",
                    p2Avatar: "",
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
                await DatabaseService.query('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "in_progress" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId]);
            } catch (error) {
                return this.fail(res, error);
            }
            let tmpMatch = await this.bracketMatchData(id, data.matchId);
            this.emitter.emit("bracketMatch", tmpMatch);
            return this.ok(res);
        } else if (data.status == "complete") {
            try {
                await DatabaseService.query('UPDATE bracket SET p1Score = ?, p2Score = ?, status = "complete" WHERE id = ?', [+data.p1Score, +data.p2Score, data.matchId]);
            } catch (error) {
                return this.fail(res, error);
            }

            // const settings: any = await DatabaseService.query("SELECT * FROM tournament_settings WHERE tournamentId = ?", [id]);
            const settings: any = await this.getSettings(id);
            const bracket = await this.bracketDataOld(id);
            let thisMatch: bslMatch = bracket.find(x => x.id == data.matchId);
            let winner = "";
            let loser = "";
            if (data.p1Score > data.p2Score) {
                winner = thisMatch.p1;
                loser = thisMatch.p2;
            } else {
                winner = thisMatch.p2;
                loser = thisMatch.p1;
            }
            if (settings.type == "single_elim") {
                let winnersRound = thisMatch.round + 1;
                let maxRound = Math.max.apply(
                    Math,
                    bracket.map(x => x.round)
                );
                if (winnersRound <= maxRound) {
                    let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                    let playerIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                    let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                    try {
                        await DatabaseService.query("UPDATE bracket SET ?? = ? WHERE id = ?", [playerIdentifier, winner, nextMatch.id]);
                        let tmpMatch = await this.bracketMatchData(id, nextMatch.id);
                        this.emitter.emit("bracketMatch", tmpMatch);
                    } catch (error) {
                        return this.fail(res, error);
                    }
                }

                let tmpMatch = await this.bracketMatchData(id, data.matchId);
                this.emitter.emit("bracketMatch", tmpMatch);
                return this.ok(res);
            } else if (settings.type == "double_elim") {
                if (thisMatch.round >= 0) {
                    // winner
                    let winnersRound = thisMatch.round + 1;
                    let maxRound = Math.max.apply(
                        Math,
                        bracket.map(x => x.round)
                    );
                    if (winnersRound < maxRound) {
                        let winnersMatch = Math.floor(thisMatch.matchNum / 2);
                        let winnerIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await DatabaseService.query("UPDATE bracket SET ?? = ? WHERE id = ?", [winnerIdentifier, winner, nextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(id, nextMatch.id);
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
                                loserMatch = bracket.filter(x => x.round == 0).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1;
                            }
                            if (maxRound - 2 == thisMatch.round) {
                                loserMatch = 0;
                            }
                        }
                        let loserNextMatch = bracket.find(x => x.round == loserRound && x.matchNum == loserMatch);
                        while (loserNextMatch.bye) {
                            loserRound--;
                            loserMatch = (loserRound * -1) % 2 == 0 ? loserMatch : Math.floor(loserMatch / 2);
                            if (loserRound == -3) loserIdentifier = loserIdentifier == "p1" ? "p2" : "p1";
                            loserNextMatch = bracket.find(x => x.round == loserRound && x.matchNum == loserMatch);
                        }
                        try {
                            await DatabaseService.query("UPDATE bracket SET ?? = ? WHERE id = ?", [loserIdentifier, loser, loserNextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(id, loserNextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    } else if (winnersRound == maxRound && data.p1Score < data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await DatabaseService.query("UPDATE bracket SET p1 = ?, p2 = ?, bye = 0 WHERE id = ?", [winner, loser, nextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(id, nextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    } else if (winnersRound == maxRound && data.p1Score > data.p2Score) {
                        let winnersMatch = 0;
                        let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                        try {
                            await DatabaseService.query("UPDATE bracket SET bye = 1 WHERE id = ?", [nextMatch.id]);
                            let tmpMatch = await this.bracketMatchData(id, nextMatch.id);
                            this.emitter.emit("bracketMatch", tmpMatch);
                        } catch (error) {
                            return this.fail(res, error);
                        }
                    }
                } else if (thisMatch.round < 0) {
                    let winnersRound = thisMatch.round - 1;
                    let minRound = Math.min.apply(
                        Math,
                        bracket.map(x => x.round)
                    );
                    let maxRound = Math.max.apply(
                        Math,
                        bracket.map(x => x.round)
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
                    let nextMatch = bracket.find(x => x.round == winnersRound && x.matchNum == winnersMatch);
                    if ((thisMatch.round * -1) % 2 == 1) winnerIdentifier = "p2";
                    try {
                        await DatabaseService.query("UPDATE bracket SET ?? = ? WHERE id = ?", [winnerIdentifier, winner, nextMatch.id]);
                        let tmpMatch = await this.bracketMatchData(id, nextMatch.id);
                        this.emitter.emit("bracketMatch", tmpMatch);
                    } catch (error) {
                        return this.fail(res, error);
                    }
                    return this.ok(res);
                }
            }
            let tmpMatch = await this.bracketMatchData(id, data.matchId);
            this.emitter.emit("bracketMatch", tmpMatch);
            return this.ok(res);
        }
        return this.fail(res, "Something went wrong");
    }

    private async bracketData(id: number | string) {
        const settings: any = await this.getSettings(id);
        const bracketData: any = await DatabaseService.query(
            `SELECT bracket.*,
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
        u1.ssId as p1ssId,
        u2.ssId as p2ssId,
        par1.seed as p1Seed,
        par2.seed as p2Seed
        
        FROM bracket
        LEFT JOIN users u1 ON bracket.p1 = u1.discordId
        LEFT JOIN users u2 ON bracket.p2 = u2.discordId
        LEFT JOIN participants par1 ON (u1.discordId = par1.userId AND bracket.tournamentId = par1.tournamentId)
        LEFT JOIN participants par2 ON (u2.discordId = par2.userId AND bracket.tournamentId = par2.tournamentId)
        WHERE bracket.tournamentId = ? `,
            [id]
        );

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
                    avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                    score: row.p1Score,
                    country: row.p1Country,
                    seed: row.p1Seed,
                    forfeit: row.p1Forfeit,
                    twitch: row.p1Twitch,
                    rank: row.p1Rank
                },
                p2: {
                    id: row.p2,
                    ssId: row.p2ssId,
                    name: row.p2Name,
                    avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                    score: row.p2Score,
                    country: row.p2Country,
                    seed: row.p2Seed,
                    forfeit: row.p2Forfeit,
                    twitch: row.p2Twitch,
                    rank: row.p2Rank
                },
                round: row.round,
                bye: row.bye,
                time: row.time,
                best_of: row.best_of
            };
            matches.push(match);
        }

        // set loser text
        if (settings.type == "double_elim") {
            const bracket = await this.bracketDataOld(id);
            let maxRound = Math.max.apply(
                Math,
                matches.map(x => x.round)
            );
            for (const match of matches) {
                if (match.round >= 0) {
                    let thisMatch = match;
                    let loserRound = -1;
                    let loserMatch = Math.floor(thisMatch.matchNum / 2);
                    let loserIdentifier = thisMatch.matchNum % 2 == 0 ? "p1" : "p2";
                    if (thisMatch.round > 0) {
                        loserIdentifier = "p1";
                        loserRound = thisMatch.round * -2;
                        if ((thisMatch.round % 3) % 2 == 0) {
                            loserMatch = thisMatch.matchNum % 2 == 0 ? thisMatch.matchNum + 1 : thisMatch.matchNum - 1;
                        } else {
                            loserMatch = bracket.filter(x => x.round == 0).length / Math.pow(2, thisMatch.round) - thisMatch.matchNum - 1;
                        }
                        if (maxRound - 2 == thisMatch.round) {
                            loserMatch = 0;
                        }
                    }
                    let loserNextMatch = bracket.find(x => x.round == loserRound && x.matchNum == loserMatch);
                    while (loserNextMatch?.bye) {
                        loserRound--;
                        loserMatch = (loserRound * -1) % 2 == 0 ? loserMatch : Math.floor(loserMatch / 2);
                        if (loserRound == -3) loserIdentifier = loserIdentifier == "p1" ? "p2" : "p1";
                        loserNextMatch = bracket.find(x => x.round == loserRound && x.matchNum == loserMatch);
                    }
                    if (loserNextMatch) matches[matches.findIndex(x => x.id == loserNextMatch.id)][`${loserIdentifier}_prereq_identifier`] = match.id;
                }
            }
        }

        return matches;
    }

    private async bracketDataOld(id: number | string) {
        const bracketData: any = await DatabaseService.query(
            `SELECT bracket.*,
        u1.globalRank as p1Rank,
        u2.globalRank as p2Rank,
        u1.ssId as p1ssId,
        u2.ssId as p2ssId,
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
        WHERE bracket.tournamentId = ? `,
            [id]
        );
        return bracketData;
    }

    private async bracketMatchData(tourneyId: string | number, matchId: string | number) {
        const matchData = await DatabaseService.query<any>(
            `SELECT bracket.*,
        u1.globalRank as p1GlobalRank,
        u2.globalRank as p2GlobalRank,
        u1.ssId as p1ssId,
        u2.ssId as p2ssId,
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
        WHERE bracket.id = ? AND bracket.tournamentId = ?`,
            [matchId, tourneyId]
        );
        if (Array.isArray(matchData) && matchData.length < 1) return null;
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
                avatar: row.p1Avatar ? `/${row.p1Avatar}` + (row.p1Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                score: row.p1Score,
                country: row.p1Country,
                seed: row.p1Seed,
                forfeit: row.p1Forfeit,
                twitch: row.p1Twitch,
                rank: row.p1GlobalRank
            },
            p2: {
                id: row.p2,
                ssId: row.p2ssId,
                name: row.p2Name,
                avatar: row.p2Avatar ? `/${row.p2Avatar}` + (row.p2Avatar?.substring(0, 2) == "a_" ? ".gif" : ".webp") : null,
                score: row.p2Score,
                country: row.p2Country,
                seed: row.p2Seed,
                forfeit: row.p2Forfeit,
                twitch: row.p2Twitch,
                rank: row.p2GlobalRank
            },
            round: row.round,
            bye: row.bye,
            time: row.time,
            best_of: row.best_of
        };
        return match;
    }

    private seeding(numPlayers: number): Array<number> {
        const nextPlayer = player => {
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

    private shuffle(array) {
        let currentIndex = array.length,
            temporaryValue,
            randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    private mapOrder(array, order, key) {
        array.sort(function (a, b) {
            var A = a[key],
                B = b[key];
            if (order.indexOf(A) > order.indexOf(B)) {
                return 1;
            } else {
                return -1;
            }
        });
        return array;
    }
}
