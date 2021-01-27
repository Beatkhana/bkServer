import type { TAResponse } from "./response";
import type { State } from "./state";
import type { User } from "./User";

export interface ConnectResponse extends TAResponse {
    Self: User;
    State: State;
    ServerVersion: number;
    Password: string
}