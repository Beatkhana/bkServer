"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOptions = exports.GameplayModifiers = void 0;
var GameplayModifiers = /** @class */ (function () {
    function GameplayModifiers() {
    }
    return GameplayModifiers;
}());
exports.GameplayModifiers = GameplayModifiers;
var GameOptions;
(function (GameOptions) {
    GameOptions[GameOptions["None"] = 0] = "None";
    //Negative modifiers
    GameOptions[GameOptions["NoFail"] = 1] = "NoFail";
    GameOptions[GameOptions["NoBombs"] = 2] = "NoBombs";
    GameOptions[GameOptions["NoArrows"] = 4] = "NoArrows";
    GameOptions[GameOptions["NoObstacles"] = 8] = "NoObstacles";
    GameOptions[GameOptions["SlowSong"] = 16] = "SlowSong";
    //Positive Modifiers
    GameOptions[GameOptions["InstaFail"] = 32] = "InstaFail";
    GameOptions[GameOptions["FailOnClash"] = 64] = "FailOnClash";
    GameOptions[GameOptions["BatteryEnergy"] = 128] = "BatteryEnergy";
    GameOptions[GameOptions["FastNotes"] = 256] = "FastNotes";
    GameOptions[GameOptions["FastSong"] = 512] = "FastSong";
    GameOptions[GameOptions["DisappearingArrows"] = 1024] = "DisappearingArrows";
    GameOptions[GameOptions["GhostNotes"] = 2048] = "GhostNotes";
    //1.12.2 Additions
    GameOptions[GameOptions["DemoNoFail"] = 4096] = "DemoNoFail";
    GameOptions[GameOptions["DemoNoObstacles"] = 8192] = "DemoNoObstacles";
    GameOptions[GameOptions["StrictAngles"] = 16384] = "StrictAngles";
})(GameOptions = exports.GameOptions || (exports.GameOptions = {}));
