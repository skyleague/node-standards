/** @type {import('prettier').Config} */
module.exports = {
    tabWidth: 4,
    printWidth: 130,
    semi: false,
    trailingComma: 'es5',
    bracketSpacing: true,
    parser: 'typescript',
    singleQuote: true,
    proseWrap: 'never',
    overrides: [
        {
            files: '**/*.json',
            options: {
                parser: 'json',
                tabWidth: 2,
            },
        },
        {
            files: '**/package.json',
            options: {
                parser: 'json-stringify',
            },
        },
        {
            files: ['**/*.yml', '**/*.yaml'],
            options: {
                parser: 'yaml',
                tabWidth: 2,
            },
        },
        {
            files: ['**/*.md'],
            options: {
                parser: 'markdown',
            },
        },
    ],
}
