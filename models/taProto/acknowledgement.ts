export interface Acknowledgement {
    packetId: string;
    type: AcknowledgementType;
}

export enum AcknowledgementType {
    MessageReceived,
    FileDownloaded
}