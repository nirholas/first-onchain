import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Container builds have no .git directory, so Cloud Build passes GIT_SHA; Git checkouts (Cloudflare) resolve HEAD.
function resolveBuildCommit(): string {
  const supplied = process.env.GIT_SHA;
  if (supplied && supplied !== "development") return supplied;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "development";
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  env: { BUILD_COMMIT: resolveBuildCommit() },
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["lucide-react"] },
  headers: async () => [{
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests" }
    ]
  }]
};

export default nextConfig;
