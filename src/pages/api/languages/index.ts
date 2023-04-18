import { readdirSync, readFileSync } from "fs";
import path from "path";
import yaml from 'yaml';

export type vocabularyInterface = {
    english: string;
    spanish: string;
}

export type languageFile = {
    id: string,
    type: string,
    name: string
    spec: Array<vocabularyInterface> | null
}

export type LanguageRes = Array<{
    id: string,
    name: string,
    file: string,
}>


export default function handler(req, res) {
    const files = readdirSync( path.join(process.cwd(), 'src', 'data'))

    const data = files.map(file => {
        const fileReadBuffer = readFileSync(path.join(process.cwd(), 'src', 'data', file))
        const yamlData: languageFile = yaml.parse(fileReadBuffer.toString())
        
        return {
            file,
            name: yamlData.name,
            id: yamlData.id
        }
    })

    res.status(200).json({data});
}