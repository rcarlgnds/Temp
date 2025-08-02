import axios from 'axios';
import {Room, ApiRoom, CreateRoomPayload} from './types';

const API_URL = "http://localhost:6969/api";

export const getAllRooms = async (): Promise<Room[]> => {
    try {
        const response = await axios.get<{ message: string, data: ApiRoom[] }>(`${API_URL}/rooms/get-all-rooms`);

        if (!response.data || !response.data.data) {
            return [];
        }

        const formattedRooms: Room[] = response.data.data.map(apiRoom => ({
            id: apiRoom.id,
            name: apiRoom.roomId,
            playersCount: apiRoom.players.length,
            maxPlayers: apiRoom.maxPlayers,
            players: apiRoom.players,
            hostId: apiRoom.hostId,
        }));

        return formattedRooms;
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
        throw new Error("Could not fetch rooms.");
    }
};

export const createRoom = async (payload: CreateRoomPayload) => {
    try {
        const response = await axios.post(`${API_URL}/rooms/create-room`, payload);
        console.log('Room created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to create room:", error);
        throw new Error("Could not create room.");
    }
};