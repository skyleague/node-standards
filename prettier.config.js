/** @typedef {import('prettier').Options} PrettierOptions */
/** @type {PrettierOptions & { overrides: Array<{ files: string; options: PrettierOptions }>}} */
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
