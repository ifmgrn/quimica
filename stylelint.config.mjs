/** @type {import('stylelint').Config} */
export default {
    extends: [
        'stylelint-config-standard-scss',
        'stylelint-config-recess-order'
    ],
    plugins: [
        'stylelint-plugin-defensive-css',
        'stylelint-plugin-use-baseline'
    ],
    rules: {
        'plugin/use-defensive-css': [true, { 
            severity: 'warning',
            'accidental-hover': true,
            'background-repeat': true,
            'flex-wrapping': true,
            'scroll-chaining': true,
            'scrollbar-gutter': true,
            'vendor-prefix-grouping': true
        }],
        'plugin/use-baseline': [true, { 
            severity: 'warning',
            ignoreSelectors: ['nesting']
        }],
    },
    overrides: [
        {
            files: ["styles/**/*.scss"],
            customSyntax: "postcss-scss"
        }
    ]
};