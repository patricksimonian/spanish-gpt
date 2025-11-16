import { readFileSync, readdirSync } from "fs"
import path from "path"
import type { languageFile } from "."
import yaml from 'yaml'
import { logger } from "~/utils/logger"

let files = []
let filesMap: {
    [key: string]: languageFile
} = {}
try {
    files = readdirSync(path.join(process.cwd(), 'src', 'data'))
    filesMap = files.reduce((acc: { [key: string]: languageFile }, file: string) => {
        const fileReadBuffer = readFileSync(path.join(process.cwd(), 'src', 'data', file))
        const yamlData: languageFile = yaml.parse(fileReadBuffer.toString()) as languageFile
        if (yamlData.type === 'vocabulary') {
            acc[yamlData.id] = yamlData
        }
        return acc;
    }, {})
} catch (e) {
    logger.error('Could not setup files map')
    logger.error(e)
}
export type LangaugeResponse = {
    data: languageFile
}
export default function handler(req: { query: { id: string | number } }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { data?: any; message?: string }): void; new(): any } } }) {

    logger.debug(`Getting language file ${req.query.id}`)


    if (filesMap[req.query.id]) {

        res.status(200).json({ data: filesMap[req.query.id] });
    } else {
        res.status(404).json({ message: 'not found' })
    }
}
