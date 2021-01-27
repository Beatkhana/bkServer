export interface TAResponse {
    Type: ResponseType;
    Message: string;
}

export enum ResponseType {
    Success,
    Fail
}