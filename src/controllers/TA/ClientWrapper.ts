import { Client, Models, Packets, proto } from "tournament-assistant-client";
import { v4 as uuidv4 } from "uuid";

export class TAClientWrapper {
    public tournamentId: string;
    public taClient: Client;

    constructor(tournamentId: string, url: string, password: string) {
        this.tournamentId = tournamentId;
        this.taClient = new Client("BeatKhana!", {
            url: url,
            password: password
        });
    }

    createEvent(name: string, tournamentId: string, maps: Models.GameplayParameters[], flags: number) {
        if (this.taClient.QualifierEvents.find(x => x.info_channel.name === tournamentId)) {
            this.deleteEvent(tournamentId);
        }
        let qualEvent: Models.QualifierEvent = new Models.QualifierEvent({
            guid: uuidv4(),
            name: name,
            info_channel: new proto.discord.Channel({
                name: tournamentId
            }),
            qualifier_maps: maps,
            send_scores_to_info_channel: false,
            flags: flags
        });
        this.taClient.sendEvent(
            new Packets.Event({
                qualifier_created_event: new Packets.Event.QualifierCreatedEvent({
                    event: qualEvent
                })
            })
        );
    }

    deleteEvent(tournamentId: string) {
        let event = this.taClient.QualifierEvents.find(x => x.info_channel.name === tournamentId);
        this.taClient.sendEvent(
            new Packets.Event({
                qualifier_deleted_event: new Packets.Event.QualifierDeletedEvent({
                    event: event
                })
            })
        );
    }

    updateEvent(tournamentId: string, maps: Models.GameplayParameters[], name: string, flags: number) {
        const event = this.taClient.QualifierEvents.find(x => x.info_channel.name === tournamentId);
        if (!event) return;
        let qualEvent: Models.QualifierEvent = new Models.QualifierEvent({
            guid: event.guid,
            name: name,
            info_channel: new proto.discord.Channel({
                name: tournamentId
            }),
            qualifier_maps: maps,
            send_scores_to_info_channel: false,
            flags: flags
        });
        this.taClient.sendEvent(
            new Packets.Event({
                qualifier_updated_event: new Packets.Event.QualifierUpdatedEvent({
                    event: qualEvent
                })
            })
        );
    }
}
