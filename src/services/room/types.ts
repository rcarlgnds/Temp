import { ApiPlayer } from '../player/types';

export interface CreateRoomPayload {
    Room: {
        RoomId: string;
        HostId: string;
        TopicId: string;
    };
    Email: string;
}

export interface ModifyPlayerInRoomPayload {
    RoomId: string;
    Email: string;
}

export interface UpdateRoomStatusPayload {
    RoomId: string;
    Status: 'waiting' | 'start' | 'finished';
}

export interface DeleteRoomPayload {
    roomId: string;
}

export interface ApiRoom {
    id: string;
    roomId: string;
    hostId: string;
    maxPlayers: number;
    players: ApiPlayer[];
    createdAt: Date;
    status: string;
}

export interface Room {
    id: string;
    name: string;
    playersCount: number;
    maxPlayers: number;
    players: ApiPlayer[];
    hostId: string;
}

export interface RoomLeaderboard {
    [key: string]: any;
}

export interface RoomStatus {
    [key: string]: any;
}