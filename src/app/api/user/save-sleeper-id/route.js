import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Securely grab the user's active session and WordPress JWT
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || !token.wpToken || !token.wpGlobalId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { sleeperId } = await req.json();
        if (!sleeperId) return NextResponse.json({ success: false, message: "No Sleeper ID provided" }, { status: 400 });

        // Fire a GraphQL mutation to save the Sleeper ID into the user's Description field
        const query = `
          mutation UpdateSleeperId($id: ID!, $description: String!) {
            updateUser(input: {id: $id, description: $description}) {
              user {
                databaseId
              }
            }
          }
        `;

        const res = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.wpToken}`
            },
            body: JSON.stringify({
                query,
                variables: {
                    id: token.wpGlobalId,
                    description: sleeperId
                }
            })
        });

        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].message);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}