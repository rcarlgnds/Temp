import NextAuth, { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const azureADClientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const azureADClientSecret = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET;
const azureADTenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;

if (!azureADClientId || !azureADClientSecret || !azureADTenantId) {
    throw new Error("Missing Azure AD environment variables. Check your .env file.");
}

async function refreshAccessToken(token: any) {
    try {
        const url = `https://login.microsoftonline.com/${azureADTenantId}/oauth2/v2.0/token`;

        if (!azureADClientId || !azureADClientSecret || !azureADTenantId ){
            throw new Error("Missing Azure AD environment variables. Check your .env file.");
        }

        const body = new URLSearchParams({
            client_id: azureADClientId,
            client_secret: azureADClientSecret,
            scope: "email openid profile User.Read offline_access",
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
        });

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            body,
        });

        const refreshedTokens = await response.json();
        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.id_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("RefreshAccessTokenError", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    const res = await fetch("http://localhost:6969/api/users/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!res.ok) {
                        console.error("Backend login failed:", await res.text());
                        return null;
                    }

                    const user = await res.json();
                    // Ensure the returned object from your API matches this structure
                    if (user && user.playerId) {
                        return {
                            id: user.playerId,
                            name: user.username,
                            email: user.email,
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Error during authorization:", e);
                    return null;
                }
            },
        }),
        AzureADProvider({
            clientId: azureADClientId,
            clientSecret: azureADClientSecret,
            tenantId: azureADTenantId,
            authorization: {
                params: { scope: "openid email profile User.Read offline_access" },
            },
            httpOptions: { timeout: 10000 },
        }),
    ],
    callbacks: {

        async signIn({ user, account }) {
            if (account?.provider !== "credentials" && user.email) {
                try {
                    await fetch("http://localhost:6969/api/users/add-player", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            Username: user.name?.toLowerCase() || user.email.split("@")[0],
                            Email: user.email,
                        }),
                    });
                } catch (error) {
                    console.error("Error registering user during signIn:", error);
                    // Decide if a failed registration should prevent sign-in
                    // return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (account && user) {
                return {
                    accessToken: account.id_token,
                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
                    refreshToken: account.refresh_token,
                    user,
                };
            }

            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token;
            }

            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.user = token.user;
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };