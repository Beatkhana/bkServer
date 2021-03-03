import { load } from "protobuf-typescript";

export class Command {
    commandType: CommandTypes;

    static async ParseFrom(buffer: Buffer) {
        const root = await load(__dirname + '/../../protobuf/Models/Packets/command.proto');
        const command = root.lookupType("TournamentAssistantShared.Models.Packets.Command");
        const message = command.decode(buffer);
        return command.toObject(message);
    }
}

export enum CommandTypes {
    Heartbeat,
    ReturnToMenu,
    ScreenOverlay_ShowPng,
    ScreenOverlay_ShowGreen,
    DelayTest_Finish
}