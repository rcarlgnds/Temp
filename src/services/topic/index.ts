import axios from 'axios';
import { CreateTopicPayload, ApiTopic } from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/topic`;

export const createTopic = async (payload: CreateTopicPayload): Promise<ApiTopic> => {
    try {
        const response = await axios.post<ApiTopic>(`${API_URL}/create-topic`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create topic:", error);
        throw new Error("Could not create topic.");
    }
};