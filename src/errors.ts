
interface IErrorDetails {
    message: string;
    moreInfo?: string;
}
interface IAdditionalDetails {
    file?: string,
    line?: number,
    char?: number;
    innerError?: any;
    description?: string;
    [key: string]: string | number | boolean | undefined;
}

export const errors = [
    "notJson",
    "invalidFormat",
    "noMatch",
    "notSupported",
    "saveNoFileName",
    "saveInvalidExtension",
    "invalidDimensions",
    "invalidArguments",
    "notInNpm",
    "npmScriptNotFound",
] as const;

export type IErrorTypes = typeof errors[number];

export const errorDetails: Record<IErrorTypes, IErrorDetails> = {
    notJson: { message: "Not JSON." },
    invalidFormat: { message: "Invalid file format." },
    noMatch: { message: "Not a match." },
    notSupported: { message: "Not supported." },
    saveNoFileName: { message: "A file name was not provided." },
    saveInvalidExtension: { message: "Invalid file extension." },
    invalidDimensions: { message: "Invalid dimensions." },
    invalidArguments: { message: "Invalid arguments." },
    notInNpm: { message: "Not in NPM." },
    npmScriptNotFound: { message: "NPM script not found." }
}

export class AppError extends Error {
    name: IErrorTypes;
    moreInfo?: string;
    file?: string;
    line?: number;
    char?: number;
    innerError?: any;
    description?: string;

    constructor(key: IErrorTypes, details?: IAdditionalDetails) {
        const { message, moreInfo } = errorDetails[key];
        super(message);
        this.name = key;
        this.message = message;
        this.moreInfo = moreInfo;
        if (details) {
            Object.entries(details).forEach(([key, value]) => {
                // @ts-ignore
                this[key] = value;
            })
        }
    }
}

export function isAppError(e: any, type: IErrorTypes) {
    return (e instanceof AppError && e.name === type);
}
