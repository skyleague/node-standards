export interface PackageConfiguration {
    extends: [string, ...string[]] | string
    ignorePatterns?: string[] | undefined
    rules?:
        | {
              publishConfig?: boolean | undefined
              license?: boolean | undefined
              engines?: boolean | undefined
              files?: boolean | undefined
              dependencies?: boolean | undefined
              devDependencies?: boolean | undefined
              scripts?: boolean | undefined
              packageType?: boolean | undefined
              exports?: boolean | undefined
              types?: boolean | undefined
              main?: boolean | undefined
              workspaces?: boolean | undefined
          }
        | undefined
    projectSettings?:
        | {
              [k: string]: string | undefined
          }
        | undefined
}
