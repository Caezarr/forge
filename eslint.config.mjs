import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Layer boundary: the domain is pure TypeScript. It must not reach into
    // browser storage, platform APIs, the server, React or UI components.
    files: ["src/lib/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/*",
                "@/app/*",
                "@/lib/storage/*",
                "@/lib/platform/*",
                "@/lib/server/*",
                "../storage/*",
                "../platform/*",
                "../server/*",
                "next",
                "next/*",
                "react",
                "react-dom",
              ],
              message: "src/lib/domain must stay pure: no storage, platform, server, React or UI imports.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
