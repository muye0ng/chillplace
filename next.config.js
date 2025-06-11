/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // 빌드 시 ESLint 에러를 무시 (필요한 경우)
    ignoreDuringBuilds: false,
  },
  typescript: {
    // 빌드 시 TypeScript 에러를 무시 (필요한 경우)
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
