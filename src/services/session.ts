import { RedisClientType } from "@redis/client";
import connectRedis from "connect-redis";
import session, { SessionData } from "express-session";
import { createClient } from "redis";
import { RedisService } from "./redis";

declare module "express-session" {
    export interface SessionData {
        [key: string]: { [key: string]: any };
    }
}

let RedisStore: connectRedis.RedisStore;
let redisClient: RedisClientType;

export default async () => {
    RedisStore = connectRedis(session);
    redisClient = createClient({
        legacyMode: true,
        url: "redis://127.0.0.1:6379"
    });

    try {
        await RedisService.initRedis();
        await redisClient.connect();
    } catch (error) {
        console.error("Failed to connect to redis");
        console.error(error);
    }
};

let redisStore: connectRedis.RedisStore | undefined = undefined;

export function getSessionStore() {
    if (redisStore === undefined) {
        redisStore = new RedisStore({ client: <any>redisClient, disableTouch: true, ttl: 604800000 });
    }
    return redisStore;
}

let sessionObj: any | undefined = undefined;

export function getSessionParser() {
    const sessionStore = getSessionStore();
    if (!sessionStore) return null;
    if (sessionObj === undefined) {
        sessionObj = session({
            name: "uId",
            resave: false,
            saveUninitialized: false,
            secret: "gjifldadvhiovi",
            store: sessionStore,
            cookie: {
                maxAge: 604800000,
                sameSite: true,
                // secure: true,
                httpOnly: true
            }
        });
    }
    return sessionObj as any;
}

export function getFromSessionStore(sessionId: string): Promise<session.SessionData | undefined | null> {
    return new Promise((resolve, reject) => {
        getSessionStore()?.get(sessionId, (err: any, sess: session.SessionData | PromiseLike<session.SessionData | null | undefined> | null | undefined) => {
            if (err) return reject(err);
            return resolve(sess);
        });
    });
}

export function updateSession(sessionId: string, data: SessionData) {
    return new Promise<void>((resolve, reject) => {
        getSessionStore()?.set(sessionId, data, (err: any) => {
            if (err) return reject(err);
            return resolve();
        });
    });
}
