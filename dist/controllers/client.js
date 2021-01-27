"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
var response_1 = require("../models/TA/response");
var client = /** @class */ (function () {
    function client(connectResponse) {
        this.isConnected = false;
        this.matchId = false;
        if (connectResponse && connectResponse.Type == response_1.ResponseType.Success) {
            this.Self = connectResponse.Self;
            this.State = connectResponse.State;
            delete this.State.ServerSettings.Password;
            this.isConnected = true;
        }
    }
    client.prototype.coordinatorAdded = function (data) {
        if (!this.isConnected)
            return;
        var index = this.State.Coordinators.findIndex(function (x) { return x.Id == data.Id; });
        if (index == -1)
            this.State.Coordinators.push(data);
    };
    client.prototype.coordinatorLeft = function (data) {
        var index = this.State.Coordinators.findIndex(function (x) { return x.Id == data.Id; });
        if (index > -1)
            this.State.Coordinators.splice(index, 1);
    };
    client.prototype.matchCreated = function (match) {
        // console.log(match);
        if (!this.State.Matches.find(function (x) { return x.Guid == match.Guid; }))
            this.State.Matches.push(match);
    };
    client.prototype.matchUpdated = function (match) {
        var index = this.State.Matches.findIndex(function (x) { return x.Guid == match.Guid; });
        if (index > -1)
            this.State.Matches[index] = match;
    };
    client.prototype.matchDeleted = function (match) {
        var index = this.State.Matches.findIndex(function (x) { return x.Guid == match.Guid; });
        if (index > -1)
            this.State.Matches.splice(index, 1);
    };
    client.prototype.playerAdded = function (player) {
        this.State.Players.push(player);
    };
    client.prototype.playerUpdated = function (player) {
        var index = this.State.Players.findIndex(function (x) { return x.Id == player.Id; });
        if (index > -1)
            this.State.Players[index] = player;
    };
    client.prototype.playerLeft = function (player) {
        var index = this.State.Players.findIndex(function (x) { return x.Id == player.Id; });
        if (index > -1)
            this.State.Players.splice(index, 1);
    };
    client.prototype.qualifierEventCreated = function (event) {
        var index = this.State.Events.findIndex(function (x) { return x.EventId == event.EventId; });
        if (index == -1)
            this.State.Events.push(event);
    };
    client.prototype.qualifierEventUpdated = function (event) {
        var index = this.State.Events.findIndex(function (x) { return x.EventId == event.EventId; });
        if (index > -1)
            this.State.Events[index] = event;
    };
    client.prototype.qualifierEventDeleted = function (event) {
        var index = this.State.Events.findIndex(function (x) { return x.EventId == event.EventId; });
        if (index > -1)
            this.State.Events.splice(index, 1);
    };
    return client;
}());
exports.client = client;
