import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference repos cloned for research only, not part of this app:
    "actual/**",
    "daylio-web/**",
    "maybe/**",
    "mindlogger-web/**",
    "pattern/**",
    "zen/**",
    "src/generated/**",
  ]),
]);

export default eslintConfig;
