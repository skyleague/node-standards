declare module 'variable-diff' {
    const diff: (obj: unknown, other: unknown) => { text: string }
    export default diff
}
