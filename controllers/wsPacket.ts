import { v4 as uuidv4, stringify as uuidStringify, parse as uuidParse, NIL as NIL_UUID } from 'uuid';

export class WSPacket {

    Size: number = 0;
    SpecificPacketSize: number = 44;
    Id: string = uuidv4();
    From: string = uuidv4();

    Type: PacketType;
    SpecificPacket: WSPacket;

    //Size of the header, the info we need to parse the specific packet
    // 4x byte - "moon"
    // int - packet type
    // int - packet size
    // 16x byte - size of from id
    // 16x byte - size of packet id
    // packetHeaderSize!: number;


    constructor(specificPacket: any, type: PacketType) {
        this.Type = type;
        this.SpecificPacket = specificPacket;

    }

    public static encodePacket(specificPacket: WSPacket) {
        var enc = new TextEncoder();
        let type = this.toBytesInt32(specificPacket.Type);
        let size = this.toBytesInt32(JSON.stringify(specificPacket.SpecificPacket).length);
        specificPacket.SpecificPacketSize = JSON.stringify(specificPacket.SpecificPacket).length;
        specificPacket.Size = 44 + specificPacket.SpecificPacketSize;
        specificPacket.Id = uuidv4();
        specificPacket.From = uuidv4();

        let buffArray: Uint8Array[] = [enc.encode("moon"), new Uint8Array(type), new Uint8Array(size), Uint8Array.from(uuidParse(NIL_UUID)), Uint8Array.from(uuidParse(NIL_UUID)), enc.encode(JSON.stringify(specificPacket.SpecificPacket))];
        var flattened = Uint8ClampedArray.from(buffArray.reduce((a, b) => [...a, ...b], []));
        return flattened;
    }

    isPacket(packet: string) {
        return packet.substr(0, 4) == 'moon';
    }

    static toBytesInt32(num) {
        let arr = new ArrayBuffer(4);
        let view = new DataView(arr);
        view.setUint32(0, num, false);
        return arr;
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