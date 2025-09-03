import order from "./stylelint.order.config.mjs";

/** @type {import('stylelint').Config} */
export default {
	extends: ["stylelint-config-standard-scss", "stylelint-config-prettier-scss"],
	plugins: [
		"stylelint-order",
		"stylelint-plugin-defensive-css",
		"stylelint-plugin-use-baseline",
	],
	ignoreFiles: ["**/*", "!styles/**/*"],
	defaultSeverity: "warning",
	rules: {
		"declaration-empty-line-before": [
			"always",
			{
				except: ["first-nested"],
				ignore: [
					"after-declaration",
					"after-comment",
					"inside-single-line-block",
				],
			},
		],
		"at-rule-empty-line-before": [
			"always",
			{
				ignore: [
					"first-nested",
					"blockless-after-same-name-blockless",
					"after-comment",
				],
				ignoreAtRules: ["else"],
			},
		],

		"order/order": [
			[
				{ type: "at-rule", name: "import" },
				{ type: "at-rule", name: "forward" },
				{ type: "at-rule", name: "use" },
				"dollar-variables",
				"at-variables",
				"custom-properties",
				{ type: "at-rule", name: "custom-media" },
				{ type: "at-rule", name: "function" },
				{ type: "at-rule", name: "mixin" },
				{ type: "at-rule", name: "extend" },
				"declarations",
				{
					type: "rule",
					selector: /^&::[\w-]+/,
					hasBlock: true,
				},
				"rules",
				{ type: "at-rule", name: "media", hasBlock: true },
			],
		],
		"order/properties-order": [
			order,
			{
				unspecified: "bottomAlphabetical",
				emptyLineBeforeUnspecified: "always",
				emptyLineMinimumPropertyThreshold: 5,
			},
		],
		"plugin/use-defensive-css": [
			true,
			{
				severity: "error",
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
				severity: "error",
				ignoreSelectors: ["nesting"],
			},
		],
	},
};
