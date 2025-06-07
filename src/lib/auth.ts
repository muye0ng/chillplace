import GoogleProvider from 'next-auth/providers/google'
import NaverProvider from 'next-auth/providers/naver'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import type { NextAuthOptions } from 'next-auth'

// 카카오 커스텀 프로바이더
const KakaoProvider = (options: { clientId: string; clientSecret: string }) => {
  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: {
        scope: "account_email profile_nickname profile_image",
        response_type: "code",
        state: Math.random().toString(36).substring(7),
        nonce: Math.random().toString(36).substring(7),
        prompt: "consent"
      },
    },
    token: {
      url: "https://kauth.kakao.com/oauth/token",
      async request({ provider, params }: { provider: any; params: any }) {
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: provider.clientId!,
          client_secret: provider.clientSecret!,
          code: params.code!,
          redirect_uri: provider.callbackUrl!,
        });

        const response = await fetch(provider.token.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: body.toString(),
        });

        const tokens = await response.json();

        // refresh_token_expires_in 제거 (PostgREST 스키마 캐시 문제 임시 해결)
        if (tokens.refresh_token_expires_in) {
          delete tokens.refresh_token_expires_in;
        }

        return { tokens };
      }
    },
    userinfo: {
      url: "https://kapi.kakao.com/v2/user/me",
      async request({ tokens }: { tokens: any }) {
        const response = await fetch("https://kapi.kakao.com/v2/user/me", {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        });

        const profile = await response.json();
        return profile;
      }
    },
    profile(profile: { id: number; kakao_account?: { profile?: { nickname: string; profile_image_url: string }; email: string }; properties?: { nickname: string; profile_image: string } }) {
      return {
        id: String(profile.id),
        name: profile.kakao_account?.profile?.nickname || profile.properties?.nickname,
        email: profile.kakao_account?.email,
        image: profile.kakao_account?.profile?.profile_image_url || profile.properties?.profile_image,
      };
    },
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    allowDangerousEmailAccountLinking: true,
  };
};

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          auth_type: "reprompt"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'database',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  pages: {
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 NextAuth SignIn:', { 
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        provider: account?.provider,
        profile: profile
      });
      
      // 간단한 로그만 남기고 NextAuth가 자동으로 처리하도록 함
      if (account?.provider && user.email) {
        const providerData = {
          provider: account.provider,
          provider_id: account.providerAccountId,
          username: user.name || user.email.split('@')[0],
          full_name: user.name,
          avatar_url: user.image,
        };
        
        console.log('🔍 Provider Data:', providerData);
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔍 NextAuth Redirect:', { url, baseUrl });
      
      // OAuth 콜백에서 리다이렉트할 때
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/ko`;
      }
      
      return url;
    },
    async session({ session, user }) {
      console.log('🔍 NextAuth Session:', { session, user });
      
      if (user && session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('❌ NextAuth Error:', { code, metadata });
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', { code, metadata });
    },
  },
} 