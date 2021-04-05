import type { Coordinator } from "./coordinator";
import type { CoreServer } from "./coreServer";
import type { Match } from "./match";
import type { Player } from "./player";
import type { QualifierEvent } from "./qualifierEvent";
import type { ServerSettings } from "./serverSettings";

export interface State {
    serverSettings: ServerSettings;
    players: Player[];
    coordinators: Coordinator[];
    matches: Match[];
    events: QualifierEvent[];
    knownHosts: CoreServer[];
}