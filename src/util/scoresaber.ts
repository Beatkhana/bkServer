import axios from "axios";
import { PlayerInfo } from "../models/scoresaber.model";

export function getSSData(id: string | number) {
    return axios.get<PlayerInfo>(`https://new.scoresaber.com/api/player/${id}/basic`);
}
