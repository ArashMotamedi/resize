import { getRawSegmentsFromFlat } from "./flat";
import { getRawSegmentsFromJson } from "./json";
import fs from "fs";
import { IRawDocument } from "./types";
import { IPath } from "../parsed/types";

export async function getRawDocument(file: IPath): Promise<IRawDocument> {
    const content = (await fs.promises.readFile(file.path)).toString();
    let data: any = undefined;
    try {
        data = JSON.parse(content);
    } catch { }

    if (data) {
        const segments = getRawSegmentsFromJson(data);
        return {
            file,
            segments
        }
    }
    const segments = getRawSegmentsFromFlat(content);
    return {
        file, segments
    }
}

