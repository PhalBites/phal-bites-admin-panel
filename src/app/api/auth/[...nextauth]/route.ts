// @ts-expect-error - Bypassing type checking for Next.js API route
import NextAuth from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
