import { readFileSync, readdirSync } from "fs"
import path from "path"
import type { languageFile } from "."
import yaml from 'yaml'


export type LangaugeResponse = {
    data: languageFile
}
export default function handler(req: { query: { id: string | number } }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { data?: any; message?: string }): void; new(): any } } }) {
    const files = readdirSync( path.join(process.cwd(), 'src', 'data'))
    
    const filesMap: {
        [key: string]: languageFile
    } = files.reduce((acc: {[key: string]: languageFile}, file: string) => {
        const fileReadBuffer = readFileSync(path.join(process.cwd(), 'src', 'data', file))
        const yamlData: languageFile = yaml.parse(fileReadBuffer.toString()) as languageFile
        if(yamlData.type === 'vocabulary') {
            acc[yamlData.id] = yamlData
        }
      return acc;
    }, {})

    if(filesMap[req.query.id]) {

        res.status(200).json({data: filesMap[req.query.id]});
    } else {
        res.status(404).json({message: 'not found'})
    }
}