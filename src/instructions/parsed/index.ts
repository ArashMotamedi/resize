import { AppError } from "../../errors";
import { getPath } from "../../util";
import { IRawDocument } from "../raw/types";
import { IDocument, IOperationName, IPixelOrPercent, ISegment, IOperation, IStep } from "./types";

export function getParsedDocument(rawDocument: IRawDocument): IDocument {
    const document: IDocument = {
        file: rawDocument.file,
        segments: []
    }

    document.segments = rawDocument.segments.map(rawSegment => {
        const segment: ISegment = {
            document,
            index: rawSegment.index,
            source: getPath(rawDocument.file.dir, rawSegment.source),
            steps: []
        };

        segment.steps = rawSegment.steps.map((rawStep) => {
            const step: IStep = {
                segment,
                index: rawStep.index,

                // @ts-ignore
                operation: rawStep.operation,

                // @ts-ignore
                parameters: parseParameters(rawStep.operation, rawStep.parameters),
            };
            return step;
        });

        return segment;
    })

    return document;
}

function parseParameters<T extends IOperationName>(operation: T, parameters: Record<string, string>) {
    const translator = translators[operation];
    const result: IOperation<T>["parameters"] = {};
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
    [key in IOperationName]: {
        [key2 in keyof IOperation<key>["parameters"]]: (input: string) => IOperation<key>["parameters"][key2]
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
        throw new AppError("noMatch");

    const value = parseFloat(matches[0]);
    const unit = "px" as const;
    return { value, unit };
}

function explicitlyPixels(input: string) {
    const pattern = /^\s*((\+|\-)?\s*\d*(\.\d+)?)\s*(px)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw new AppError("noMatch");

    const value = parseFloat(matches[1]);
    const unit = "px" as const;
    return { value, unit };
}

function explicitlyPercent(input: string) {
    const pattern = /^\s*((\+|\-)?\s*\d*(\.\d+)?)\s*(%)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw new AppError("noMatch");

    const value = parseFloat(matches[1]);
    const unit = "%" as const;
    return { value, unit }
}

function fractionToAspectRatio(input: string) {
    // integer / integer
    const pattern = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw new AppError("noMatch");

    const width = parseInt(matches[1]);
    const height = parseInt(matches[2]);
    return { width, height }
}

function decimalToAspectRatio(input: string) {
    // no signature, integer or decimal
    const pattern = /^\s*(\d*(\.\d+)?)\s*$/;
    const matches = input.match(pattern);
    if (!matches)
        throw new AppError("noMatch");

    const width = parseFloat(matches[0]);
    const height = 1;
    return { width, height };
}