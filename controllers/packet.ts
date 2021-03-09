import { v4 as uuidv4, stringify as uuidStringify, parse as uuidParse, NIL as NIL_UUID } from 'uuid';
import { Command } from '../models/TA/command';
import { Connect } from '../models/TA/connect';
import { ConnectResponse } from '../models/TA/connectResponse';
import { TAEvent } from '../models/TA/event';
import { ForwardingPacket } from '../models/TA/forwardingPacket';
import { LoadedSong } from '../models/TA/loadedSong';
import { LoadSong } from '../models/TA/loadSong';
import { PlaySong } from '../models/TA/playSong';
import { TAResponse } from '../models/TA/response';
import { ScoreRequest } from '../models/TA/scoreRequest';
import { ScoreRequestResponse } from '../models/TA/scoreRequestResponse';
import { SongFinished } from '../models/TA/songFinished';
import { SongList } from '../models/TA/songList';
import { SubmitScore } from '../models/TA/submitScore';

export class Packet {

    Size: number = 0;
    // SpecificPacketSize: number = 44;
    // Id: string = "";
    // From: string = "";

    Type: PacketType;
    SpecificPacket: Packet;

    constructor(specificPacket: any, type: PacketType, size: number) {
        this.Type = type;
        this.SpecificPacket = specificPacket;
        this.Size = size;
    }

    public static async fromBytes(buffer: Buffer): Promise<Packet> {
        // console.log(buffer.toString());
        // console.log(buffer.toString().slice(0, 4))
        let pktType: PacketType = buffer.readUInt8(4);
        let sizeBytes = buffer.readUInt32LE(8);

        let specificPacketSize = sizeBytes;
        let specificPacket = null;
        console.log(PacketType[pktType], sizeBytes, buffer.length)
        if (specificPacketSize > 0) {
            switch (pktType) {
                case PacketType.Command:
                    specificPacket = await Command.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.Connect:
                    specificPacket = await Connect.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.ConnectResponse:
                    specificPacket = await ConnectResponse.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.Event:
                    specificPacket = await TAEvent.ParseFrom(buffer.slice(44));
                    break;
                // case PacketType.File:
                //     specificPacket = Models.Packets.File.ParseFrom(buffer.slice(44));
                //     break;
                case PacketType.ForwardingPacket:
                    specificPacket = await ForwardingPacket.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.LoadedSong:
                    specificPacket = await LoadedSong.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.LoadSong:
                    specificPacket = await LoadSong.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.PlaySong:
                    specificPacket = await PlaySong.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.Response:
                    specificPacket = await TAResponse.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.ScoreRequest:
                    specificPacket = await ScoreRequest.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.ScoreRequestResponse:
                    specificPacket = await ScoreRequestResponse.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.SongFinished:
                    specificPacket = await SongFinished.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.SongList:
                    specificPacket = await SongList.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.SubmitScore:
                    specificPacket = await SubmitScore.ParseFrom(buffer.slice(44));
                    break;
                case PacketType.Acknowledgement:
                    specificPacket = null;
                    break;
                default:
                    specificPacket = null;
                    break;
            }
            // console.log(specificPacket);
            return new Packet(specificPacket, pktType, buffer.length);
            // return {
            //     Type: pktType,
            //     SpecificPacket: specificPacket,
            //     Size: sizeBytes + 44
            // }
        }
        return null;
    }

    public static encodePacket(buf: Buffer | Uint8Array, type) {
        let buffArray: Uint8Array[] = [Buffer.from("moon"), this.toBytesInt32(type), this.toBytesInt32(buf.length), Uint8Array.from(uuidParse(NIL_UUID)), Uint8Array.from(uuidParse(NIL_UUID)), buf];
        let bufToSend = Buffer.concat(buffArray);
        return bufToSend;
    }

    public static potentiallyValid(buffer: Buffer) {
        if (buffer.length.toString().slice(0, 4) != 'moon') return false;
        let sizeBytes = buffer.readUInt32LE(8);
        return (sizeBytes + 44) <= buffer.length;
    }

    isPacket(packet: string) {
        return packet.substr(0, 4) == 'moon';
    }

    static toBytesInt32(num: number) {
        let buf = Buffer.allocUnsafe(4);
        buf.writeUInt32LE(num, 0);
        return buf;
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