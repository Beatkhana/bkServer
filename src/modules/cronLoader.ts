import * as cron from "node-cron";
import { loadDir } from "../util/autoLoader";

export class cronController {
    public static async setCrons() {
        const crons: CronJob[] = await loadDir(__dirname + "/../crons");
        for (const cronJob of crons) {
            cron.schedule(cronJob.schedule, cronJob.run);
        }
    }
}

export interface CronJob {
    schedule: string;
    run: () => Promise<void>;
}
