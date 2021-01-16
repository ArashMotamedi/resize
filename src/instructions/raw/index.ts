import { getRawInstructionSetFromFlatFile } from "./flat";
import { getRawInstructionSetFromJsonFile } from "./json";

export function getRawInstructionSet(input: string) {
    let data: any = undefined;
    try {
        data = JSON.parse(input);
    } catch { }

    if (data) return getRawInstructionSetFromJsonFile(data);
    return getRawInstructionSetFromFlatFile(input);
}

