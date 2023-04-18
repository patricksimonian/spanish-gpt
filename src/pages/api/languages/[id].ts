import { readFileSync, readdirSync } from "fs"
import path from "path"
import { languageFile } from "."
import yaml from 'yaml'


export type LangaugeResponse = {
    data: languageFile
}
export default function handler(req, res) {
    const files = readdirSync( path.join(process.cwd(), 'src', 'data'))
    
    const filesMap = files.reduce((acc, file) => {
        const fileReadBuffer = readFileSync(path.join(process.cwd(), 'src', 'data', file))
        const yamlData: languageFile = yaml.parse(fileReadBuffer.toString())
        
      acc[yamlData.id] = yamlData
      return acc;
    }, {})

    if(filesMap[req.query.id]) {

        res.status(200).json({data: filesMap[req.query.id]});
    } else {
        res.status(404).json({message: 'not found'})
    }
}