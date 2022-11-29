import DatabaseService from "../../services/database";
import { getSSData } from "../../util/scoresaber";

const CLIENT_ID = "721696709331386398";
const CLIENT_SECRET = "LdOyEZhrU6uW_5yBAn7f8g2nvTJ_13Y6";

const env = process.env.NODE_ENV || "production";

export class crons {
    static async updateSSData() {
        try {
            const res = (await DatabaseService.query(`discordId, ssId FROM users`)) as any[];
            let completed = 0;
            for (const user of res) {
                if (!user.ssId) continue;
                const data = await getSSData(user.ssId);
                if (data.status == 200) {
                    let info = {};
                    if (data.data?.banned == 1) {
                        info = {
                            ssId: data.data.id,
                            country: data.data.country
                        };
                    } else {
                        info = {
                            ssId: data.data.id,
                            // name: data.data.playerInfo.playerName,
                            // avatar: data.data.playerInfo.avatar,
                            globalRank: data.data.rank,
                            localRank: data.data.countryRank
                            // country: data.data.playerInfo.country,
                        };
                    }

                    try {
                        DatabaseService.query("UPDATE users SET ? WHERE discordId = ?", [info, user.discordId]);
                        completed += 1;
                    } catch (error) {
                        console.error(error);
                    }
                }
                await delay(1000);
            }
            console.log(`Cron completed: Updated ${completed}/${res.length} users`);
        } catch (error) {
            console.error(error);
            return false;
        }

        function delay(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    static async updateUsersDiscord() {
        // const users: any = await db.asyncPreparedQuery("SELECT * FROM users");
        // for (const user of users) {
        //     try {
        //         if (!(user.refresh_token == null || user.refresh_token == "")) {
        //             let data = new FormData();
        //             data.append("client_id", CLIENT_ID);
        //             data.append("client_secret", CLIENT_SECRET);
        //             data.append("grant_type", "refresh_token");
        //             let redirect = "";
        //             if (env == "production") {
        //                 redirect = "https://beatkhana.com/api/discordAuth";
        //             } else {
        //                 redirect = "http://localhost:4200/api/discordAuth";
        //             }
        //             // console.log(user);
        //             data.append("redirect_uri", redirect);
        //             data.append("scope", "identify");
        //             data.append("refresh_token", user.refresh_token);
        //             let refresh_token = "";
        //             let response = await fetch("https://discord.com/api/oauth2/token", {
        //                 method: "POST",
        //                 body: data
        //             })
        //                 .then((response: any) => response.json())
        //                 .then((info: any) => {
        //                     refresh_token = info.refresh_token;
        //                     // console.log(info);
        //                     return info;
        //                 })
        //                 .then((info: any) =>
        //                     fetch("https://discord.com/api/users/@me", {
        //                         headers: {
        //                             authorization: `${info.token_type} ${info.access_token}`
        //                         }
        //                     })
        //                 )
        //                 .then((userRes: any) => userRes.json())
        //                 .then((userRes: any) => {
        //                     // console.log(userRes);
        //                     return userRes;
        //                 })
        //                 .catch((error: any) => {
        //                     console.log(error);
        //                 });
        //             // console.log(response);
        //             // console.log(user)
        //             if (refresh_token != "" && !(response.username == "" || response.username == null)) {
        //                 try {
        //                     await db.asyncPreparedQuery("UPDATE users SET name = ?, avatar = ?, refresh_token = ? WHERE discordId = ?", [response.username, response.avatar, refresh_token, user.discordId]);
        //                 } catch (error) {
        //                     console.log(error);
        //                 }
        //             }
        //         }
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }
        // console.log("Discord update complete");
    }
}
