import dotenv from "dotenv";
import { checkObjectValues } from "./objectChecker";

process.env.NODE_ENV = process.env.ENV || "development";

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
    appName: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    appPort: process.env.PORT ?? 3000
};

checkObjectValues(values);

export default values;
