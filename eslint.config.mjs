import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	{
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: {
			globals: globals.browser,
		},
		rules: {
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		},
	},
	tseslint.configs.recommended,
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_" },
			],
		},
	},
	{
		files: ["**/*.d.ts"],
		rules: {
			"@typescript-eslint/no-unused-vars": "off",
		},
	},

	globalIgnores(["*", "!src/", "*.js"]),
]);
