/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // ── 301 redirects — old WordPress .html URLs ────────────────
  async redirects() {
    return [
      // Static page .html → clean URLs
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      { source: '/projects.html', destination: '/projects', permanent: true },
      { source: '/team.html', destination: '/team', permanent: true },
      { source: '/clients.html', destination: '/clients', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/jobs.html', destination: '/jobs', permanent: true },
      { source: '/press.html', destination: '/press', permanent: true },
      { source: '/innovation.html', destination: '/innovation', permanent: true },
      { source: '/join-us.html', destination: '/join-us', permanent: true },
      { source: '/content-library.html', destination: '/content-library', permanent: true },
      { source: '/terms.html', destination: '/terms', permanent: true },
      { source: '/privacy.html', destination: '/privacy', permanent: true },
      { source: '/accessibility.html', destination: '/accessibility', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      // WordPress-style patterns
      { source: '/services/:slug.html', destination: '/services/:slug', permanent: true },
      { source: '/projects/:slug.html', destination: '/projects/:slug', permanent: true },
      // Hebrew-encoded WordPress URLs
      { source: '/he', destination: '/', permanent: true },
      { source: '/he/', destination: '/', permanent: true },
      { source: '/%D7%90%D7%95%D7%93%D7%95%D7%AA', destination: '/about', permanent: true },
      { source: '/%D7%90%D7%95%D7%93%D7%95%D7%AA/', destination: '/about', permanent: true },
      // WordPress category/blog patterns
      { source: '/projects-category/:slug*', destination: '/projects', permanent: true },
      { source: '/clients/:slug', destination: '/clients', permanent: true },
      { source: '/team/:slug', destination: '/team', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug*', destination: '/', permanent: true },
    ];
  },

  // ── Security headers — DOC-060 §7 (H-01) ──────────────────
  async headers() {
    return [
      // Static assets: browser-cacheable (images, fonts, etc.)
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // Pages + API: force revalidation (no stale HTML/API responses)
      {
        source: '/((?!_next/static|_next/image|images|favicon).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          // Netlify edge CDN: never cache dynamic pages (prevents stale SSR)
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Netlify-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://cdn.sanity.io https://*.googleusercontent.com https://www.google-analytics.com https://www.googletagmanager.com",
              "media-src 'self' https://cdn.sanity.io",
              "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://challenges.cloudflare.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com",
              "frame-src https://challenges.cloudflare.com https://www.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
