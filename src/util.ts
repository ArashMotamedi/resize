import { Stats } from "fs";
import path from "path";
import { IPath } from "./instructions/parsed/types";

export function isValidDocumentFile(file: string, stat?: Stats) {
    return stat?.isFile() && file.endsWith(".resize");
}

export function getPath(...segments: string[]) {
    const fullPath = path.resolve(...segments);
    const result: IPath = {
        dir: path.dirname(fullPath),
        name: segments[segments.length - 1],
        path: fullPath
    }

    return result;
}