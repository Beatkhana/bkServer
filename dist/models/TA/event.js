"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.TAEvent = void 0;
var TAEvent = /** @class */ (function () {
    function TAEvent() {
    }
    return TAEvent;
}());
exports.TAEvent = TAEvent;
var EventType;
(function (EventType) {
    EventType[EventType["PlayerAdded"] = 0] = "PlayerAdded";
    EventType[EventType["PlayerUpdated"] = 1] = "PlayerUpdated";
    EventType[EventType["PlayerLeft"] = 2] = "PlayerLeft";
    EventType[EventType["CoordinatorAdded"] = 3] = "CoordinatorAdded";
    EventType[EventType["CoordinatorLeft"] = 4] = "CoordinatorLeft";
    EventType[EventType["MatchCreated"] = 5] = "MatchCreated";
    EventType[EventType["MatchUpdated"] = 6] = "MatchUpdated";
    EventType[EventType["MatchDeleted"] = 7] = "MatchDeleted";
    EventType[EventType["QualifierEventCreated"] = 8] = "QualifierEventCreated";
    EventType[EventType["QualifierEventUpdated"] = 9] = "QualifierEventUpdated";
    EventType[EventType["QualifierEventDeleted"] = 10] = "QualifierEventDeleted";
    EventType[EventType["HostAdded"] = 11] = "HostAdded";
    EventType[EventType["HostRemoved"] = 12] = "HostRemoved";
})(EventType = exports.EventType || (exports.EventType = {}));
