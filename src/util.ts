import { Stats } from "fs";
import path from "path";
import { IPath } from "./instructions/parsed/types";

export function isValidDocumentFile(file: string, stat?: Stats) {
    const isValid = stat?.isFile() && file?.endsWith(".resize");
    return isValid;
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

export function pick<T, U extends (keyof T)>(object: T, ...keys: U[]): Pick<T, U> {
    const result = {} as Pick<T, U>;
    keys.forEach(key => {
        result[key] = object[key]
    });

    return result;
}

