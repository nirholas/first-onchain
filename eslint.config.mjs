import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    // Wallet icons and locally generated object-URL previews cannot use the
    // Next.js image optimizer without leaking local data or adding a proxy.
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);
