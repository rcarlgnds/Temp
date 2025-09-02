import { ApiPlayer } from '../player/types';

export interface GetAllRoomsApiItem {
    room: ApiRoom;
    hostName: string;
    topicName: string;
    topicDescription: string;
}

export interface CreateRoomPayload {
    Room: {
        HostId: string;
        TopicId: string;
        ClassCode: string;
    };
    Email: string;
}

export interface UpdateRoomHostPayload {
    RoomId: string;
    HostId: string;
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
    hostName: string;
    topicId: string;
    status: string;
    maxPlayers: number;
    players: ApiPlayer[];
}

export interface Room {
    id: string;
    name: string;
    hostId: string;
    hostName: string;
    topicId: string;
    status: string;
    maxPlayers: number;
    players: ApiPlayer[];
    playersCount: number;
    topicName: string;
    topicDescription: string;
}

export interface RoomLeaderboard {
    [key: string]: any;
}

export interface RoomStatus {
    [key: string]: any;
}

