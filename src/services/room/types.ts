import {ApiPlayer} from "@/services/player/types";

export interface CreateRoomPayload {
    Room: {
        HostId: string;
        TopicId: string;
    };
    Email: string;
}

export interface ApiRoom {
    id: string;
    roomId: string;
    hostId: string;
    maxPlayers: number;
    players: ApiPlayer[];
    createdAt: Date;
}

export interface Room {
    id: string;
    name: string;
    playersCount: number;
    maxPlayers: number;
    players: ApiPlayer[];
    hostId: string;
}