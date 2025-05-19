/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
   // This enables static HTML export (next export)
  images: {
    domains: ['cdn.myanimelist.net', 'api.jikan.moe', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig

