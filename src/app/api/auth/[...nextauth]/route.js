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
        // 🚀 NEW: Added the "roles" block to the GraphQL query
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
                databaseId
                name
                email
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
          
          // 🚀 NEW: Parse roles safely (handling WordPress's weird &#043; encoding for plus signs)
          const roles = user.roles?.nodes?.map(r => r.name.toLowerCase().replace(/&#043;/g, '+')) || [];
          
          let tier = 'free';
          
          // 🚀 NEW: If the user is an Author, Administrator, or Pro+, assign them the highest tier!
          if (roles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro_plus') || r.includes('pro-plus') || r.includes('author') || r.includes('administrator'))) {
            tier = 'pro_plus';
          } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
            tier = 'pro';
          }

          return {
            id: user.databaseId,
            name: user.name,
            email: user.email,
            image: user.avatar?.url,
            token: authToken,
            tier: tier,     // Pass the calculated tier
            roles: roles    // Pass the raw roles array just in case you need it later
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
        token.tier = user.tier;   // Save the tier to the JWT token
        token.roles = user.roles; // Save roles to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.token = token.wpToken;
      session.user.id = token.wpUserId; 
      session.user.tier = token.tier;   // Inject tier into the global session!
      session.user.roles = token.roles;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };