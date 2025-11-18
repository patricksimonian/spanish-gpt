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
import { type NextApiRequest, type NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {

    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    logger.debug(`Getting language file ${id ?? 'undefined'}`)

    if (id && filesMap[id]) {
        res.status(200).json({ data: filesMap[id] });
    } else {
        res.status(404).json({ message: 'not found' })
    }
}
