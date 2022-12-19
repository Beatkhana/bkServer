import axios, { AxiosError } from "axios";
import { Discord } from "../models/discord";
import { CronJob } from "../modules/cronLoader";
import { prisma } from "../services/database";
import { UserService } from "../services/user";
import config from "../util/config";
import { delay } from "../util/helpers";
import { rateLimitThrottle } from "../util/rateLimitHandler";

const CLIENT_ID = config.discord.clientID;
const CLIENT_SECRET = config.discord.clientSecret;
const REDIRECT = config.discord.redirect;
const BOT_TOKEN = config.discord.botToken;

export default class implements CronJob {
    schedule = "0 * * * *";

    async run() {
        console.info("Running cron - Update discord data");
        const users = await prisma.users.findMany();
        let updated = 0;
        const completedUsers: string[] = [];
        for (const user of users) {
            if (user.refresh_token != null) {
                const data = new URLSearchParams();

                data.append("client_id", CLIENT_ID ?? "");
                data.append("client_secret", CLIENT_SECRET ?? "");
                data.append("grant_type", "refresh_token");
                data.append("redirect_uri", REDIRECT ?? "");
                data.append("scope", "identify");
                data.append("refresh_token", user.refresh_token);

                let refresh_token = "";
                try {
                    const discToken = await axios.post<Discord.IToken>("https://discordapp.com/api/oauth2/token", data);
                    refresh_token = discToken.data.refresh_token;
                    const discUser = await axios.get<Discord.IUser>("https://discordapp.com/api/users/@me", {
                        headers: {
                            Authorization: `${discToken.data.token_type} ${discToken.data.access_token}`
                        }
                    });
                    const userResponse = discUser.data;
                    if ((!userResponse?.username?.includes("Deleted User") || userResponse?.username != null) && userResponse) {
                        await UserService.updateUser(user.discordId, { name: userResponse.username, avatar: userResponse.avatar, refresh_token: refresh_token });
                        completedUsers.push(user.discordId);
                        updated++;
                    }
                } catch (error) {
                    if (error instanceof AxiosError) {
                        console.error("Discord update error", error.response?.data.error);
                        if (error.response?.data.error == "invalid_grant") await UserService.updateUser(user.discordId, { refresh_token: null });
                    } else {
                        console.error(error);
                    }
                }
            }
        }
        for (const user of users.filter(x => !completedUsers.includes(x.discordId))) {
            try {
                const r = await axios.get<Discord.IUser>(`https://discord.com/api/users/${user.discordId}`, {
                    headers: {
                        Authorization: `Bot ${BOT_TOKEN}`
                    }
                });
                await rateLimitThrottle(r);

                const data = r.data;
                if (data.username.includes("Deleted User") || !data.username) continue;
                try {
                    await UserService.updateUser(user.discordId, { name: data.username, avatar: data.avatar });
                    updated++;
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    console.error("Discord update error:", error.response?.data);
                } else {
                    console.error("Discord update error:", error);
                }
            }
        }
        console.info(`Discord Update Complete: ${updated}/${users.length}`);
    }
}
