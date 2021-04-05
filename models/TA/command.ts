export class Command {
    commandType: CommandTypes;
}

export enum CommandTypes {
    Heartbeat,
    ReturnToMenu,
    ScreenOverlay_ShowPng,
    ScreenOverlay_ShowGreen,
    DelayTest_Finish
}