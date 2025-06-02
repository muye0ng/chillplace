import withPWA from "next-pwa";

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  reactStrictMode: true,
  // 기타 next.js 옵션 필요시 추가
});

export default nextConfig;
