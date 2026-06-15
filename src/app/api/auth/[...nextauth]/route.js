import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
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
          
          // 🚀 ADDED 'editor' to the highest tier check so they get full Pro+ access!
          if (roles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro_plus') || r.includes('pro-plus') || r.includes('author') || r.includes('administrator') || r.includes('editor'))) {
            tier = 'pro_plus';
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
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.wpToken = user.token;
        token.wpUserId = user.id; 
        token.wpGlobalId = user.globalId;
        token.tier = user.tier;   
        token.roles = user.roles;
        token.sleeperId = user.sleeperId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.token = token.wpToken;
      session.user.id = token.wpUserId; 
      session.user.globalId = token.wpGlobalId;
      session.user.tier = token.tier;   
      session.user.roles = token.roles;
      session.user.sleeperId = token.sleeperId; 
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };