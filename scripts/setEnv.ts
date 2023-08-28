import { Addressable } from 'ethers/lib.commonjs/address'
import fs from 'fs'
import os from 'os'
import path from 'path'

export function setEnvValue(shared: Boolean, key: string, value: string | Addressable): void {

    if (shared) {
        let environment_path = path.resolve('.env.public')
    }

    let environment_path = path.resolve('.env')
    const ENV_VARS = fs.readFileSync(environment_path, 'utf8').split(os.EOL)

    const line = ENV_VARS.find((line: string) => {
        return line.match(`(?<!#\\s*)${key}(?==)`)
    })

    if (line) {
        const target = ENV_VARS.indexOf(line as string)
        if (target !== -1) {
            ENV_VARS.splice(target, 1, `${key}=${value}`)
        } else {
            ENV_VARS.push(`${key}=${value}`)
        }
    }

    fs.writeFileSync(environment_path, ENV_VARS.join(os.EOL))
}