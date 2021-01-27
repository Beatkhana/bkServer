
export interface ForwardingPacket {
    ForwardTo: string[];
    Type: PacketType;
    SpecificPacket: any;
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