export interface ApiPlayer {
    id: string;
    username: string;
    email: string;
    skin: string;
    money: number;
    status: 'Ready' | 'Not Ready' | string;
    isHost?: boolean;
}

export interface CreatePlayerSessionPayload {
    UserId: string;
    RoomId: string;
}

export interface UpdatePlayerStatusPayload {
    PlayerId: string;
    RoomId: string;
    Status: 'Ready' | 'Not Ready';
}

export interface PlayerSession {
    id: string;
    playerSessionId: string;
    playerCode: string;
    userId: string;
    roomId: string;
}

export interface LoginPlayerPayload {
    playerCode: string;
    roomId: string;
}