import { AxiosError } from "axios";
import { CronJob } from "../modules/cronLoader";
import { UserService } from "../services/user";
import { delay } from "../util/helpers";
import { rateLimitThrottle } from "../util/rateLimitHandler";
import { getSSData } from "../util/scoresaber";

export default class implements CronJob {
    schedule = "0 * * * *";

    async run() {
        console.log(`Running Cron - Scoresaber update`);
        const res = await UserService.allUsers();
        let completed = 0;
        for (const user of res) {
            try {
                if (!user.ssId) continue;
                const data = await getSSData(user.ssId);
                await rateLimitThrottle(data);
                if (data.status === 200) {
                    let info = {};
                    if (data.data.banned) {
                        info = {
                            ssId: data.data.id,
                            country: data.data.country
                        };
                    } else {
                        info = {
                            ssId: data.data.id,
                            globalRank: data.data.rank,
                            localRank: data.data.countryRank,
                            country: data.data.country
                        };
                    }

                    try {
                        await UserService.updateUser(user.discordId, info);
                        completed += 1;
                    } catch (error) {
                        console.error(error);
                    }
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    console.error("Scoresaber update error: ", error.response?.data.errorMessage);
                } else {
                    console.error(error);
                }
            }
        }
        console.log(`Cron completed: Updated ${completed}/${res.length} users`);
    }
}
