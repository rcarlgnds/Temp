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
    userId: string;
    roomId: string;
}

export interface UpdatePlayerStatusPayload {
    playerId: string;
    roomId: string;
    status: 'Ready' | 'Not Ready';
}

export interface DeletePlayerSessionPayload {
    email: string;
    roomId: string;
}

export interface PlayerSessionInfo {
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

export interface PlayerSessionInfo {
    id: string;
    playerSessionId: string;
    playerCode: string;
    userId: string;
    roomId: string;
}

export interface LobbyData {
    players: ApiPlayer[];
    room: {
        roomId: string;
        hostId: string;
    };
    sessions: PlayerSessionInfo[];
}

export interface LobbyApiResponse {
    message: string;
    data: LobbyData;
}