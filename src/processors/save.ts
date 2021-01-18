import path from "path";
import { IOperationOptions } from "./types";
import mkdirp from "mkdirp";
import { getLogger } from "../logger";

export async function save(options: IOperationOptions<"save">) {
    const { sharp, step } = options;
    const logger = getLogger({ step });
    const { parameters } = step;
    const { as } = parameters;
    if (!as) {
        logger.warn("No file name was specified. Skipping save operation.");
        return sharp;
    }

    const file = path.resolve(step.segment.document.file.dir, as);
    const dir = path.dirname(file);
    await mkdirp(dir);

    await sharp.toFile(file);
    return sharp;
}
