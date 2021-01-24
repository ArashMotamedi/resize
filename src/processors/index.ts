import sharp from "sharp";
import { IOperationName, ISegment } from "../instructions/parsed/types";
import { getLogger } from "../logger";
import { save } from "./save";
import { crop } from "./crop";
import { cover } from "./cover";
import { resize } from "./resize";
import { IOperationProcessor } from "./types";
import fs from "fs";

type IDefined<T> = T extends infer U | undefined ? U : T;

const operators: { [key in IOperationName]: IOperationProcessor<key> } = {
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

    let _sharp = sharp(path);
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const logger = getLogger({ step });
        const metadata = await _sharp.metadata();
        const width = metadata.width ?? 0;
        const height = metadata.height ?? 0;
        try {
            const { operation, parameters } = step;
            getLogger({ step }).debug({ operation, parameters, width, height });
            const result = await operators[operation]({
                // @ts-ignore
                step,
                sharp: _sharp,
                width,
                height,
            });
            _sharp = sharp(await _sharp.toBuffer());
        }
        catch (e) {
            logger.error(e);
            break;
        }
    }
}




