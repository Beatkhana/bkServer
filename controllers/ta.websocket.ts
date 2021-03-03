import { ConnectTypes } from "../models/TA/connect";
import { ConnectResponse } from "../models/TA/connectResponse";
import { TAEvent, EventType } from "../models/TA/event";
import { Match } from "../models/TA/match";
import { QualifierEvent } from "../models/TA/qualifierEvent";
import { client } from "./client";
import { controller } from "./controller";
import { Packet, PacketType } from "./packet";
import { v4 as uuidv4 } from "uuid";
import { QualifiersController } from "./qualifiers";
import { SubmitScore } from "../models/TA/submitScore";
import { GameplayParameters } from "../models/TA/gameplayParameters";
const WebSocket = require('ws');

export class taWebSocket extends controller {

    tournamentId: string;
    ws: any;
    taClient: client;
    private url = "";
    private password;

    constructor(id, url: string, password: string) {
        super();
        this.tournamentId = id;
        this.url = url;
        this.taClient = new client();
        this.password = password;
        this.ws = new WebSocket(`ws://${url}`);
        this.init();
    }

    init() {
        this.ws.addEventListener('open', () => {
            // console.info(this.tournamentId + " TA Connected");
            let packetData = {
                ClientType: ConnectTypes.Coordinator,
                Name: "BeatKhana!",
                ClientVersion: 36,
                Password: this.password
            };
            let packet = new Packet(packetData, PacketType.Connect);
            this.ws.send(JSON.stringify(packet));
        });
        this.ws.addEventListener("message", (event) => {
            this.emitter.emit('taEvent', [this.tournamentId, JSON.parse(event.data)]);
            this.handlePacket(JSON.parse(event.data));
        });
        this.ws.onclose = () => {
            console.error(`Socket Closed - ${this.taClient?.State?.serverSettings?.serverName} - ${this.tournamentId}`);
            this.taClient = new client();
            // this.close();
            setTimeout(() => {
                this.ws = new WebSocket(`ws://${this.url}`);
                this.init();
            }, 300000);
        };
        this.ws.onerror = (err) => {
            console.error("Socket Error", err.message);
            this.ws = null;
        }
    }

    handlePacket(packet) {
        // console.log(packet);
        // if (packet.Type == PacketType.ConnectResponse) {
        //     let connectResponse = packet.SpecificPacket as ConnectResponse;
        //     if (!this.taClient.Self && connectResponse.Self) {
        //         this.taClient = new client(connectResponse);
        //         // console.log(connectResponse);
        //         console.info("Connected to: " + this.taClient?.State?.ServerSettings.ServerName + ` (${this.tournamentId})`);
        //     }
        // } else if (packet.Type == PacketType.Event && this.taClient.isConnected) {
        //     let event = packet.SpecificPacket as TAEvent;
        //     switch (event.Type) {
        //         case EventType.CoordinatorAdded:
        //             this.taClient.coordinatorAdded(event.ChangedObject);
        //             break;
        //         case EventType.CoordinatorLeft:
        //             this.taClient.coordinatorLeft(event.ChangedObject);
        //             break;
        //         case EventType.MatchCreated:
        //             var match: Match = event.ChangedObject;
        //             this.taClient.matchCreated(match);
        //             break;
        //         case EventType.MatchUpdated:
        //             var match: Match = event.ChangedObject;
        //             this.taClient.matchUpdated(event.ChangedObject);
        //             break;
        //         case EventType.MatchDeleted:
        //             this.taClient.matchDeleted(event.ChangedObject);
        //             break;
        //         case EventType.PlayerAdded:
        //             this.taClient.playerAdded(event.ChangedObject);
        //             break;
        //         case EventType.PlayerUpdated:
        //             this.taClient.playerUpdated(event.ChangedObject);
        //             break;
        //         case EventType.PlayerLeft:
        //             this.taClient.playerLeft(event.ChangedObject);
        //             break;
        //         case EventType.QualifierEventCreated:
        //             this.taClient.qualifierEventCreated(event.ChangedObject);
        //             break;
        //         case EventType.QualifierEventUpdated:
        //             this.taClient.qualifierEventUpdated(event.ChangedObject);
        //             break;
        //         case EventType.QualifierEventDeleted:
        //             this.taClient.qualifierEventDeleted(event.ChangedObject);
        //             break;
        //         default:
        //             break;
        //     }
        // } else if (packet.Type == PacketType.SubmitScore) {
        //     // save score
        //     QualifiersController.taScore(<SubmitScore>packet.SpecificPacket, this.tournamentId);
        // } else if (packet.Type == PacketType.ForwardingPacket) {
        //     this.handlePacket(packet.SpecificPacket);
        // }
    }

    createEvent(name: string, tournamentId, maps: GameplayParameters[] = [], flags: number) {
        //     if (this.taClient.State.Events.find(x => x.Guild.Id == tournamentId)) {
        //         let event = this.taClient.State.Events.find(x => x.Guild.Id == tournamentId);
        //         console.log(event);
        //         let SpecificPacket: TAEvent = {
        //             Type: EventType.QualifierEventDeleted,
        //             ChangedObject: event,
        //         };
        //         this.ws.send(
        //             JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
        //         );
        //     }
        // 	let qualEvent: QualifierEvent = {
        // 		EventId: uuidv4(),
        // 		Name: name,
        // 		Guild: {
        // 			Id: tournamentId,
        // 			Name: "BeatKhana!",
        // 		},
        // 		InfoChannel: {
        // 			Id: "0",
        // 			Name: "the-corporation",
        // 		},
        // 		QualifierMaps: maps,
        // 		SendScoresToInfoChannel: false,
        // 		Flags: flags,
        // 	};
        // 	let SpecificPacket: TAEvent = {
        // 		Type: EventType.QualifierEventCreated,
        // 		ChangedObject: qualEvent,
        // 	};
        // 	this.ws.send(
        // 		JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
        //     );
    }

    updateEvent(tournamentId, maps: GameplayParameters[], name: string, flags: number) {
        //     let event = this.taClient?.State?.Events?.find(x => x.Guild.Id == tournamentId);
        //     if (event) {
        //         let qualEvent: QualifierEvent = {
        //             EventId: event.EventId,
        //             Name: name,
        //             Guild: {
        //                 Id: tournamentId,
        //                 Name: "BeatKhana!",
        //             },
        //             InfoChannel: {
        //                 Id: "0",
        //                 Name: "the-corporation",
        //             },
        //             QualifierMaps: maps,
        //             SendScoresToInfoChannel: false,
        //             Flags: flags,
        //         };
        //         let SpecificPacket: TAEvent = {
        //             Type: EventType.QualifierEventUpdated,
        //             ChangedObject: qualEvent,
        //         };
        //         this.ws.send(
        //             JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
        //         );
        //         // let SpecificPacket: TAEvent = {
        //         //     Type: EventType.QualifierEventUpdated,
        //         //     ChangedObject: newEvent,
        //         // };
        //         // this.ws.send(
        //         //     JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
        //         // );
        //     }
    }

    deleteEvent(tournamentId) {
        //     let event = this.taClient?.State?.Events?.find(x => x.Guild.Id == tournamentId);
        //     if (event) {
        //         let SpecificPacket: TAEvent = {
        //             Type: EventType.QualifierEventDeleted,
        //             ChangedObject: event,
        //         };
        //         this.ws.send(
        //             JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
        //         );
        //     }
    }

    close() {
        //     if (this.ws?.readyState == 1) {
        //         let SpecificPacket: TAEvent = {
        //             Type: EventType.CoordinatorLeft,
        //             ChangedObject: this.taClient.Self,
        //         };
        //         this.ws.send(
        //             JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
        //         );
        //         this.ws.close();
        //     }
    }

}