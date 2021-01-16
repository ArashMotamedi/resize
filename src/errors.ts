
interface IErrorDetails {
    message: string;
    moreInfo?: string;
}
interface IAdditionalDetails {
    file?: string,
    line?: number,
    char?: number;
    innerError?: any;
    [key: string]: string | number | boolean | undefined;
}

export const errors = ["notJson", "invalidFormat"] as const;
export type IErrorTypes = typeof errors[number];

export const errorDetails: Record<IErrorTypes, IErrorDetails> = {
    notJson: { message: "Not JSON" },
    invalidFormat: { message: "Invalid file format." },
}


export class AppError extends Error {
    name: IErrorTypes;
    moreInfo?: string;
    file?: string;
    line?: number;
    char?: number;
    innerError?: any;

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

// export function wrapError(e: any, type: IErrorTypes, details?: IAdditionalDetails) {
//     if (e instanceof AppError)
//         return e;

//     return new AppError(type, details);
// }