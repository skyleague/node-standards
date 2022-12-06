import { spawn, isIgnored } from '../../common'
import { rootDirectory, version } from '../../lib/constants'
import { Project } from '../../lib/project'
import { templates } from '../../lib/templates'
import type { ProjectTemplateDefinition } from '../../lib/templates/types'
import { PackageType } from '../../lib/types'

import AdmZip from 'adm-zip'
import type { Argv } from 'yargs'

import fs, { rmSync } from 'fs'
import type { IncomingHttpHeaders } from 'http'
import https from 'https'
import { tmpdir } from 'os'
import path from 'path'
import { promisify } from 'util'

function httpsGet(url: string): Promise<{ content: Buffer; headers: IncomingHttpHeaders }> {
    return new Promise<{ content: Buffer; headers: IncomingHttpHeaders }>((resolve, reject) => {
        const req = https.get(url, (response): void => {
            void (async () => {
                const chunks: Buffer[] = []
                try {
                    for await (const chunk of response[Symbol.asyncIterator]()) {
                        chunks.push(Buffer.from(chunk as WithImplicitCoercion<ArrayBuffer>))
                    }
                } catch (err: unknown) {
                    reject(err)
                }
                if (response.headers.location !== undefined) {
                    return httpsGet(response.headers.location).then(resolve).catch(reject)
                }
                return resolve({ content: Buffer.concat(chunks), headers: response.headers })
            })()
        })
        req.on('error', reject)
    })
}

function createLocalZip(dir: string, type: string) {
    const zip = new AdmZip()
    zip.addLocalFolder(path.join(dir, `examples/${type}`), '', (name) => {
        if (name.includes('node_modules')) {
            return false
        }
        return !isIgnored(name)
    })
    return { zip, cleanup: () => true }
}

async function createRemoteZip(url: string, type: string) {
    const tmpDir = fs.mkdtempSync(tmpdir())
    const { content, headers } = await httpsGet(url)
    const rootFolder = `${headers['content-disposition']?.match(/filename=(.+)\..+$/)?.[1] ?? ''}/`
    const remoteZip = new AdmZip(content)

    const entry = remoteZip.getEntry(rootFolder)
    if (entry !== null) {
        remoteZip.extractEntryTo(entry, tmpDir, true, true)
    }
    const { zip } = createLocalZip(`${tmpDir}/${rootFolder}`, type)
    return { zip, cleanup: () => rmSync(tmpDir, { recursive: true, force: true }) }
}

export async function createProject({
    type,
    name,
    local,
    template,
}: {
    type: string
    name: string
    local: boolean
    template: ProjectTemplateDefinition
}): Promise<void> {
    const targetDir = path.resolve(process.cwd(), name)

    await spawn('git', ['init', targetDir])

    const { zip, cleanup } =
        local || template.repositoryUrl === undefined
            ? createLocalZip(template.roots[0], type)
            : await createRemoteZip(`${template.repositoryUrl}/archive/v${version}.zip`, type)

    const extractAllToAsync = promisify(zip.extractAllToAsync.bind(zip))
    await extractAllToAsync(targetDir, true, undefined)

    cleanup()
}

export function builder(yargs: Argv): Argv<{ local: boolean; name: string | undefined; type: PackageType }> {
    return yargs
        .option('type', {
            describe: 'package type',
            type: 'string',
            default: PackageType.Library,
            choices: [PackageType.Library, PackageType.YargsCli],
            demand: true,
        })
        .positional('name', {
            describe: 'the new package name',
            type: 'string',
            required: true,
        })
        .option('local', {
            describe: 'create from local examples instead of Github artifact',
            type: 'boolean',
            default: fs.existsSync(path.join(rootDirectory, 'examples')),
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { type, name, local } = await argv

    const project = new Project({
        templates,
    })
    const template = project.template

    if (template === undefined) {
        throw new Error(`could not find a template with type ${type}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await createProject({ type, name: name!, local, template })
}

export default {
    command: 'create <name>',
    describe: 'create a new project',
    builder,
    handler,
}
