module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: true,
    },
    reportUnusedDisableDirectives: true,
    plugins: ['@typescript-eslint', 'import', 'unused-imports', 'unicorn'],
    extends: [
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'plugin:prettier/recommended',
    ],
    rules: {
        'unicorn/prefer-node-protocol': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/consistent-type-imports': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unnecessary-condition': 'warn',
        '@typescript-eslint/strict-boolean-expressions': [
            'error',
            {
                allowNullableBoolean: true,
            },
        ],
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
            },
        ],
        '@typescript-eslint/no-unused-vars': [
            'error',
            { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
        ],
        'unused-imports/no-unused-imports': 'error',
        'import/order': [
            'error',
            {
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin'],
                'newlines-between': 'always',
                pathGroups: [
                    {
                        group: 'internal',
                        pattern: '~/**',
                    },
                ],
            },
        ],
        'prefer-template': 'error',
        'no-duplicate-imports': 'off',
        'no-shadow': 'off',
        eqeqeq: ['error', 'always'],
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    // starting typescript 4.8 we should use this in generics again
                    '{}': false,
                },
                extendDefaults: true,
            },
        ],
        ...(process.env.VSCODE_PID !== undefined || process.env.FULL_LINT === '1'
            ? {
                  '@typescript-eslint/explicit-module-boundary-types': 'warn',
                  // https://github.com/typescript-eslint/typescript-eslint/issues/2143
                  // '@typescript-eslint/prefer-readonly-parameter-types': ['warn', { checkParameterProperties: false }],
                  '@typescript-eslint/naming-convention': [
                      'warn',
                      { leadingUnderscore: 'allow', selector: 'property', format: ['camelCase', 'PascalCase'] },
                  ],
              }
            : {}),
    },
    overrides: [
        {
            files: ['*.js', '.*.js', '*.cjs', '.*.cjs'],
            rules: {
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                'no-undef': 'off',
            },
        },
        {
            files: ['*.spec.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/unbound-method': 'off',
                '@typescript-eslint/no-throw-literal': 'off',
                '@typescript-eslint/no-unnecessary-condition': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
            },
        },
        {
            files: ['*.type.ts'],
            reportUnusedDisableDirectives: false,
        },
        {
            files: ['*.json'],
            rules: {
                '@typescript-eslint/naming-convention': 'off',
            },
        },
    ],
}
