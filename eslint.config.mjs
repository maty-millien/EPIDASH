import pluginImport from "eslint-plugin-import"
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"

export default [
  {
    ignores: ["node_modules", ".vite", "out", "dist"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: pluginImport,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          allowSameFolder: false,
          rootDir: "src",
          prefix: "@",
        },
      ],
    },
  },
]
