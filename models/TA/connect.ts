export interface Connect {
    clientType: ConnectTypes;
    name: string;
    userId: string;
    clientVersion: number;
}

export enum ConnectTypes {
    Player,
    Coordinator,
    TemporaryConnection
}