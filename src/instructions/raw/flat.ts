import { IRawSegment, IRawStep } from "./types";

export function getRawSegmentsFromFlat(content: string): IRawSegment[] {
    const interimDocument = getInterimDocument(content);

    const segments = interimDocument.map((interimInstructions, index) => {
        const rawSegment: IRawSegment = {
            index,
            source: interimInstructions.source,
            steps: interimInstructions.steps.map((interimStep, index) => {
                const rawOperation: IRawStep = {
                    index,
                    operation: interimStep.operation,
                    parameters: parseParameters(interimStep.parameters),
                }
                return rawOperation;
            }),
        }
        return rawSegment;
    })


    return segments;
}

function getInterimDocument(input: string) {
    const instructionSet: IInterimInstructionSet[] = [];

    input = input.replaceAll("\r", "").replaceAll("\t", " ");
    const lines = input.split("\n").filter(line => line.trim());
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indent = getIndent(line);
        if (indent === 0) {
            instructionSet.push({ source: line.trim(), steps: [] });
        } else {
            if (last(instructionSet).steps.length === 0) {
                const [operation, ...rest] = line.trim().split(" ").filter(part => part.trim());
                last(instructionSet).steps.push({ indent: indent, operation, parameters: rest.join(" ") })
            } else {
                if (indent <= last(last(instructionSet).steps).indent) {
                    const [operation, ...rest] = line.trim().split(" ").filter(part => part.trim());
                    last(instructionSet).steps.push({ indent: indent, operation, parameters: rest.join(" ") })
                }
                else {
                    last(last(instructionSet).steps).parameters += ", " + line.trim();
                }
            }
        }
    }

    return instructionSet;

}

function parseParameters(input: string) {
    [" ", ","].forEach(token => {
        input = replaceExhaustive(input, `${token}${token}`, token);
    });
    [",", ":"].forEach(token => {
        [` ${token}`, `${token} `].forEach(tokenWithSpace => {
            input = replaceExhaustive(input, tokenWithSpace, token)
        });
    });
    [" ", ","].forEach(token => {
        input = replaceExhaustive(input, `${token}${token}`, token);
    });
    const pairs = input.split(",").filter(pair => pair.trim());
    const parameters: Record<string, string> = {};
    pairs.forEach(pair => {
        // to do: allow flags? (singleton instead of pair)
        // to do: if flags allowed, should they be populated as key: true ?
        // to do: if flags not allowed, should error on colon free pairs? 
        const [name, ...values] = pair.split(":");
        const value = values.join(":");
        parameters[name] = value;
    });

    return parameters;
}

interface IInterimInstructionSet {
    source: string;
    steps: IInterimStep[];
}

interface IInterimStep {
    operation: string;
    indent: number;
    parameters: string;
}

function getIndent(line: string) {
    return line.match(/^\s*/)![0].length;
}

function last<T>(input: T[]) {
    return input[input.length - 1];
}

function replaceExhaustive(input: string, pattern: string | RegExp, replacement: string) {
    let lastLength = input.length;
    while (true) {
        input = input.replaceAll(pattern, replacement);
        let newLength = input.length;
        if (newLength === lastLength)
            return input;
        lastLength = newLength;
    }
}