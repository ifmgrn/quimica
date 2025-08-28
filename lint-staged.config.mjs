/**
 * @type {import('lint-staged').Configuration}
*/
export default {
    'src/**/*.{js,ts}': [() => 'tsc', 'eslint --fix'],
    'styles/**/*.{css,scss}': 'stylelint --fix'
};