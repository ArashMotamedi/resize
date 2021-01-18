import { createEquals } from "typescript-is";
import { AppError } from "../../errors";
import { IRawSegment, IRawStep } from "./types";

const isArrayOfObjects = createEquals<{}[]>();
const isJsonInstructions = createEquals<IJsonDocument>();

export function getRawSegmentsFromJson(data: object): IRawSegment[] {

    if (!isArrayOfObjects(data))
        throw new AppError("invalidFormat");

    if (!isJsonInstructions(data)) {
        throw new AppError("invalidFormat");
    }

    try {
        const rawSegments = data.map((jsonInstruction, index) => {
            const rawSegment: IRawSegment = {
                index,
                source: jsonInstruction.source,
                steps: jsonInstruction.steps.map((step, index) => {
                    const { operation, ...parameters } = step;
                    const rawStep: IRawStep = {
                        index,
                        operation, parameters: stringifyParameters(parameters)
                    };
                    return rawStep;
                })
            }
            return rawSegment;
        })


        return rawSegments;
    }
    catch (e) {
        throw new AppError("invalidFormat");
    }
}

type IJsonDocument = IJsonInstructions[];

interface IJsonInstructions {
    source: string;
    steps: Array<{
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