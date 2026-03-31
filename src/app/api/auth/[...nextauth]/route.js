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
                databaseId
                name
                email
                avatar { url }
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
          return {
            id: user.databaseId,
            name: user.name,
            email: user.email,
            image: user.avatar?.url,
            token: authToken,
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
        token.wpUserId = user.id; // Explicitly save the ID to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.token = token.wpToken;
      session.user.id = token.wpUserId; // Explicitly pass the ID to the frontend session
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };