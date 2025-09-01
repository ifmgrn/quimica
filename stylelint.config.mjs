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
	rules: {
		"declaration-empty-line-before": null,
		"at-rule-empty-line-before": null,
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
			{ severity: "warning" },
		],
		"order/properties-order": [
			order,
			{
				severity: "warning",
				unspecified: "bottomAlphabetical",
				emptyLineBeforeUnspecified: "always",
				emptyLineMinimumPropertyThreshold: 5,
			},
		],
		"plugin/use-defensive-css": [
			true,
			{
				"accidental-hover": true,
				"background-repeat": true,
				"flex-wrapping": true,
				"scroll-chaining": true,
				// "scrollbar-gutter" não é amplamente suportado
				"scrollbar-gutter": false,
				"vendor-prefix-grouping": true,
			},
		],
		"plugin/use-baseline": [true, { ignoreSelectors: ["nesting"] }],
	},
};
