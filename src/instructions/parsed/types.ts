import { enumerate } from "ts-transformer-enumerate";
import { createEquals } from "typescript-is";

export interface IPath {
    name: string; // image.jpg (just the file name or relative path)
    path: string; // /dir1/dir2/image.jpg (full file path, including name)
    dir: string; // /dir1/dir2 (full path of directly holding file)
}

export interface IDocument {
    file: IPath;
    segments: ISegment[];
}

export interface ISegment {
    index: number;
    document: IDocument;
    source: IPath;
    steps: IStep[];
}

export type IStep<T extends (IOperationName | void) = void> = IOperation<T> & {
    index: number;
    segment: ISegment;
}

type IAllOperations = IResizeOperation | ICropOperation | ISaveOperation | ICoverOperation;

export type IOperationName = IAllOperations["operation"];
export const operationNames = Object.keys(enumerate<IOperationName>()) as IOperationName[];

export type IOperation<T extends (IOperationName | void) = void> =
    T extends "resize" ? IResizeOperation :
    T extends "crop" ? ICropOperation :
    T extends "save" ? ISaveOperation :
    T extends "cover" ? ICoverOperation :
    IAllOperations;

export const is: { [key in IOperationName]: (input: any) => input is IOperation<key> } = {
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

export interface IFlipOperation {
    operation: "flip",
    parameters: {
        horizontally?: boolean;
        vertically?: boolean;
    }
}

export interface IRotateOperation {
    operation: "rotate",
    parameters: {
        degrees: "90cw" | "180cw" | "270cw" |
        "90ccw" | "180ccw" | "270ccw";
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
