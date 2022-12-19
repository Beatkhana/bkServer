import axios from "axios";
import { Scoresaber } from "../models/scoresaber.model";

export function getSSData(id: string | number) {
    return axios.get<Scoresaber.Player>(`https://scoresaber.com/api/player/${id}/basic`);
}
