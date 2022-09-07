# Node Standards _(@skyleague/node-standards)_

<p>
  <img alt="Lines of code" src="https://img.shields.io/tokei/lines/github/skyleague/node-standards">
  <img alt="Version" src="https://img.shields.io/github/package-json/v/skyleague/node-standards" />
  <img alt="LGTM Grade" src="https://img.shields.io/lgtm/grade/javascript/github/skyleague/node-standards">
  <img src="https://img.shields.io/badge/node-%3E%3D16-blue.svg" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Nihil est sine ratione.
>
> - Gottfried Wilhelm Leibniz

Node Standards is an opinionated collection of best practices, bundled in a way to easily configure new (and old) typescript projects.

Keeping up-to-date with project configuration is hard enough on a single repository, let alone if you have to manage a handful. With Node Standards you can centrally build your configuration, and define a project structure - and keep them up to date with a linter. Node Standards if flexible and extensible enough that you can make it work for any project.

```sh
node-standards <command>

Commands:
  node-standards create <name>  create a new project
  node-standards lint           lint the project configuration

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Install

Install Node Standards using [`npm`](https://www.npmjs.com/):

```console
 $ npm install --save-dev @skyleague/node-standards
```

## Table of Contents

<!-- toc -->

- [Install](#install)
- [Usage](#usage)
  * [Create](#Create)
  * [Lint](#Lint)
- [Alternative projects](#alternative-projects)
- [When not to use Node Standards?](#when-not-to-use-node-standards)
- [License](#license)

<!-- tocstop -->

## Usage


### Configuration

Node Standards takes little time to set up. 
 1. Add Node Standards to the devDependencies
 2. Configure the project linting in the package.json

The package.json should adhere to the following type:
```ts
interface PackageJson {
  ...
  "node-standards": {
    type: "yargs-cli" | "library"
    template?: {
        // a list of files to exclude from linting
        exclude?: string[]
        // by default all the options are enabled
        lint?: {
            files?: boolean
            dependencies?: boolean
            devDependencies?: boolean
            script?: boolean
            definition?: boolean
        }
    }
  },
  ...
}
```

### Create
Create a new project of the given type and name.

```console
node-standards create <name>

create a new project

Positionals:
  name  the new package name                                 [string] [required]

Options:
  --type     package type
      [string] [required] [choices: "library", "yargs-cli"] [default: "library"]
  --local    create from local examples instead of Github artifact
                                                       [boolean] [default: true]
```

### Lint
Ensure the project is up-to-date with the latest project structure and configuration. The `--fix` setting can be used to automatically fix most issues found.

```
node-standards lint

lint the project configuration

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --fix      try to fix the errors                    [boolean] [default: false]
```

## Alternative projects

In no particular order, the following libraries try to solve similar problems (albeit very different):

-   [`eslint-config-airbnb`](https://www.npmjs.com/package/eslint-config-airbnb); provides a default configuration for eslint

PR's are very welcome if you think your project is missing here.

## When not to use Node Standards?

- We aim to configure our settings to be as strict as possible. Not everyone might like this.
- Node Standards is an insanely opinionated implementation, and this may not fit your needs or vision.

## License & Copyright

Node Standards is [MIT licensed](./LICENSE.md)!

Copyright (c) 2022, all rights reserved by SkyLeague Technologies B.V.
'SkyLeague' and the astronaut logo are trademarks of SkyLeague Technologies B.V. 
registered at Chamber of Commerce in The Netherlands under number 86650564.
