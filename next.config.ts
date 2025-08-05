// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//       },
      
//     ],
//     domains: [
//       'upload.wikimedia.org',
//       'i.guim.co.uk',
//       'cdn.pixabay.com',
//       'wonderla.com',
//       'images.unsplash.com',
//       'plus.unsplash.com',
//       'www.shutterstock.com',
//        "assets.monica.im",
//        "encrypted-tbn0.gstatic.com"

//     ],
//   },
//   // Performance optimizations
//   experimental: {
//     optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
//   },
//   // Reduce bundle size
//   webpack: (config, { dev, isServer }) => {
//     if (!dev && !isServer) {
//       config.optimization.splitChunks = {
//         chunks: 'all',
//         cacheGroups: {
//           vendor: {
//             test: /[\\/]node_modules[\\/]/,
//             name: 'vendors',
//             chunks: 'all',
//           },
//         },
//       };
//     }
//     return config;
//   },
//   // Disable source maps in production for better performance
//   productionBrowserSourceMaps: false,
// };

// export default nextConfig;
import type { NextConfig } from "next";
 
const isProd = process.env.NODE_ENV === "production";
 
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: isProd, // Skip ESLint in production builds
  },
  typescript: {
    ignoreBuildErrors: isProd, // Skip TypeScript errors in production builds
  },
  images: {
    domains: ['syd1.digitaloceanspaces.com','localhost'],
  },
 
};
 
export default nextConfig;
 