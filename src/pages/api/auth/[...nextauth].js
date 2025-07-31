import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from "next-auth/providers/credentials";

const env = process.env;

async function refreshAccessToken(token) {
  try {
    const url = `https://login.microsoftonline.com/${env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id:
        process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || 'azure-ad-client-id',
      client_secret:
        process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET ||
        'azure-ad-client-secret',
      scope: 'email openid profile User.Read offline_access',
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
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
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions = {
  providers: [
     CredentialsProvider({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const res = await fetch("http://localhost:6969/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials?.email,
        password: credentials?.password,
      }),
    });

    if (!res.ok) return null;

    const user = await res.json();

    if (user) {
      return {
        id: user.playerId,
        name: user.username,
        email: user.email,
      };
    }
    return null;
  },
}),

    AzureADProvider({
      clientId: `${env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID}`,
      clientSecret: `${env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET}`,
      tenantId: `${env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
      authorization: {
        params: { scope: 'openid email profile User.Read  offline_access' },
      },
      httpOptions: { timeout: 10000 },
    }),
  ],
  callbacks: {

     async signIn({ user }) {
    try {
      await fetch("http://localhost:6969/api/users/add-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: user.name?.toLowerCase(),
          Email: user.email,
        }),
      });
    } catch (error) {
      console.error("Error registering user during signIn:", error);
    }

    return true; 
  },
  
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          accessToken: account.id_token,
          accessTokenExpires: account?.expires_at
            ? account.expires_at * 1000
            : 0,
          refreshToken: account.refresh_token,
          user,
        };
      }

      if (Date.now() < token.accessTokenExpires - 100000 || 0) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session) {
        session.user = token.user;
        session.error = token.error;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
export default NextAuth(authOptions);
