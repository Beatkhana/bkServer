export interface File {
    fileId: string;
    intent: Intentions;
    compressed: boolean;
    data: string;
}

export enum Intentions {
    None,
    SetPngToShowWhenTriggered,
    ShowPngImmediately
}