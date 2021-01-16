import { IOperationNames } from "../parsed/types";

export type IRawInstructionSet = IRawInstructions[];

export interface IRawInstructions {
    file: string;
    operations: IRawOperation[]
}

export interface IRawOperation {
    operation: string;
    parameters: Record<string, string>;
}

