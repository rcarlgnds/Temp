import axios from 'axios';
import {
    CreatePlayerSessionPayload,
    PlayerSession,
    LoginPlayerPayload,
    ApiPlayer,
    UpdatePlayerStatusPayload, DeletePlayerSessionPayload, LobbyData
} from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/playerSession`;

export const createPlayerSession = async (payload: CreatePlayerSessionPayload): Promise<PlayerSession> => {
    try {
        const response = await axios.post<PlayerSession>(`${API_URL}/create-player-session`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create player session:", error);
        throw new Error("Could not create player session.");
    }
};

export const deletePlayerSession = async (payload: DeletePlayerSessionPayload): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/delete-player-session`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to delete player session:", error);
        throw new Error("Could not delete player session.");
    }
};

export const loginPlayer = async (payload: LoginPlayerPayload): Promise<{ players: ApiPlayer[] }> => {
    try {
        const response = await axios.post<{ players: ApiPlayer[] }>(`${API_URL}/login-player`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to get player list via login:", error);
        throw new Error("Could not get player list.");
    }
};

export const updatePlayerStatus = async (payload: UpdatePlayerStatusPayload): Promise<any> => {
    const PLAYER_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/players`;
    try {
        const response = await axios.post(`${PLAYER_API_URL}/update-status`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to update player status:", error);
        throw new Error("Could not update player status.");
    }
};

export const getPlayerSessionsByRoomId = async (roomId: string): Promise<LobbyData> => {
    try {
        const response = await axios.get<LobbyData>(`${API_URL}/get-player-session-by-roomId`, {
            params: { roomId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to get player sessions for room:", error);
        throw new Error("Could not fetch player sessions.");
    }
};