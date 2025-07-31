import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
        accessToken?: string;
        error?: string;
    }

    interface User extends DefaultUser {
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessTokenExpires?: number;
        accessToken?: string;
        refreshToken?: string;
        error?: string;
        user?: Session["user"];
    }
}