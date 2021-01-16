import { getParsedInstructionSet } from "./parsed";
import { getRawInstructionSet } from "./raw";
import { getValidatedInstructionSet } from "./validated";

export function getInstructionSet(input: string) {
    // raw -> parse -> validate
    const raw = getRawInstructionSet(input);
    const parsed = getParsedInstructionSet(raw);
    const validated = getValidatedInstructionSet(parsed);
    return validated;
}