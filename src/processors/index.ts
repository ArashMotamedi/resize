import sharp, { Sharp } from "sharp";
import { IOperationName, ISegment, IStep } from "../instructions/parsed/types";
import { getLogger } from "../logger";
import { save } from "./save";
import { crop } from "./crop";
import { cover } from "./cover";
import { resize } from "./resize";
import { IOperationOptions } from "./types";
import fs from "fs";

const operators: { [key in IOperationName]: (options: IOperationOptions<key>) => Promise<Sharp> } = {
    resize, crop, cover, save
}

export async function processSegment(segment: ISegment) {
    const logger = getLogger({ segment });
    logger.debug("Processing segment");
    let { source, steps } = segment;
    const { path } = source;
    try {
        await fs.promises.stat(source.path);
    }
    catch {
        logger.error(`File not found: ${source.path}`)
        return;
    }

    let s = sharp(path);
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const { operation, parameters } = step;
        getLogger({ step }).debug(JSON.stringify({ operation, parameters }, undefined, 2));
        s = await operators[operation]({
            // @ts-ignore
            step,
            sharp: s
        });
    }
}




