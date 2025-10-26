/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude onnxruntime-node (Node.js native bindings) from the bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
    };

    // Fallback for .node files - treat as assets
    config.module.rules.push({
      test: /\.node$/,
      type: 'asset/resource',
    });

    return config;
  },
}

module.exports = nextConfig
