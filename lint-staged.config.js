module.exports = {
    '*.{ts,tsx}': (filenames) =>
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        filenames.length > 10 ? 'npm run fix' : `npm run fix -- ${filenames.join(' ')}`,

    '*.{json,yml,yaml}': (filenames) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const files = filenames.filter((f) => !f.endsWith('package-lock.json'))
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return files.length > 0 ? `prettier --write ${files.join(' ')}` : 'true'
    },
}
