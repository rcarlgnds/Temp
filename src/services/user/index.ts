import axios from 'axios';
import { AddUserPayload, LoginPayload, ApiUser } from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

export const addUser = async (payload: AddUserPayload): Promise<ApiUser> => {
    try {
        const response = await axios.post<ApiUser>(`${API_URL}/add-player`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to add user:", error);
        throw new Error("Could not register user.");
    }
};

export const loginUser = async (payload: LoginPayload): Promise<ApiUser> => {
    try {
        const response = await axios.post<ApiUser>(`${API_URL}/login`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to login:", error);
        throw new Error("Could not login.");
    }
};

export const getUserByEmail = async (email: string): Promise<ApiUser> => {
    try {
        const response = await axios.get<{ message: string, player: ApiUser }>(`${API_URL}/get-player-by-email`, {
            params: { Email: email }
        });
        return response.data.player;
    } catch (error) {
        console.error("Failed to get user by email:", error);
        throw new Error("Could not fetch user.");
    }
};

export const getGlobalLeaderboard = async (): Promise<any[]> => {
    try {
        const response = await axios.get(`${API_URL}/get-global-leaderboard`);
        return response.data.data.sort((a: { score: number; }, b: { score: number; }) => b.score - a.score);
    } catch (error) {
        console.error("Failed to fetch global leaderboard:", error);
        throw new Error("Could not fetch leaderboard.");
    }
};