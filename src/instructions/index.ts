import { getParsedDocument } from "./parsed";
import { IPath } from "./parsed/types";
import { getRawDocument } from "./raw";

export async function getDocument(file: IPath) {
    const raw = await getRawDocument(file);
    const parsed = getParsedDocument(raw);
    return parsed;
}