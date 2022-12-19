import dotenv from "dotenv";
import { checkObjectValues } from "./objectChecker";

process.env.NODE_ENV = process.env.ENV || "development";

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};

const envFound = dotenv.config();
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

const values = {
    db: {
        host: process.env.DBHOST,
        port: process.env.DBPORT,
        username: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DB
    },
    discord: {
        redirect: process.env.DISCORD_REDIRECT,
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        botToken: process.env.DISCORD_BOT_TOKEN
    },
    appName: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    appPort: process.env.PORT ?? 3000
};

checkObjectValues(values);

export default values;
