/**
 * @type {import('lint-staged').Configuration}
 */

const settings = {
	"src/**/*": [() => "tsc", "eslint --fix", "prettier --write"],
	"styles/**/*": ["stylelint --fix", "prettier --write"],
	"tsconfig.json|pnpm-lock.yaml": [() => "tsc", "prettier --write"],
	"eslint.config.mjs": [() => "eslint", "prettier --write"],
	"stylelint.config.mjs": [() => "stylelint .", "prettier --write"],
	"prettier.config.mjs": [() => "prettier --check .", "prettier --write"],
};
settings[`!(${Object.keys(settings).join("|")})`] = [
	"prettier --write --ignore-unknown",
];

export default settings;
