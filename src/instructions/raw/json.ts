import { createEquals } from "typescript-is";
import { AppError } from "../../errors";
import { IRawInstructions, IRawInstructionSet, IRawOperation } from "./types";

const isArrayOfObjects = createEquals<{}[]>();
const isJsonInstructions = createEquals<IJsonInstructionSet>();

export function getRawInstructionSetFromJsonFile(data: object) {

    if (!isArrayOfObjects(data))
        throw new AppError("invalidFormat");

    if (!isJsonInstructions(data)) {
        throw new AppError("invalidFormat");
    }

    try {

        const rawInstructionSet: IRawInstructionSet = data.map(jsonInstruction => {
            const rawInstructions: IRawInstructions = {
                file: jsonInstruction.file,
                operations: jsonInstruction.operations.map(jsonOperation => {
                    const { operation, ...parameters } = jsonOperation;
                    const rawOperation: IRawOperation = {
                        operation, parameters: stringifyParameters(parameters)
                    };
                    return rawOperation;
                })
            }
            return rawInstructions;
        })

        return rawInstructionSet;
    }
    catch (e) {
        throw new AppError("invalidFormat");
    }
}

type IJsonInstructionSet = IJsonInstructions[];

interface IJsonInstructions {
    file: string;
    operations: Array<{
        operation: string;
        [key: string]: string | number | boolean;
    }>
}

function stringifyParameters(parameters: { [key: string]: string | number | boolean }) {
    const result = {} as any;
    Object.entries(parameters).forEach(([key, value]) => {
        result[key] = value.toString();
    });

    return result;
}