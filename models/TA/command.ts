import { load, Root } from "protobuf-typescript";

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/Packets/command.proto');
})();

export class Command {
    commandType: CommandTypes;

    static ParseFrom(buffer: Buffer) {
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