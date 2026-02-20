/**
 * NextAuth configuration — DOC-010 §3.5
 * Google OAuth, JWT sessions, email whitelist + domain allowlist.
 */
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const ALLOWED_DOMAINS = ['wdiglobal.com', 'wdi.co.il', 'wdi.one'];

function isEmailAllowed(email: string): boolean {
  const whitelist = process.env.ADMIN_ALLOWED_EMAILS;
  if (whitelist) {
    const allowed = whitelist.split(',').map((e) => e.trim().toLowerCase());
    if (allowed.includes(email.toLowerCase())) {
      return true;
    }
  }

  const domain = email.split('@')[1];
  if (domain && ALLOWED_DOMAINS.includes(domain.toLowerCase())) {
    return true;
  }

  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return isEmailAllowed(user.email);
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
};
