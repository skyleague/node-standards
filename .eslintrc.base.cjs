module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: 'tsconfig.json',
    },
    reportUnusedDisableDirectives: true,
    plugins: ['@typescript-eslint', 'import', 'unused-imports'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'plugin:prettier/recommended',
    ],
    rules: {
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/consistent-indexed-object-style': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/sort-type-union-intersection-members': 'error',
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
            },
        ],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error',
            { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/strict-boolean-expressions': [
            'error',
            {
                allowNullableBoolean: true,
            },
        ],
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
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
        'max-classes-per-file': 'off',
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
            files: ['*.js', '.*.js'],
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
            },
        },
        {
            files: ['*.json'],
            rules: {
                '@typescript-eslint/naming-convention': 'off',
            },
        },
    ],
}
