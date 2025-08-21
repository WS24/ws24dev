// @ts-check
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "client/src/__tests__/**",
      "**/*.config.*",
      "babel.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "drizzle.config.ts",
      "eslint.config.js",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];

