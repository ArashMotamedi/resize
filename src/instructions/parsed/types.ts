import { enumerate } from "ts-transformer-enumerate";
import { keys } from "ts-transformer-keys";
import { createEquals } from "typescript-is";

export type IInstructionSet = IInstructions[];

export interface IInstructions {
    file: string;
    operations: IOperation[]
}

export type IOperation = IResizeOperation |
    ICropOperation | ISaveOperation | ICoverOperation;

export type IOperationNames = IOperation["operation"];
export const operations = Object.keys(enumerate<IOperationNames>()) as IOperationNames[];

export type ISpecificOperation<T extends IOperationNames> =
    T extends "resize" ? IResizeOperation :
    T extends "crop" ? ICropOperation :
    T extends "save" ? ISaveOperation :
    T extends "cover" ? ICoverOperation :
    never;

export const is: { [key in IOperationNames]: (input: any) => input is ISpecificOperation<key> } = {
    cover: createEquals<ICoverOperation>(),
    crop: createEquals<ICropOperation>(),
    resize: createEquals<IResizeOperation>(),
    save: createEquals<ISaveOperation>(),
}

export interface IExplicitlyPixel {
    value: number, unit: "px",
}

export interface IExplicitlyPercent {
    value: number, unit: "%",
}

export type IPixelOrPercent = IExplicitlyPixel | IExplicitlyPercent;
export interface IAspectRatio {
    width: number, height: number
}

export interface IResizeOperation {
    operation: "resize",
    parameters: {
        width?: IPixelOrPercent;
        height?: IPixelOrPercent;
    }
}

export interface ICropOperation {
    operation: "crop",
    parameters: {
        top?: IPixelOrPercent,
        left?: IPixelOrPercent,
        right?: IPixelOrPercent,
        bottom?: IPixelOrPercent,
    }
}

export interface ISaveOperation {
    operation: "save",
    parameters: {
        as?: string,
        quality?: IExplicitlyPercent,
    }
}

export interface ICoverOperation {
    operation: "cover";
    parameters: {
        width?: IPixelOrPercent,
        height?: IPixelOrPercent,
        aspectRatio?: IAspectRatio
    }
}
