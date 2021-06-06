import session from "express-session";
var MemoryStore = require('memorystore')(session);

export const sessionParser = session({
    name: 'uId',
    resave: false,
    saveUninitialized: false,
    secret: 'jfgdasjkfdau',
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every week
    }),
    cookie: {
        maxAge: 604800000,
        sameSite: true
    }
});