import axios from "axios";
import express from "express";
import FormData from "form-data";
import sharp from "sharp";
import { PlayerInfo } from "../models/scoresaber.model";
import { userAPI } from "../models/user.model";
import DatabaseService from "../services/database";
import { authController } from "./auth";
import { controller } from "./controller";

export class userController extends controller {
    redirect = "";

    constructor() {
        super();
        if (this.env == "production") {
            this.redirect = encodeURIComponent("https://beatkhana.com/api/discordAuth");
        } else {
            this.redirect = encodeURIComponent("http://localhost:4200/api/discordAuth");
        }
    }

    async me(req: express.Request, res: express.Response) {
        let tmp = req.session?.user;
        if (tmp) delete tmp.refresh_token;
        return res.send(tmp);
    }

    async getUser(req: express.Request, res: express.Response) {
        if (!req.params.id) return this.clientError(res, "No Id provided");
        let user = await this.userById(req.params.id);
        return res.send(user);
    }

    async allUsers(req: express.Request, res: express.Response) {
        let users = await DatabaseService.query(`SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, 
        discordId,
        ssId,
        \`users\`.\`name\`,
        \`users\`.\`twitchName\`,
        \`users\`.\`avatar\`,
        \`users\`.\`globalRank\`,
        \`users\`.\`localRank\`,
        \`users\`.\`country\`,
        \`users\`.\`tourneyRank\`,
        \`users\`.\`TR\`,
        \`users\`.\`pronoun\`, 
        GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames
        FROM users
        LEFT JOIN roleassignment ra ON ra.userId = users.discordId
        LEFT JOIN roles r ON r.roleId = ra.roleId
        GROUP BY users.discordId`);
        return res.send(users);
    }

    async userBySS(req: express.Request, res: express.Response) {
        let result = await DatabaseService.query(
            `SELECT u.discordId, u.ssId, u.name, u.twitchName, u.avatar, u.globalRank, u.localRank, u.country, u.tourneyRank, u.TR, u.pronoun, GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tournaments FROM users u
        LEFT JOIN participants p ON p.userId = u.discordId
        LEFT JOIN tournaments t ON p.tournamentId = t.id
        WHERE u.ssId = ?
        GROUP BY u.discordId`,
            [req.params.id]
        );

        return res.send(result);
    }

    async updateUser(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || req.params.id == auth.userId;
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let id = req.params.id;
        let roleIds = [];
        let roleError = false;
        if (data.roleIds != null && data.roleIds.length > 0) {
            roleIds = data.roleIds;
            let insert = [];
            for (const roleId of roleIds) {
                insert.push([id, roleId]);
            }

            try {
                await DatabaseService.query(`DELETE FROM roleassignment WHERE userId = ?;`, [id]);
                await DatabaseService.query(`INSERT INTO roleassignment (userId, roleId) VALUES ?`, [insert]);
            } catch (error) {
                return this.fail(res, error);
            }
        }
        try {
            delete data.roleIds;
            await DatabaseService.query(`UPDATE users SET ? WHERE discordId = ?`, [data, id]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async updateUserBadges(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.isAdmin) || (await auth.isStaff))) return this.unauthorized(res);
        if (!req.params.id) return this.clientError(res, "No user ID provided");
        if (!req.body) return this.clientError(res, "Invalid request");
        try {
            await DatabaseService.query("DELETE FROM badge_assignment WHERE userId = ?", [req.params.id]);
            if (req.body.length > 0) {
                let insetData = req.body.map(x => [x, req.params.id]);
                await DatabaseService.query(`INSERT INTO badge_assignment (badgeId, userId) VALUES ?`, [insetData]);
            }
            // console.log(insetData);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async createBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!(await auth.isAdmin)) return this.unauthorized(res);
        let data = req.body;
        let base64String = data.image;
        let base64Img = base64String.split(";base64,").pop();

        let savePath = this.env == "development" ? "../app/src/assets/badges/" : __dirname + "/../public/assets/badges/";

        try {
            data.imgName = data.imgName.split(".")[0];
            data.imgName = data.imgName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            await DatabaseService.query("INSERT INTO badges (image, description) VALUES (?, ?)", [data.imgName, data.description]);

            const buf = await Buffer.from(base64Img, "base64");
            const webpData = await sharp(buf)
                .resize({ width: 80, height: 30 })
                .png()
                // .webp({ lossless: true, quality: 50 })
                .toBuffer();

            await sharp(webpData).toFile(savePath + data.imgName + ".png");
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async updateBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.isAdmin) || (await auth.isStaff))) return this.unauthorized(res);

        let data = req.body;

        try {
            data.imgName = data.imgName.split(".")[0];
            data.imgName = data.imgName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            await DatabaseService.query("UPDATE badges SET image = ?, description = ? WHERE id = ?", [data.imgName, data.description, req.params.id]);

            if (data.image != "") {
                let base64String = data.image;
                let base64Img = base64String.split(";base64,").pop();

                let savePath = this.env == "development" ? "../app/src/assets/badges/" : __dirname + "/../public/assets/badges/";
                const buf = await Buffer.from(base64Img, "base64");
                const webpData = await sharp(buf)
                    .resize({ width: 80, height: 30 })
                    .png()
                    // .webp({ lossless: true, quality: 50 })
                    .toBuffer();

                await sharp(webpData).toFile(savePath + data.imgName + ".png");
            }
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async deleteBadge(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.isAdmin) || (await auth.isStaff))) return this.unauthorized(res);

        try {
            await DatabaseService.query("DELETE FROM badges WHERE id = ?", [req.params.id]);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getBadges(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.isAdmin) || (await auth.isStaff))) return this.unauthorized(res);
        try {
            let badges = await DatabaseService.query("SELECT * FROM badges");
            return res.send(badges);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    private async userById(id): Promise<userAPI> {
        let userData2 = await DatabaseService.query(
            `SELECT 
            u.discordId, 
            u.ssId, 
            u.name, 
            u.twitchName, 
            u.avatar, 
            u.globalRank, 
            u.localRank, 
            u.country, 
            u.tourneyRank, 
            u.TR, 
            u.pronoun
        FROM users u
        WHERE u.discordId = ?`,
            [id]
        );
        let badges = await DatabaseService.query(
            `SELECT b.* FROM badges b
        LEFT JOIN badge_assignment ba ON ba.badgeId = b.id
        WHERE ba.userId = ?`,
            [id]
        );
        let tournaments = (await DatabaseService.query(
            `SELECT t.name FROM participants p 
        INNER JOIN tournaments t ON p.tournamentId = t.id
        INNER JOIN tournament_settings ts ON p.tournamentId = ts.tournamentId AND ts.public = 1
        WHERE p.userId = ?`,
            [id]
        )) as any[];
        let user = userData2[0];
        if (!user) return null;
        user.tournaments = tournaments.map(x => x.name);
        user.badges = badges;
        return user;
    }

    static async getSSData(id: string): Promise<PlayerInfo | null> {
        function delay(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const res = await fetch(`https://scoresaber.com/api/player/${id}/full`);
        if (parseInt(res.headers.get("x-ratelimit-remaining") ?? "0") < 10) {
            let d1 = new Date(parseInt(res.headers.get("x-ratelimit-reset") ?? "0") * 1000);
            let d2 = new Date();
            // console.log(`Waiting ${(d1.getTime() - (new Date()).getTime()) / 1000} seconds...`);
            await delay(d1.getTime() - d2.getTime());
        }
        try {
            return await res.json();
        } catch (error) {
            return null;
        }
    }

    // discord auth
    async login(req: express.Request, res: express.Response) {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${this.CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${this.redirect}&state=${req.query.url}`);
    }

    async logOut(req: express.Request, res: express.Response) {
        req.session.destroy(() => {});
        res.redirect("/");
    }

    async discordAuth(req: express.Request, res: express.Response) {
        if (req.query.code) {
            const code = <string>req.query.code;
            const data = new FormData();

            // beatkhana
            data.append("client_id", this.CLIENT_ID);
            data.append("client_secret", this.CLIENT_SECRET);

            data.append("grant_type", "authorization_code");

            const env = process.env.NODE_ENV || "production";
            let redirect = "";
            if (env == "production") {
                redirect = "https://beatkhana.com/api/discordAuth";
            } else {
                redirect = "http://localhost:4200/api/discordAuth";
            }

            data.append("redirect_uri", redirect);
            data.append("scope", "identify");
            data.append("code", code);

            let refresh_token: string | null = null;

            axios
                .post("https://discord.com/api/oauth2/token", {
                    method: "POST",
                    body: data
                })
                .then(discordRes => discordRes.data)
                .then(info => {
                    refresh_token = info.refresh_token;
                    return info;
                })
                .then(info =>
                    fetch("https://discord.com/api/users/@me", {
                        headers: {
                            authorization: `${info.token_type} ${info.access_token}`
                        }
                    })
                )
                .then(userRes => userRes.json())
                .then(data => {
                    this.checkUser(data.id, refresh_token, data.avatar, data.username, (userRes, newUser) => {
                        if (!newUser) {
                            req.session.user = userRes;
                            if (req.query.state != undefined) {
                                res.redirect(`${req.query.state}`);
                            } else {
                                res.redirect("/");
                            }
                        } else {
                            req.session.newUsr = userRes;
                            res.redirect("/sign-up");
                        }
                    });
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        } else {
            res.redirect("/");
        }
    }

    private async checkUser(discordId, refreshToken: string | null, avatar: string, name: string, callback: Function) {
        if (discordId) {
            const result = (await DatabaseService.query(`SELECT GROUP_CONCAT(DISTINCT ra.roleId SEPARATOR ', ') as roleIds, users.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') as roleNames
            FROM users
            LEFT JOIN roleassignment ra ON ra.userId = users.discordId
            LEFT JOIN roles r ON r.roleId = ra.roleId
            WHERE users.discordId = ${discordId}
            GROUP BY users.discordId`)) as any[];
            if (result.length > 0) {
                result[0].discordId = discordId.toString();
                if (result[0].roleNames != null) {
                    result[0].roleIds = result[0].roleIds.split(", ");
                    result[0].roleNames = result[0].roleNames.split(", ");
                } else {
                    result[0].roleIds = [];
                    result[0].roleNames = [];
                }
                if (refreshToken != null) {
                    try {
                        await DatabaseService.query("UPDATE users SET refresh_token = ? WHERE discordId = ?", [refreshToken, discordId]);
                    } catch (error) {
                        throw error;
                    }
                }
                callback(result);
            } else {
                callback(
                    [
                        {
                            discordId: discordId.toString(),
                            refresh_token: refreshToken,
                            avatar: avatar,
                            name: name
                        }
                    ],
                    true
                );
            }
        }
    }

    async newUser(req: express.Request, res: express.Response) {
        if (req.session?.newUsr?.length > 0) {
            let usrData = { links: req.body, discordId: req.session.newUsr[0]["discordId"], refresh_token: req.session.newUsr[0]["refresh_token"], avatar: req.session.newUsr[0]["avatar"], name: req.session.newUsr[0]["name"] };
            let ssData: PlayerInfo = null;
            if (usrData.links.scoreSaber) ssData = await userController.getSSData(usrData.links.scoreSaber.split("u/")[1]);
            if (!usrData.avatar) {
                usrData.avatar = "-";
            }
            let user = {
                discordId: usrData.discordId,
                ssId: ssData.id,
                name: usrData.name,
                twitchName: usrData.links.twitch.split("twitch.tv/")[1],
                avatar: usrData.avatar,
                globalRank: ssData?.rank ?? 0,
                localRank: ssData?.countryRank ?? 0,
                country: ssData?.country ?? "",
                pronoun: usrData.links.pronoun,
                refresh_token: usrData.refresh_token
            };
            try {
                await DatabaseService.query(`INSERT INTO users SET ?`, [user]);
                let loggedUser: any = user;
                loggedUser.roleIds = [];
                loggedUser.roleNames = [];
                req.session.user = [loggedUser];
                return res.send([loggedUser]);
            } catch (error) {
                return this.fail(res, error);
            }
        } else {
            return this.clientError(res, "Invalid discord data");
        }
    }

    async questId(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!auth.userId) return this.clientError(res, "User not logged in");

        let ids = (await DatabaseService.query(`SELECT * FROM quest_ids WHERE userId = ?`, [auth.userId])) as any[];
        let curId = 0;
        if (ids.length < 1) {
            let id = this.generate(20);
            while (!(await DatabaseService.query(`INSERT INTO quest_ids SET userId = ?, qId = ?`, [auth.userId, id]))) {
                id = this.generate(20);
            }
            curId = id;
        } else {
            curId = ids[0].qId;
        }

        res.setHeader("Content-disposition", `attachment; filename= secret.txt`);
        res.setHeader("Content-type", "text/plain; charset=UTF-8");
        return res.send(`quest_${curId}`);
    }

    private generate(n) {
        var add = 1,
            max = 12 - add;
        if (n > max) {
            return this.generate(max) + this.generate(n - max);
        }
        max = Math.pow(10, n + add);
        var min = max / 10; // Math.pow(10, n) basically
        var number = Math.floor(Math.random() * (max - min + 1)) + min;

        return ("" + number).substring(add);
    }
}
