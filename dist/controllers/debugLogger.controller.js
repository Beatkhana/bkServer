"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
            var args = __spreadArrays(['\x1b[36m[DEBUG] %s\x1b[0m'], Array.from(arguments));
            if (env != 'producttion') {
                debug.apply(console, args);
            }
        };
        var error = console.error;
        console.error = function () {
            var args = __spreadArrays(['\x1b[31m[ERROR] %s\x1b[0m'], Array.from(arguments));
            error.apply(console, args);
        };
        var log = console.log;
        console.log = function () {
            var args = __spreadArrays(['[LOG]'], Array.from(arguments));
            log.apply(console, args);
        };
        var info = console.info;
        console.info = function () {
            var args = __spreadArrays(['\x1b[90m[INFO] %s\x1b[0m'], Array.from(arguments));
            info.apply(console, args);
        };
    };
    return debugLogger;
}());
exports.debugLogger = debugLogger;
