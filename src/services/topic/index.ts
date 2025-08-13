import axios from 'axios';
import {CreateTopicPayload, ApiTopic, Topic} from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/topic`;

export const createTopic = async (payload: CreateTopicPayload): Promise<ApiTopic> => {
    try {
        const response = await axios.post<ApiTopic>(`${API_URL}/create-topic`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create topic:", error);
        throw new Error("Could not create topic.");
    }
};

export const getAllTopics = async (): Promise<Topic[]> => {
    try {
        const response = await axios.get<Topic[]>(`${API_URL}/get-all-topics`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch topics:", error);
        throw new Error("Could not fetch topics.");
    }
};