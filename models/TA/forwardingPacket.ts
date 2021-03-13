import { load, Root } from "protobuf-typescript";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/forwarding_packet.proto');
})();

export class ForwardingPacket {
    forwardTo: string[];
    type: PacketType;
    specificPacket: any;

    static ParseFrom(buffer: Buffer) {
        const forwarder = root.lookupType("TournamentAssistantShared.Models.Packets.ForwardingPacket");
        const message = forwarder.decode(buffer);
        return forwarder.toObject(message);
    }
}

export enum PacketType {
    Acknowledgement,
    Command,
    Connect,
    ConnectResponse,
    Event,
    File,
    ForwardingPacket,
    LoadedSong,
    LoadSong,
    PlaySong,
    Response,
    ScoreRequest,
    ScoreRequestResponse,
    SongFinished,
    SongList,
    SubmitScore
}