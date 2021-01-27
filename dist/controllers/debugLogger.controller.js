"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLogger = void 0;
var env = process.env.NODE_ENV || 'production';
var debugLogger = /** @class */ (function () {
    function debugLogger() {
        this.setColors();
    }
    debugLogger.prototype.setColors = function () {
        var debug = console.debug;
        console.debug = function () {
            var args = __spread(['\x1b[36m[DEBUG] %s\x1b[0m'], Array.from(arguments));
            if (env != 'producttion') {
                debug.apply(console, args);
            }
        };
        var error = console.error;
        console.error = function () {
            var args = __spread(['\x1b[31m[ERROR] %s\x1b[0m'], Array.from(arguments));
            error.apply(console, args);
        };
        // const log = console.log;
        // console.log = function () {
        //     let args: [any, ...any[]] = ['[LOG]', ...Array.from(arguments)];
        //     log.apply(console, args);
        // };
        var info = console.info;
        console.info = function () {
            var args = __spread(['\x1b[90m[INFO] %s\x1b[0m'], Array.from(arguments));
            info.apply(console, args);
        };
    };
    return debugLogger;
}());
exports.debugLogger = debugLogger;
