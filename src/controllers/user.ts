import axios from "axios";
import express from "express";
import sharp from "sharp";
import { Scoresaber } from "../models/scoresaber.model";
import { BadgeService } from "../services/badge";
import { UserService } from "../services/user";
import config from "../util/config";
import { formUrlEncoded } from "../util/helpers";
import { authController } from "./auth";
import { controller } from "./controller";

export class userController extends controller {
    async me(req: express.Request, res: express.Response) {
        let tmp = req.session?.user;
        if (!tmp) return this.unauthorized(res, "Not logged in");
        return res.send(await UserService.getUser({ discordId: tmp[0].discordId }));
    }

    async getUser(req: express.Request, res: express.Response) {
        if (!req.params.id) return this.clientError(res, "No Id provided");
        let user = await UserService.getUser({ discordId: req.params.id });
        return res.send(user);
    }

    async allUsers(req: express.Request, res: express.Response) {
        const auth = new authController(req);
        if (!(await auth.isStaff)) return this.unauthorized(res);
        return res.send(await UserService.allUsers());
    }

    async userBySS(req: express.Request, res: express.Response) {
        if (!req.params.id) return this.clientError(res, "No Id provided");
        return res.send(await UserService.getUser({ ssId: req.params.id }));
    }

    async updateUser(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        let isAuth = (await auth.hasAdminPerms) || req.params.id == auth.userId;
        if (!isAuth) return this.unauthorized(res);
        let data = req.body;
        let id = req.params.id;
        let roleIds = [];

        if (data.roleIds != null && data.roleIds.length > 0) {
            roleIds = data.roleIds;
            let insert: { userId: string; roleId: number }[] = [];
            for (const roleId of roleIds) {
                insert.push({
                    userId: id,
                    roleId: roleId
                });
            }

            try {
                await UserService.clearRoles(id);
                await UserService.addRoles(insert);
            } catch (error) {
                return this.fail(res, error);
            }
        }
        try {
            delete data.roleIds;
            await UserService.updateUser(id, data);
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
            await BadgeService.clearBadgesFromUser(req.params.id);
            if (req.body.length > 0) {
                let insetData = req.body.map(x => {
                    return {
                        badgeId: x,
                        userId: req.params.id
                    };
                });
                await BadgeService.addBadgesToUser(insetData);
            }
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
            await BadgeService.createBadge({
                image: data.imgName,
                description: data.description
            });

            const buf = Buffer.from(base64Img, "base64");
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
            await BadgeService.updateBadge(+req.params.id, {
                image: data.imgName,
                description: data.description
            });

            if (data.image != "") {
                let base64String = data.image;
                let base64Img = base64String.split(";base64,").pop();

                let savePath = this.env == "development" ? "../app/src/assets/badges/" : __dirname + "/../public/assets/badges/";
                const buf = Buffer.from(base64Img, "base64");
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
            await BadgeService.deleteBadge(+req.params.id);
            return this.ok(res);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async getBadges(req: express.Request, res: express.Response) {
        let auth = new authController(req);
        if (!((await auth.isAdmin) || (await auth.isStaff))) return this.unauthorized(res);
        try {
            let badges = await BadgeService.getBadges();
            return res.send(badges);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    static async getSSData(id: string): Promise<Scoresaber.Player | null> {
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
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientID}&scope=identify&response_type=code&redirect_uri=${config.discord.redirect}&state=${req.query.url}`);
    }

    async logOut(req: express.Request, res: express.Response) {
        req.session.destroy(() => {});
        res.redirect("/");
    }

    async discordAuth(req: express.Request, res: express.Response) {
        if (req.query.code) {
            const code = <string>req.query.code;

            const env = process.env.NODE_ENV || "production";

            const data = {
                client_id: config.discord.clientID,
                client_secret: config.discord.clientSecret,
                grant_type: "authorization_code",
                redirect_uri: config.discord.redirect,
                scope: "identify",
                code: code
            };

            let refresh_token: string | null = null;

            try {
                let tokenReq = await axios.request({
                    method: "post",
                    data: formUrlEncoded(data),
                    url: "https://discord.com/api/oauth2/token",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });

                if (tokenReq.data.refresh_token) {
                    refresh_token = tokenReq.data.refresh_token;
                } else {
                    console.log(tokenReq);
                    throw new Error("No refresh token");
                }
                const info = tokenReq.data;

                let userReq = await axios.request({
                    method: "get",
                    url: "https://discord.com/api/users/@me",
                    headers: { Authorization: `${info.token_type} ${info.access_token}` }
                });

                if (!userReq.data.id) throw new Error("No user id");
                const responseData = userReq.data;
                this.checkUser(responseData.id, refresh_token, responseData.avatar, responseData.username, (userRes, newUser) => {
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
            } catch (error) {
                console.log(error);
                res.redirect("/");
            }
        } else {
            res.redirect("/");
        }
    }

    private async checkUser(discordId: string, refreshToken: string | null, avatar: string, name: string, callback: Function) {
        if (discordId) {
            const result = await UserService.getUser({ discordId: discordId });
            if (result) {
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
                        await UserService.updateUser(discordId, { refresh_token: refreshToken });
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
            let ssData: Scoresaber.Player = null;
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
                await UserService.createUser(user);
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

    // TODO: refactor this
    // async questId(req: express.Request, res: express.Response) {
    //     let auth = new authController(req);
    //     if (!auth.userId) return this.clientError(res, "User not logged in");

    //     let ids = (await DatabaseService.query(`SELECT * FROM quest_ids WHERE userId = ?`, [auth.userId])) as any[];
    //     let curId = 0;
    //     if (ids.length < 1) {
    //         let id = this.generate(20);
    //         while (!(await DatabaseService.query(`INSERT INTO quest_ids SET userId = ?, qId = ?`, [auth.userId, id]))) {
    //             id = this.generate(20);
    //         }
    //         curId = id;
    //     } else {
    //         curId = ids[0].qId;
    //     }

    //     res.setHeader("Content-disposition", `attachment; filename= secret.txt`);
    //     res.setHeader("Content-type", "text/plain; charset=UTF-8");
    //     return res.send(`quest_${curId}`);
    // }

    // private generate(n) {
    //     var add = 1,
    //         max = 12 - add;
    //     if (n > max) {
    //         return this.generate(max) + this.generate(n - max);
    //     }
    //     max = Math.pow(10, n + add);
    //     var min = max / 10; // Math.pow(10, n) basically
    //     var number = Math.floor(Math.random() * (max - min + 1)) + min;

    //     return ("" + number).substring(add);
    // }
}
