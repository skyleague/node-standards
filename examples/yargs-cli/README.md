# Library project layout
This is the boilerplate for a library package

<!-- toc -->
* [Library project layout](#library-project-layout)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g package-name
$ example-cli COMMAND
running command...
$ example-cli (-v|--version|version)
package-name/0.0.1 win32-x64 node-v12.6.0
$ example-cli --help [COMMAND]
USAGE
  $ example-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`example-cli goodbye [FILE]`](#example-cli-goodbye-file)
* [`example-cli hello [FILE]`](#example-cli-hello-file)
* [`example-cli help [COMMAND]`](#example-cli-help-command)

## `example-cli goodbye [FILE]`

describe the command here

```
USAGE
  $ example-cli goodbye [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

## `example-cli hello [FILE]`

describe the command here

```
USAGE
  $ example-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ example-multi-ts hello
  hello world from ./src/hello.ts!
```

## `example-cli help [COMMAND]`

display help for example-cli

```
USAGE
  $ example-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src\commands\help.ts)_
<!-- commandsstop -->
