"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadStates = exports.PlayStates = void 0;
var PlayStates;
(function (PlayStates) {
    PlayStates[PlayStates["Waiting"] = 0] = "Waiting";
    PlayStates[PlayStates["InGame"] = 1] = "InGame";
})(PlayStates = exports.PlayStates || (exports.PlayStates = {}));
var DownloadStates;
(function (DownloadStates) {
    DownloadStates[DownloadStates["None"] = 0] = "None";
    DownloadStates[DownloadStates["Downloading"] = 1] = "Downloading";
    DownloadStates[DownloadStates["Downloaded"] = 2] = "Downloaded";
    DownloadStates[DownloadStates["DownloadError"] = 3] = "DownloadError";
})(DownloadStates = exports.DownloadStates || (exports.DownloadStates = {}));
