module.exports = {
    '*.{ts,tsx}': (filenames) =>
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        filenames.length > 10 ? 'npm run lint:fix' : `npm run lint:fix -- ${filenames.join(' ')}`,
    '*': ['biome check --no-errors-on-unmatched --files-ignore-unknown=true --apply-unsafe'],
}
