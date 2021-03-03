import { client } from "./client";
import { controller } from "./controller";
import net from 'net';
import { load } from "protobuf-typescript";
import { Packet, PacketType } from "./packet";
import { ConnectResponse } from "../models/TA/connectResponse";
import { EventType, TAEvent } from "../models/TA/event";
import { ConnectTypes } from "../models/TA/connect";
import { v4 as uuidv4 } from 'uuid';
import { SubmitScore } from "../models/TA/submitScore";
import { QualifiersController } from "./qualifiers";
import { Match } from "../models/TA/match";
import { GameplayParameters } from "../models/TA/gameplayParameters";
import { QualifierEvent } from "../models/TA/qualifierEvent";
import { Coordinator } from "../models/TA/coordinator";

export class taSocket extends controller {

    tournamentId: string;
    taClient: client;
    private url = "";
    private port = 10156;
    private password;
    socketClient: net.Socket;

    private reconnect: NodeJS.Timeout = null;
    private reconnectAttempts = 0;

    constructor(id, url: string, password: string) {
        super();
        this.tournamentId = id;
        this.url = url.split(':')[0];
        this.port = parseInt(url.split(':')[1]);
        this.password = password;
        this.taClient = new client();
        this.socketClient = new net.Socket();

        this.init();
    }

    init() {
        this.socketClient.connect(this.port, this.url, () => {
            this.reconnect = null;
            this.reconnectAttempts = 0;
            this.connect();
        });

        this.socketClient.on('error', (ex) => {
            console.error(`TA Socket Error (${this.tournamentId})`);
        });

        this.socketClient.on('close', (err) => {
            console.error(`TA Socket Disconected (${this.tournamentId})`);
            this.socketClient.destroy();
            if (this.reconnectAttempts < 5) {
                this.reconnect = setTimeout(() => {
                    this.reconnectAttempts++;
                    this.socketClient.connect(this.port, this.url, () => {
                        this.reconnect = null;
                        this.connect();
                    });
                }, 300000);
            }
        });

        this.socketClient.on("data", async (data: Buffer) => {
            this.handlePacket(data);
        });
    }

    async handlePacket(data: Buffer) {
        let packet = await Packet.fromBytes(data);
        console.log(packet);
        if (!packet) return;
        if (packet.Type == PacketType.ConnectResponse) {
            let connectResponse = packet.SpecificPacket as ConnectResponse;
            if (!this.taClient.Self && (connectResponse.player || connectResponse.coordinator)) {
                this.taClient = new client(connectResponse);
                console.info("Connected to: " + this.taClient?.State?.serverSettings.serverName + ` (${this.tournamentId})`);
            }
        } else if (packet.Type == PacketType.Event && this.taClient.isConnected) {
            let event = packet.SpecificPacket as TAEvent;
            switch (event.type) {
                case EventType.CoordinatorAdded:
                    this.taClient.coordinatorAdded(event.changedObject);
                    break;
                case EventType.CoordinatorLeft:
                    this.taClient.coordinatorLeft(event.changedObject);
                    break;
                case EventType.MatchCreated:
                    var match: Match = event.changedObject;
                    this.taClient.matchCreated(match);
                    break;
                case EventType.MatchUpdated:
                    var match: Match = event.changedObject;
                    this.taClient.matchUpdated(event.changedObject);
                    break;
                case EventType.MatchDeleted:
                    this.taClient.matchDeleted(event.changedObject);
                    break;
                case EventType.PlayerAdded:
                    this.taClient.playerAdded(event.changedObject);
                    break;
                case EventType.PlayerUpdated:
                    this.taClient.playerUpdated(event.changedObject);
                    break;
                case EventType.PlayerLeft:
                    this.taClient.playerLeft(event.changedObject);
                    break;
                case EventType.QualifierEventCreated:
                    this.taClient.qualifierEventCreated(event.changedObject);
                    break;
                case EventType.QualifierEventUpdated:
                    this.taClient.qualifierEventUpdated(event.changedObject);
                    break;
                case EventType.QualifierEventDeleted:
                    this.taClient.qualifierEventDeleted(event.changedObject);
                    break;
                default:
                    break;
            }
        } else if (packet.Type == PacketType.SubmitScore) {
            // save score
            QualifiersController.taScore(<SubmitScore>packet.SpecificPacket, this.tournamentId);
        } else if (packet.Type == PacketType.ForwardingPacket) {
            this.handlePacket(packet.SpecificPacket);
        }
    }

    async connect() {
        let root = await load(__dirname + '/../protobuf/Models/Packets/connect.proto');
        const connection = root.lookupType("TournamentAssistantShared.Models.Packets.Connect");
        let payload = {
            clientType: ConnectTypes.Coordinator,
            name: "BeatKhana!",
            password: this.password,
            userId: "",
            clientVersion: 50
        }
        var errMsg = connection.verify(payload);
        if (errMsg)
            throw Error(errMsg);
        let msg = connection.create(payload);
        let buff = connection.encode(msg).finish();
        this.socketClient.write(Packet.encodePacket(buff, PacketType.Connect));
    }

    async close() {
        if (!this.taClient.Self) return;
        let payload: TAEvent = {
            type: EventType.CoordinatorLeft,
            changedObject: await Coordinator.encodeAsAny(this.taClient.Self)
        };
        this.sendEvent(payload);
        this.socketClient.destroy();
        this.reconnect = null;
    }

    async createEvent(name: string, tournamentId, maps: GameplayParameters[] = [], flags: number) {
        if (this.taClient.State.events.find(x => x.guild.id == tournamentId)) {
            let event = this.taClient.State.events.find(x => x.guild.id == tournamentId);
            // console.log(event);
            let SpecificPacket: TAEvent = {
                type: EventType.QualifierEventDeleted,
                changedObject: await QualifierEvent.encodeAsAny(event),
            };
            this.sendEvent(SpecificPacket);
        }
        let qualEvent: QualifierEvent = {
            eventId: uuidv4(),
            name: name,
            guild: {
                id: tournamentId,
                name: "BeatKhana!",
            },
            infoChannel: {
                id: 0,
                name: "the-corporation",
            },
            qualifierMaps: maps,
            sendScoresToInfoChannel: false,
            flags: flags
        };

        let SpecificPacket: TAEvent = {
            type: EventType.QualifierEventCreated,
            changedObject: await QualifierEvent.encodeAsAny(qualEvent)
        };
        this.sendEvent(SpecificPacket);
    }

    async updateEvent(tournamentId, maps: GameplayParameters[], name: string, flags: number) {
        let event = this.taClient?.State?.events?.find(x => x.guild.id == tournamentId);
        if (event) {
            let qualEvent: QualifierEvent = {
                eventId: event.eventId,
                name: name,
                guild: {
                    id: tournamentId,
                    name: "BeatKhana!",
                },
                infoChannel: {
                    id: 0,
                    name: "the-corporation",
                },
                qualifierMaps: maps,
                sendScoresToInfoChannel: false,
                flags: flags,
            };
            let SpecificPacket: TAEvent = {
                type: EventType.QualifierEventUpdated,
                changedObject: await QualifierEvent.encodeAsAny(qualEvent)
            };
            this.sendEvent(SpecificPacket);
        }
    }

    async deleteEvent(tournamentId) {
        let event = this.taClient?.State?.events?.find(x => x.guild.id == tournamentId);
        if (event) {
            let SpecificPacket: TAEvent = {
                type: EventType.QualifierEventDeleted,
                changedObject: await QualifierEvent.encodeAsAny(event),
            };
            this.sendEvent(SpecificPacket);
        }
    }

    async sendEvent(packet: TAEvent) {
        this.socketClient.write(Packet.encodePacket(await TAEvent.encode(packet), PacketType.Event));
    }
}