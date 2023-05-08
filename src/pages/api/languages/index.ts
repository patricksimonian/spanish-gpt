import { readdirSync, readFileSync } from "fs";
import path from "path";
import yaml from 'yaml';

export type vocabularyInterface = {
    data: Array<{
        english: string;
        spanish: string;
    }>
}

export type languageFile = {
    id: string,
    type: string,
    name: string
    spec: vocabularyInterface
}

export type LanguageRes = Array<{
    id: string,
    name: string,
    file: string,
}>


export default function handler(_req: unknown, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { data: { file: string; name: string; id: string; }[]; }): void; new(): any; }; }; }): void {
    const files = readdirSync( path.join(process.cwd(), 'src', 'data'))

    const data = files.map(file => {
        const fileReadBuffer = readFileSync(path.join(process.cwd(), 'src', 'data', file))
        const yamlData: languageFile = yaml.parse(fileReadBuffer.toString()) as languageFile
        
        return {
            file,
            name: yamlData.name,
            id: yamlData.id,
            numCards: yamlData.spec.data.length,
            type: yamlData.type
        }
    })

    res.status(200).json({data});
}