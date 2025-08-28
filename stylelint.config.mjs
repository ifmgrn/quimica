/** @type {import('stylelint').Config} */
export default {
	extends: ["stylelint-config-standard-scss", "stylelint-config-prettier-scss"],
	plugins: ["stylelint-plugin-defensive-css", "stylelint-plugin-use-baseline"],
	ignoreFiles: ["**/*", "!styles/**/*"],
	rules: {
		"plugin/use-defensive-css": [
			true,
			{
				severity: "warning",
				"accidental-hover": true,
				"background-repeat": true,
				"flex-wrapping": true,
				"scroll-chaining": true,
				// "scrollbar-gutter" não é amplamente suportado
				"scrollbar-gutter": false,
				"vendor-prefix-grouping": true,
			},
		],
		"plugin/use-baseline": [
			true,
			{
				severity: "warning",
				ignoreSelectors: ["nesting"],
			},
		],
	},
};
