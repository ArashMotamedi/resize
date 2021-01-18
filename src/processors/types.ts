import { Sharp } from "sharp";
import { IDocument, IOperationName, ISegment, IStep } from "../instructions/parsed/types";

export type IOperationOptions<T extends (IOperationName | void) = void> = {
    step: IStep<T>;
    sharp: Sharp;
}