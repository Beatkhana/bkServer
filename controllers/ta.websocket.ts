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
import { WSPacket } from "./wsPacket";
import { wsClient } from "./wsClient";
import WebSocket from 'ws';
import { SongFinished } from "../models/TA/songFinished";

export class taWebSocket extends controller {

    tournamentId: string;
    ws: any;
    taClient: wsClient;
    private url = "";
    private password;
    private reconnectAttempts = 0;
    private reconnect: NodeJS.Timeout = null;

    constructor(id, url: string, password: string) {
        super();
        this.tournamentId = id;
        this.url = url;
        this.taClient = new wsClient();
        this.password = password;
        this.ws = new WebSocket(`ws://${url}`);
        this.init();
    }

    init() {
        this.ws.onopen = () => {
            let packetData = {
                ClientType: ConnectTypes.Coordinator,
                Name: "BeatKhana!",
                ClientVersion: 44,
                Password: this.password
            };
            let packet = new WSPacket(packetData, PacketType.Connect);
            this.ws.send(JSON.stringify(packet));
        };
        this.ws.addEventListener("message", (event) => {
            this.emitter.emit('taEvent', [this.tournamentId, JSON.parse(event.data)]);
            this.handlePacket(JSON.parse(event.data));
        });
        this.ws.onclose = () => {
            console.error(`Socket Closed - ${this.taClient?.State?.ServerSettings?.ServerName} - ${this.tournamentId}`);
            this.taClient = new wsClient();
            if (this.reconnectAttempts < 5) {
                this.reconnect = setTimeout(() => {
                    this.reconnectAttempts++;
                    this.ws = new WebSocket(`ws://${this.url}`);
                    this.init();
                }, 300000);
            }
        };
        this.ws.onerror = (err) => {
            console.error("Socket Error", err.message);
            this.ws = null;
        }
    }

    handlePacket(packet) {
        // console.log(packet);
        if (packet.Type == PacketType.ConnectResponse) {
            let connectResponse = packet.SpecificPacket as ConnectResponse;
            if (!this.taClient.Self && connectResponse.Self) {
                this.taClient = new wsClient(connectResponse);
                console.info("Connected to: " + this.taClient?.State?.ServerSettings.ServerName + ` (${this.tournamentId})`);
            }
        } else if (packet.Type == PacketType.Event && this.taClient.isConnected) {
            let event = packet.SpecificPacket as TAEvent;
            switch (event.Type) {
                case EventType.CoordinatorAdded:
                    this.taClient.coordinatorAdded(event.ChangedObject);
                    break;
                case EventType.CoordinatorLeft:
                    this.taClient.coordinatorLeft(event.ChangedObject);
                    break;
                case EventType.MatchCreated:
                    var match: Match = event.ChangedObject;
                    this.taClient.matchCreated(match);
                    break;
                case EventType.MatchUpdated:
                    var match: Match = event.ChangedObject;
                    this.taClient.matchUpdated(event.ChangedObject);
                    break;
                case EventType.MatchDeleted:
                    this.taClient.matchDeleted(event.ChangedObject);
                    break;
                case EventType.PlayerAdded:
                    this.taClient.playerAdded(event.ChangedObject);
                    // QualifiersController.runMatch(this.tournamentId);
                    break;
                case EventType.PlayerUpdated:
                    this.taClient.playerUpdated(event.ChangedObject);
                    break;
                case EventType.PlayerLeft:
                    this.taClient.playerLeft(event.ChangedObject);
                    break;
                case EventType.QualifierEventCreated:
                    this.taClient.qualifierEventCreated(event.ChangedObject);
                    break;
                case EventType.QualifierEventUpdated:
                    this.taClient.qualifierEventUpdated(event.ChangedObject);
                    break;
                case EventType.QualifierEventDeleted:
                    this.taClient.qualifierEventDeleted(event.ChangedObject);
                    break;
                default:
                    break;
            }
        } else if (packet.Type == PacketType.SubmitScore) {
            // save score
            QualifiersController.taScore(<SubmitScore>packet.SpecificPacket, this.tournamentId);
        } else if (packet.Type == PacketType.ForwardingPacket) {
            this.handlePacket(packet.SpecificPacket);
        } else if (packet.Type == PacketType.SongFinished) {
            console.debug("song fin", <SongFinished>packet.SpecificPacket);
            QualifiersController.taLiveScore(<SongFinished>packet.SpecificPacket, this.tournamentId);
        }
    }

    createEvent(name: string, tournamentId, maps: GameplayParameters[] = [], flags: number) {
        if (this.taClient.State.Events.find(x => x.Guild.Id == tournamentId)) {
            let event = this.taClient.State.Events.find(x => x.Guild.Id == tournamentId);
            console.log(event);
            let SpecificPacket: TAEvent = {
                Type: EventType.QualifierEventDeleted,
                ChangedObject: event,
            };
            this.ws.send(
                JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
            );
        }
        let qualEvent: QualifierEvent = {
            EventId: uuidv4(),
            Name: name,
            Guild: {
                Id: tournamentId,
                Name: "BeatKhana!",
            },
            InfoChannel: {
                Id: "0",
                Name: "the-corporation",
            },
            QualifierMaps: maps,
            SendScoresToInfoChannel: false,
            Flags: flags,
        };
        let SpecificPacket: TAEvent = {
            Type: EventType.QualifierEventCreated,
            ChangedObject: qualEvent,
        };
        this.ws.send(
            JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
        );
    }

    // async createMatch(name: string, tournamentId, maps: GameplayParameters[] = [], flags: number) {
    //     let matchMap: PreviewBeatmapLevel = {
    //         LevelId: `${maps[0].Beatmap.LevelId}`,
    //         Name: maps[0].Beatmap.Name,
    //         Characteristics: [maps[0].Beatmap.Characteristic],
    //         Loaded: true,
    //     };
    //     let match: Match = {
    //         Guid: uuidv4(),
    //         Players: this.taClient.State.Players,
    //         Leader: this.taClient.Self,
    //         SelectedDifficulty: maps[0].Beatmap.Difficulty,
    //         SelectedLevel: matchMap,
    //         SelectedCharacteristic: maps[0].Beatmap.Characteristic
    //     };
    //     let SpecificPacket: TAEvent = {
    //         Type: EventType.MatchCreated,
    //         ChangedObject: match,
    //     };
    //     this.ws.send(
    //         JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
    //     );

    //     let loadedSong: LoadSong = {
    //         LevelId: match.SelectedLevel.LevelId,
    //         CustomHostUrl: null,
    //     };
    //     let playerIds = match.Players.map((x) => x.Id);
    //     let specificPacket2: ForwardingPacket = {
    //         ForwardTo: playerIds,
    //         Type: PacketType.LoadSong,
    //         SpecificPacket: loadedSong,
    //     };

    //     setTimeout(() => {
    //         this.ws.send(
    //             JSON.stringify(new WSPacket(specificPacket2, PacketType.ForwardingPacket))
    //         );
    //     }, 1000);
    //     setTimeout(() => {
    //         SpecificPacket = {
    //             Type: EventType.MatchUpdated,
    //             ChangedObject: match,
    //         };
    //         this.ws.send(
    //             JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
    //         );
    //         this.checkPlay(match.Guid);
    //     }, 7000)
    //     return match.Guid;
    // }

    // checkPlay(matchId) {
    //     let match = this.taClient.State.Matches.find(x => x.Guid == matchId);
    //     console.debug("match", match);
    //     if (match) {
    //         if (match.Players.every((x) => x.DownloadState != DownloadStates.None) && match.Players.every((x) => x.PlayState == PlayStates.Waiting)) {
    //             setTimeout(() => {
    //                 this.playSong(matchId);
    //             }, 1000);
    //         } else {
    //             setTimeout(() => {
    //                 this.checkPlay(matchId)
    //             }, 5000);
    //         }
    //     }
    // }

    // playSong(matchId) {
    //     let curMatch = this.taClient.State.Matches.find(x => x.Guid == matchId);
    //     let gm: GameplayModifiers = { Options: GameOptions.None };
    //     // for (const modifier of mapOptions) {
    //     // 	if (modifier.isSelected) {
    //     // 		gm.Options = gm.Options | modifier.value;
    //     // 	}
    //     // }
    //     let beatMap: Beatmap = {
    //         Characteristic: curMatch.SelectedCharacteristic,
    //         Difficulty: curMatch.SelectedDifficulty,
    //         LevelId: curMatch.SelectedLevel.LevelId,
    //         Name: curMatch.SelectedLevel.Name,
    //     };
    //     let gameplayParam: GameplayParameters = {
    //         PlayerSettings: {
    //             Options: PlayerOptions.None,
    //         },
    //         GameplayModifiers: gm,
    //         Beatmap: beatMap,
    //     };

    //     let playSong: PlaySong = {
    //         GameplayParameters: gameplayParam,
    //         FloatingScoreboard: false,
    //         StreamSync: false,
    //         DisablePause: false,
    //         DisableFail: false,
    //     };
    //     let playerIds = curMatch.Players.map((x) => x.Id);
    //     let specificPacket: ForwardingPacket = {
    //         ForwardTo: playerIds,
    //         Type: PacketType.PlaySong,
    //         SpecificPacket: playSong,
    //     };
    //     this.ws.send(JSON.stringify(new WSPacket(specificPacket, PacketType.ForwardingPacket)));
    // }

    updateEvent(tournamentId, maps: GameplayParameters[], name: string, flags: number) {
        let event = this.taClient?.State?.Events?.find(x => x.Guild.Id == tournamentId);
        if (event) {
            let qualEvent: QualifierEvent = {
                EventId: event.EventId,
                Name: name,
                Guild: {
                    Id: tournamentId,
                    Name: "BeatKhana!",
                },
                InfoChannel: {
                    Id: "0",
                    Name: "the-corporation",
                },
                QualifierMaps: maps,
                SendScoresToInfoChannel: false,
                Flags: flags,
            };
            let SpecificPacket: TAEvent = {
                Type: EventType.QualifierEventUpdated,
                ChangedObject: qualEvent,
            };
            this.ws.send(
                JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
            );
            // let SpecificPacket: TAEvent = {
            //     Type: EventType.QualifierEventUpdated,
            //     ChangedObject: newEvent,
            // };
            // this.ws.send(
            //     JSON.stringify(new Packet(SpecificPacket, PacketType.Event))
            // );
        }
    }

    deleteEvent(tournamentId) {
        let event = this.taClient?.State?.Events?.find(x => x.Guild.Id == tournamentId);
        if (event) {
            let SpecificPacket: TAEvent = {
                Type: EventType.QualifierEventDeleted,
                ChangedObject: event,
            };
            this.ws.send(
                JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
            );
        }
    }

    close() {
        if (this.ws?.readyState == 1) {
            let SpecificPacket: TAEvent = {
                Type: EventType.CoordinatorLeft,
                ChangedObject: this.taClient.Self,
            };
            this.ws.send(
                JSON.stringify(new WSPacket(SpecificPacket, PacketType.Event))
            );
            this.ws.close();
        }
    }

}