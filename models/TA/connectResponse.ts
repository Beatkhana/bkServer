import { ResponseType, TAResponse } from "./response";
import type { State } from "./state";
import type { User } from "./User";

export class ConnectResponse implements TAResponse {
    Type: ResponseType;
    Message: string;
    Self: User;
    State: State;
    ServerVersion: number;
    Password: string;
}