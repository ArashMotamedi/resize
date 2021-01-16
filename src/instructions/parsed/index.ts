import { IRawInstructionSet } from "../raw/types";
import { IInstructions, IInstructionSet, IOperation, IOperationNames, IPixelOrPercent, ISpecificOperation, operations } from "./types";

export function getParsedInstructionSet(rawInstructionSet: IRawInstructionSet) {
    const instructionSet: IInstructionSet = rawInstructionSet.map(
        rawInstructions => {
            const instructions: IInstructions = {
                file: rawInstructions.file,
                operations: rawInstructions.operations.map(rawOperation => {
                    const operation: IOperation = {} as any;
                    operation.operation = rawOperation.operation as any;
                    operation.parameters = parseParameters(operation.operation, rawOperation.parameters);
                    return operation;
                })
            }
            return instructions;
        }
    );
    return instructionSet;
}

function parseParameters<T extends IOperationNames>(operation: T, parameters: Record<string, string>) {
    const translator = translators[operation];
    const result: ISpecificOperation<T>["parameters"] = {};
    Object.entries(parameters).forEach(([key, value]) => {
        // @ts-ignore
        const parser = translator[key];
        if (!parser) {
            console.error(`Unknown parameter ${key}`);
            return;
        }

        // @ts-ignore
        result[key] = parser(value) as any;
    });

    return result;
}

type ITranslators = {
    [key in IOperationNames]: {
        [key2 in keyof ISpecificOperation<key>["parameters"]]: (input: string) => ISpecificOperation<key>["parameters"][key2]
    }
}

const pixelOrPercent = attempt<IPixelOrPercent>(noUnitToPixel, explicitlyPixels, explicitlyPercent);

const translators: ITranslators = {
    cover: {
        aspectRatio: attempt(fractionToAspectRatio, decimalToAspectRatio),
        height: pixelOrPercent,
        width: pixelOrPercent
    },
    crop: {
        top: pixelOrPercent,
        left: pixelOrPercent,
        right: pixelOrPercent,
        bottom: pixelOrPercent,
    },
    resize: {
        height: pixelOrPercent,
        width: pixelOrPercent
    },
    save: {
        as: input => input,
        quality: explicitlyPercent
    }
}


function attempt<T>(...parsers: ((input: string) => T)[]) {
    function parse(input: string) {
        for (const parser of parsers) {
            try {
                const result = parser(input);
                return result;
            }
            catch { }
        }
    }

    return parse;
}

function noUnitToPixel(input: string) {
    const pattern = /^\s*((\+|\-)?\s*\d*(\.\d+)?)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw Error("Not a match");

    const value = parseFloat(matches[0]);
    const unit = "px" as const;
    return { value, unit };
}

function explicitlyPixels(input: string) {
    const pattern = /^\s*((\+|\-)?\s*\d*(\.\d+)?)\s*(px)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw Error("Not a match");

    const value = parseFloat(matches[1]);
    const unit = "px" as const;
    return { value, unit };
}

function explicitlyPercent(input: string) {
    const pattern = /^\s*((\+|\-)?\s*\d*(\.\d+)?)\s*(%)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw Error("Not a match");

    const value = parseFloat(matches[1]);
    const unit = "%" as const;
    return { value, unit }
}

function fractionToAspectRatio(input: string) {
    // integer / integer
    const pattern = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw Error("Not a match");

    const width = parseInt(matches[1]);
    const height = parseInt(matches[2]);
    return { width, height }
}

function decimalToAspectRatio(input: string) {
    // no signature, integer or decimal
    const pattern = /^\s*(\d*(\.\d+)?)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw Error("Not a match");

    const width = parseFloat(matches[0]);
    const height = 1;
    return { width, height };
}