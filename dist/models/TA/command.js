"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandTypes = exports.Command = void 0;
var Command = /** @class */ (function () {
    function Command() {
    }
    return Command;
}());
exports.Command = Command;
var CommandTypes;
(function (CommandTypes) {
    CommandTypes[CommandTypes["Heartbeat"] = 0] = "Heartbeat";
    CommandTypes[CommandTypes["ReturnToMenu"] = 1] = "ReturnToMenu";
    CommandTypes[CommandTypes["ScreenOverlay_ShowPng"] = 2] = "ScreenOverlay_ShowPng";
    CommandTypes[CommandTypes["ScreenOverlay_ShowGreen"] = 3] = "ScreenOverlay_ShowGreen";
    CommandTypes[CommandTypes["DelayTest_Finish"] = 4] = "DelayTest_Finish";
})(CommandTypes = exports.CommandTypes || (exports.CommandTypes = {}));
