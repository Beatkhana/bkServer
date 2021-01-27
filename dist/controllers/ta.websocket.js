"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.taWebSocket = void 0;
var connect_1 = require("../models/TA/connect");
var event_1 = require("../models/TA/event");
var client_1 = require("./client");
var controller_1 = require("./controller");
var packet_1 = require("./packet");
var uuid_1 = require("uuid");
var qualifiers_1 = require("./qualifiers");
var WebSocket = require('ws');
var taWebSocket = /** @class */ (function (_super) {
    __extends(taWebSocket, _super);
    function taWebSocket(id, url, password) {
        var _this = _super.call(this) || this;
        _this.url = "";
        _this.tournamentId = id;
        _this.url = url;
        _this.taClient = new client_1.client();
        _this.password = password;
        if (!_this.password || _this.password == "") {
            _this.close();
        }
        else {
            _this.ws = new WebSocket("ws://" + url);
            _this.init();
        }
        return _this;
    }
    taWebSocket.prototype.init = function () {
        var _this = this;
        this.ws.addEventListener('open', function () {
            // console.info(this.tournamentId + " TA Connected");
            var packetData = {
                ClientType: connect_1.ConnectTypes.Coordinator,
                Name: "BeatKhana!",
                ClientVersion: 36,
                Password: _this.password
            };
            var packet = new packet_1.Packet(packetData, packet_1.PacketType.Connect);
            _this.ws.send(JSON.stringify(packet));
        });
        this.ws.addEventListener("message", function (event) {
            _this.emitter.emit('taEvent', [_this.tournamentId, JSON.parse(event.data)]);
            _this.handlePacket(JSON.parse(event.data));
        });
        this.ws.onclose = function () {
            var _a, _b, _c;
            _this.taClient = new client_1.client();
            console.error("Socket Closed - " + ((_c = (_b = (_a = _this.taClient) === null || _a === void 0 ? void 0 : _a.State) === null || _b === void 0 ? void 0 : _b.ServerSettings) === null || _c === void 0 ? void 0 : _c.ServerName));
            _this.close();
            setTimeout(function () {
                _this.ws = new WebSocket("ws://" + _this.url);
                _this.init();
            }, 300000);
        };
        this.ws.onerror = function (err) {
            console.error("Socket Error");
            _this.ws = null;
        };
    };
    taWebSocket.prototype.handlePacket = function (packet) {
        var _a, _b;
        // console.log(packet);
        if (packet.Type == packet_1.PacketType.ConnectResponse) {
            var connectResponse = packet.SpecificPacket;
            if (!this.taClient.Self) {
                this.taClient = new client_1.client(connectResponse);
                console.info("Connected to: " + ((_b = (_a = this.taClient) === null || _a === void 0 ? void 0 : _a.State) === null || _b === void 0 ? void 0 : _b.ServerSettings.ServerName) + (" (" + this.tournamentId + ")"));
            }
        }
        else if (packet.Type == packet_1.PacketType.Event && this.taClient.isConnected) {
            var event_2 = packet.SpecificPacket;
            switch (event_2.Type) {
                case event_1.EventType.CoordinatorAdded:
                    this.taClient.coordinatorAdded(event_2.ChangedObject);
                    break;
                case event_1.EventType.CoordinatorLeft:
                    this.taClient.coordinatorLeft(event_2.ChangedObject);
                    break;
                case event_1.EventType.MatchCreated:
                    var match = event_2.ChangedObject;
                    this.taClient.matchCreated(match);
                    break;
                case event_1.EventType.MatchUpdated:
                    var match = event_2.ChangedObject;
                    this.taClient.matchUpdated(event_2.ChangedObject);
                    break;
                case event_1.EventType.MatchDeleted:
                    this.taClient.matchDeleted(event_2.ChangedObject);
                    break;
                case event_1.EventType.PlayerAdded:
                    this.taClient.playerAdded(event_2.ChangedObject);
                    break;
                case event_1.EventType.PlayerUpdated:
                    this.taClient.playerUpdated(event_2.ChangedObject);
                    break;
                case event_1.EventType.PlayerLeft:
                    this.taClient.playerLeft(event_2.ChangedObject);
                    break;
                case event_1.EventType.QualifierEventCreated:
                    this.taClient.qualifierEventCreated(event_2.ChangedObject);
                    break;
                case event_1.EventType.QualifierEventUpdated:
                    this.taClient.qualifierEventUpdated(event_2.ChangedObject);
                    break;
                case event_1.EventType.QualifierEventDeleted:
                    this.taClient.qualifierEventDeleted(event_2.ChangedObject);
                    break;
                default:
                    break;
            }
        }
        else if (packet.Type == packet_1.PacketType.SubmitScore) {
            // save score
            qualifiers_1.QualifiersController.taScore(packet.SpecificPacket, this.tournamentId);
        }
        else if (packet.Type == packet_1.PacketType.ForwardingPacket) {
            this.handlePacket(packet.SpecificPacket);
        }
    };
    taWebSocket.prototype.createEvent = function (name) {
        if (this.taClient.State.Events.length != 0)
            return null;
        var qualEvent = {
            EventId: uuid_1.v4(),
            Name: name,
            Guild: {
                Id: "592472886246113300",
                Name: "BeatKhana!",
            },
            InfoChannel: {
                Id: "686910892847530091",
                Name: "the-corporation",
            },
            QualifierMaps: [],
            SendScoresToInfoChannel: false,
            Flags: 0,
        };
        var SpecificPacket = {
            Type: event_1.EventType.QualifierEventCreated,
            ChangedObject: qualEvent,
        };
        this.ws.sendMessage(JSON.stringify(new packet_1.Packet(SpecificPacket, packet_1.PacketType.Event)));
    };
    taWebSocket.prototype.close = function () {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) == 1) {
            var SpecificPacket = {
                Type: event_1.EventType.CoordinatorLeft,
                ChangedObject: this.taClient.Self,
            };
            this.ws.send(JSON.stringify(new packet_1.Packet(SpecificPacket, packet_1.PacketType.Event)));
            this.ws.close();
        }
    };
    return taWebSocket;
}(controller_1.controller));
exports.taWebSocket = taWebSocket;
