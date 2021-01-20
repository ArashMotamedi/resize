import { Sharp } from "sharp";
import { IDocument, IOperationName, ISegment, IStep } from "../instructions/parsed/types";

export type IOperationOptions<T extends (IOperationName | void) = void> = {
    step: IStep<T>;
    sharp: Sharp;
    width: number;
    height: number;
}

export type IOperationResult = void | { width: number, height: number }

export interface IOperationProcessor<T extends (IOperationName | void) = void> {
    (options: IOperationOptions<T>): IOperationResult | Promise<IOperationResult>
}