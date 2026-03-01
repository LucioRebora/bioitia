import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.OAUTH_CLIENT_ID!,
            clientSecret: process.env.OAUTH_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    laboratoryId: user.laboratoryId,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                if (!user.email) return false;

                // Buscar si existe el usuario
                let dbUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                // Si no existe, creamos uno básico auto-registrado
                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "Usuario de Google",
                            password: "", // Contraseña vacía porque entra con oauth
                            role: "USER"
                        }
                    });
                }

                // Mapeamos los datos al objeto de sesión
                user.id = dbUser.id;
                (user as any).role = dbUser.role;
                (user as any).laboratoryId = dbUser.laboratoryId;
                return true;
            }
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            if (trigger === "update" && session) {
                if (session.name !== undefined) token.name = session.name;
            }
            if (user) {
                token.id = user.id;
                // Preserve role and param added from sign in callback or credentials logic
                token.role = (user as any).role || "USER";
                token.laboratoryId = (user as any).laboratoryId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).laboratoryId = token.laboratoryId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
