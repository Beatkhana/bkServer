import { load } from "protobuf-typescript";

export class ForwardingPacket {
    forwardTo: string[];
    type: PacketType;
    specificPacket: any;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/forwarding_packet.proto');
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