import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// typescript-eslint rejects TypeScript 7, so files are parsed with Babel's TS preset; type checking stays with tsc.
// Remove once typescript-eslint supports TS >= 7.1 (https://github.com/typescript-eslint/typescript-eslint/issues/10940).
const LEVELS = ["atoms", "molecules", "organisms", "templates", "pages"];

const COMPONENT_FOLDER_IMPORTS = {
  group: ["~/components/*/*/*.utils", "~/components/*/*/*.schemas", "~/components/*/*/*.models", "../*/*"],
  message: "Do not reach into another component's folder; lift shared code (STD-006).",
};

/** A level may only import levels below it (STD-003); `blocked` lists the levels it must not reach. */
function levelRule(level, blocked) {
  return {
    files: [`app/components/${level}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            COMPONENT_FOLDER_IMPORTS,
            ...blocked.map((b) => ({
              group: [`~/components/${b}/**`],
              message: `${level} may only import levels below it (pages > templates > organisms > molecules > atoms).`,
            })),
            { group: ["~/routes/**"], message: "Components must not import route modules." },
          ],
        },
      ],
    },
  };
}

export default [
  { ignores: ["build/**", ".react-router/**", "node_modules/**"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { presets: ["@babel/preset-typescript", "@babel/preset-react"] },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Headers: "readonly",
        URL: "readonly",
        ResizeObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearInterval: "readonly",
        process: "readonly",
      },
    },
    plugins: { "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-undef": "off",
      "no-unused-vars": "off",
      "react/no-multi-comp": ["error", { ignoreStateless: false }],
      "react/no-unstable-nested-components": "error",
      "react/prop-types": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "VariableDeclarator[init.type=/^JSX(Element|Fragment)$/]",
          message: "Do not hold JSX in a variable; extract a component (STD-002).",
        },
      ],
      "no-restricted-imports": ["error", { patterns: [COMPONENT_FOLDER_IMPORTS] }],
    },
  },
  levelRule("atoms", LEVELS),
  levelRule("molecules", LEVELS.slice(1)),
  levelRule("organisms", LEVELS.slice(2)),
  levelRule("templates", LEVELS.slice(3)),
  levelRule("pages", LEVELS.slice(4)),
];
