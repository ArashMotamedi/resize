import { IOperationName, IPath } from "../parsed/types";

export interface IRawDocument {
    file: IPath,
    segments: IRawSegment[]
}

export interface IRawSegment {
    index: number;
    source: string;
    steps: IRawStep[]
}

export interface IRawStep {
    index: number;
    operation: string;
    parameters: Record<string, string>;
}

