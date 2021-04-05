import type { User } from './User';

export interface Coordinator extends User {
    getIcon: string;
    UserId: string;
}