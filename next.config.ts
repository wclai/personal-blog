/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",     // upload request limit
      allowedOrigins: ["*"],    // optional
    },
  },
};

export default nextConfig;
