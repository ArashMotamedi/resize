import { getConfig } from "./config";
import { AppError } from "./errors";
import colors from "colors";
import { IDocument, IPath, ISegment, IStep } from "./instructions/parsed/types";
import * as _path from "path";

const indent = "   ";
const outputs = ["log", "debug", "warn", "error"] as const;
type IOutput = typeof outputs[number];

export type ILogger = {
    [key in IOutput]: (message: string | object) => void;
}

const outputColors = {
    log: colors.reset,
    debug: colors.reset.dim,
    warn: colors.yellow,
    error: colors.red
} as const;

let lastOutput: IOutput = "log";
let lastPreamble: string | undefined = "";
let lastPrint: number = 0;

function relative(path: IPath) {
    return _path.relative(process.cwd(), path.path);
}

export function getLogger(): ILogger;
export function getLogger(options: { document: IDocument }): ILogger;
export function getLogger(options: { segment: ISegment }): ILogger;
export function getLogger(options: { step?: IStep }): ILogger;
export function getLogger(options?: { document?: IDocument, segment?: ISegment, step?: IStep }): ILogger {
    const config = getConfig();
    let preamble: string | undefined = undefined;

    {
        const { step, segment, document } = options ?? {};
        if (step) {
            preamble = `${relative(step.segment.document.file)} > ${step.segment.source.name} (${step.segment.index + 1}) > ${step.operation} (${step.index + 1})`
        }
        else if (segment) {
            preamble = `${relative(segment.document.file)} > ${segment.source.name} (${segment.index + 1})`;
        }
        else if (document) {
            preamble = `${relative(document.file)}`;
        }
    }


    function write(output: "log" | "debug" | "warn" | "error", message: string | object) {
        if (config.silent) return;

        if (typeof message !== "string") {
            const oneLine = JSON.stringify(message);
            if (oneLine.length < process.stdout.columns - indent.length) {
                message = oneLine;
            }
            else {
                message = JSON.stringify(message, undefined, indent.length);
            }
        }

        if (preamble) {
            if (lastOutput !== output || lastPreamble !== preamble) {
                message = `\n${preamble}\n${message.split("\n").map(line => `   ${line}`).join("\n")}`;
            } else {
                message = `${message.split("\n").map(line => `   ${line}`).join("\n")}`;
            }
        }

        message = outputColors[output](message);

        if (config.debug) {
            const now = Date.now();
            if (now - lastPrint > 1000) {
                message = `\n${colors.blue(new Date().toLocaleString())}\n${message}`;
            }
            lastPrint = now;
        }

        lastOutput = output;
        lastPreamble = preamble;
        console[output](message);
    }

    function error(e: any) {
        let message: string | undefined = undefined;
        if (typeof e === "string") {
            message = e;
        }
        else if (e instanceof AppError) {
            message = e.message;
        } else if (e instanceof Error) {
            message = e.message;
        }
        else if (typeof e.message === "string") {
            message = e.message;
        } else if (typeof e.toString === "function") {
            const stringResult = e.toString();
            if (typeof stringResult === "string")
                message = stringResult;
        }
        else if (typeof e === "object") {
            message = JSON.stringify(e);
        }

        if (!message) {
            message = "Unknown error";
        }

        write("error", message);
    }

    function warn(message: string | object) {
        write("warn", message);
    }

    function log(message: string | object) {
        write("log", message);
    }

    function debug(message: string | object) {
        if (!config.debug) return;
        write("debug", message);
    }

    return {
        log, debug, warn, error
    }

}