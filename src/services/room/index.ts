import axios from 'axios';
import {
    Room,
    ApiRoom,
    CreateRoomPayload,
    ModifyPlayerInRoomPayload,
    UpdateRoomStatusPayload,
    RoomLeaderboard,
    RoomStatus, DeleteRoomPayload
} from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;

export const getAllRooms = async (): Promise<Room[]> => {
    try {
        const response = await axios.get<{ message: string, data: ApiRoom[] }>(`${API_URL}/get-all-rooms`);
        if (!response.data || !response.data.data) return [];

        return response.data.data.map((apiRoom): Room => ({
            id: apiRoom.id,
            topicId: apiRoom.topicId,
            name: apiRoom.roomId,
            playersCount: apiRoom.players.length,
            maxPlayers: apiRoom.maxPlayers,
            players: apiRoom.players,
            hostId: apiRoom.hostId,
            status: apiRoom.status
        }));
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
        throw new Error("Could not fetch rooms.");
    }
};

export const createRoom = async (payload: CreateRoomPayload): Promise<ApiRoom> => {
    try {
        const response = await axios.post<ApiRoom>(`${API_URL}/create-room`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create room:", error);
        throw new Error("Could not create room.");
    }
};

export const addPlayerToRoom = async (payload: ModifyPlayerInRoomPayload): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/add-player-to-room`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to add player to room:", error);
        throw new Error("Could not add player to room.");
    }
};

export const removePlayerFromRoom = async (payload: ModifyPlayerInRoomPayload): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/remove-player-from-room`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to remove player from room:", error);
        throw new Error("Could not remove player from room.");
    }
};

export const deleteRoom = async (payload: DeleteRoomPayload): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/delete-room`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to delete room:", error);
        throw new Error("Could not delete room.");
    }
};

export const getRoomById = async (roomId: string): Promise<ApiRoom> => {
    try {
        const response = await axios.get<ApiRoom>(`${API_URL}/get-room-by-id`, { params: { roomId } });
        return response.data;
    } catch (error) {
        console.error(`Failed to get room ${roomId}:`, error);
        throw new Error("Could not fetch room data.");
    }
};

export const getRoomLeaderboard = async (roomId: string): Promise<RoomLeaderboard> => {
    try {
        const response = await axios.get<RoomLeaderboard>(`${API_URL}/get-room-learderboard`, { params: { roomId } });
        return response.data;
    } catch (error) {
        console.error(`Failed to get leaderboard for room ${roomId}:`, error);
        throw new Error("Could not fetch leaderboard.");
    }
};

export const getRoomStatus = async (roomId: string): Promise<RoomStatus> => {
    try {
        const response = await axios.get<RoomStatus>(`${API_URL}/get-room-status`, { params: { roomId } });
        return response.data;
    } catch (error) {
        console.error(`Failed to get status for room ${roomId}:`, error);
        throw new Error("Could not fetch room status.");
    }
};

export const updateRoomStatus = async (payload: UpdateRoomStatusPayload): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/update-room-status`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to update room status:", error);
        throw new Error("Could not update room status.");
    }
};