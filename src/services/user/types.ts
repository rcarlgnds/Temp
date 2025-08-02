export interface AddUserPayload {
    Username: string;
    Email: string;
    Password?: string;
}

export interface LoginPayload {
    Email: string;
    Password: string;
}

export interface ApiUser {
    playerId: string;
    username: string;
    email: string;
}