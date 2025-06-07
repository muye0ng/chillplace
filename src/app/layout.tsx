import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import NextAuthProvider from '@/components/providers/NextAuthProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "칠 플레이스",
  description: "편안한 카페와 장소를 찾아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <Head>
        {/* PWA 및 앱 메타태그 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="위치기반 실시간 리뷰 플랫폼, 칠 플레이스" />
        {/* SEO/소셜 미리보기 메타태그 */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="칠 플레이스" />
        <meta property="og:title" content="칠 플레이스 - 위치기반 실시간 리뷰 플랫폼" />
        <meta property="og:description" content="내 주변 핫플, 실시간 리뷰, 투표, 즐겨찾기까지! 칠 플레이스에서 확인하세요." />
        <meta property="og:image" content="/icons/icon-512x512.png" />
        <meta property="og:url" content="https://칠플레이스.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="칠 플레이스 - 위치기반 실시간 리뷰 플랫폼" />
        <meta name="twitter:description" content="내 주변 핫플, 실시간 리뷰, 투표, 즐겨찾기까지! 칠 플레이스에서 확인하세요." />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SWRConfig value={{ revalidateOnFocus: false }}>
              {children}
            </SWRConfig>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
