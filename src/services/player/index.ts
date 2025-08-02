import axios from 'axios';
import {CreatePlayerSessionPayload, PlayerSession, LoginPlayerPayload, ApiPlayer} from './types';

const API_URL = "http://localhost:6969/api/playerSession";

/**
 * Membuat sesi baru untuk pemain saat mereka mencoba join room.
 * Mengembalikan data sesi termasuk playerCode.
 */
export const createPlayerSession = async (payload: CreatePlayerSessionPayload): Promise<PlayerSession> => {
    try {
        const response = await axios.post(`${API_URL}/create-player-session`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create player session:", error);
        throw new Error("Could not create player session.");
    }
};

/**
 * Mengambil daftar pemain dalam sebuah room.
 * (Asumsi: Menggunakan POST dengan playerCode dan roomId)
 */
export const loginPlayerAndGetList = async (payload: LoginPlayerPayload): Promise<ApiPlayer[]> => {
    try {
        const response = await axios.post(`${API_URL}/login-player`, payload);
        // Asumsi: respons mengembalikan array pemain
        return response.data.players || [];
    } catch (error) {
        console.error("Failed to get player list:", error);
        throw new Error("Could not get player list.");
    }
};