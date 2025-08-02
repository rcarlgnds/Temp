import axios from 'axios';
import { AddUserPayload, LoginPayload, ApiUser } from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

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
        const response = await axios.get<ApiUser>(`${API_URL}/get-player-by-email`, {
            params: { Email: email }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to get user by email:", error);
        throw new Error("Could not fetch user.");
    }
};