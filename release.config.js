module.exports = {
    branches: [
        { name: 'main' },
        ...(process.env.BETA_RELEASE === 'true'
            ? [
                  {
                      name: gitBranch(),
                      channel: 'beta',
                      prerelease: `beta-${gitSha().substring(0, 8)}`,
                  },
              ]
            : []),
    ],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'angular',
                releaseRules: [
                    { breaking: true, release: 'major' },
                    { revert: true, release: 'patch' },
                    { type: 'feat', release: 'minor' },
                    { type: 'fix', release: 'patch' },
                    { type: 'perf', release: 'patch' },
                    { type: 'docs', release: 'patch' },
                    { type: 'refactor', release: 'patch' },
                ],
                parserOpts: {
                    noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
                },
            },
        ],
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/github',
        '@semantic-release/npm',
    ],
}

function gitSha() {
    return (
        process.env.GITHUB_SHA ??
        // Fallback, will not be executed in CI environments
        require('child_process').execSync('git rev-parse HEAD', { cwd: process.cwd(), encoding: 'utf-8' })
    )
}
function gitBranch() {
    return (
        process.env.GITHUB_REF_NAME ??
        // Fallback, will not be executed in CI environments
        require('child_process').execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd(), encoding: 'utf-8' })
    )
}
