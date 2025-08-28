/**
 * @type {import('lint-staged').Configuration}
 */

const settings = {
	"src/**/*": [() => "tsc", "eslint --fix", "prettier --write"],
	"styles/**/*": ["stylelint --fix", "prettier --write"],
};
settings[`!(${Object.keys(settings).join("|")})`] = [
	"prettier --write --ignore-unknown",
];

export default settings;
