declare module 'line-diff' {
    class LineDiff {
        public constructor(old: string, current: string)
        public toString(): string
    }
    export default LineDiff
}
