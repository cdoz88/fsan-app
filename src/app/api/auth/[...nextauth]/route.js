import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// 🚀 FIXED: Added "export" so other API routes can securely reference authOptions
export const authOptions = {
  providers: [
    // 1. YOUR EXISTING WORDPRESS PROVIDER
    CredentialsProvider({
      name: "WordPress",
      credentials: {
        username: { label: "Username or Email", type: "text", placeholder: "you@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const query = `
          mutation LoginUser($username: String!, $password: String!) {
            login(
              input: {
                provider: PASSWORD,
                credentials: {username: $username, password: $password}
              }
            ) {
              authToken
              user {
                id
                databaseId
                name
                email
                description 
                avatar { url }
                roles {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        `;
        
        const res = await fetch('https://admin.fsan.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: {
              username: credentials.username,
              password: credentials.password,
            },
          }),
        });

        const json = await res.json();
        
        if (json?.data?.login?.authToken) {
          const { user, authToken } = json.data.login;
          const roles = user.roles?.nodes?.map(r => r.name.toLowerCase().replace(/&#043;/g, '+')) || [];
          
          let tier = 'free';
          
          if (roles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro_plus') || r.includes('pro-plus') || r.includes('author') || r.includes('administrator') || r.includes('editor'))) {
            tier = 'pro-plus';
          } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
            tier = 'pro';
          }

          return {
            id: user.databaseId,
            globalId: user.id, 
            name: user.name,
            email: user.email,
            image: user.avatar?.url,
            token: authToken,
            tier: tier,
            roles: roles,
            sleeperId: user.description 
          };
        }
        
        return null;
      }
    }),
    
    // 2. THE NEW GOOGLE PROVIDER (For YouTube Dashboard)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    // 🚀 FIX: Intercept "update" triggers and fetch fresh roles from WordPress, and manage Google tokens
    async jwt({ token, user, account, trigger }) {
      
      // If logging in via Google, grab the YouTube token
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
      }

      // If logging in via WordPress, grab the WP data
      if (user && account?.provider === "credentials") {
        token.wpToken = user.token;
        token.wpUserId = user.id; 
        token.wpGlobalId = user.globalId;
        token.tier = user.tier;   
        token.roles = user.roles;
        token.sleeperId = user.sleeperId;
      }

      if (trigger === "update" && token.wpUserId) {
        try {
          const query = `
            query GetUserFreshRoles($id: ID!) {
              user(id: $id, idType: DATABASE_ID) {
                roles {
                  nodes {
                    name
                  }
                }
              }
            }
          `;
          
          const res = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              variables: { id: token.wpUserId }
            }),
            cache: 'no-store'
          });
          
          const json = await res.json();
          if (json?.data?.user?.roles) {
            const freshRoles = json.data.user.roles.nodes?.map(r => r.name.toLowerCase().replace(/&#043;/g, '+')) || [];
            
            let freshTier = 'free';
            if (freshRoles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro_plus') || r.includes('pro-plus') || r.includes('author') || r.includes('administrator') || r.includes('editor'))) {
              freshTier = 'pro-plus';
            } else if (freshRoles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
              freshTier = 'pro';
            }
            
            token.roles = freshRoles;
            token.tier = freshTier;
          }
        } catch (err) {
          console.error("Failed to refresh user session from WP:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Pass the Google token to the session if it exists (for the YouTube API route)
      if (token.googleAccessToken) {
        session.accessToken = token.googleAccessToken;
      }

      // Pass the WordPress data to the session if it exists
      if (token.wpToken && session.user) {
        session.user.token = token.wpToken;
        session.user.id = token.wpUserId; 
        session.user.globalId = token.wpGlobalId;
        session.user.tier = token.tier;   
        session.user.roles = token.roles;
        session.user.sleeperId = token.sleeperId; 
      }
      
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };