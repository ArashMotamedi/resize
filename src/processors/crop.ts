import { getLogger } from "../logger";
import { IOperationOptions } from "./types";


export async function crop(options: IOperationOptions<"crop">) {
    const { sharp, step } = options;
    const logger = getLogger({ step });
    logger.debug("Performing crop operation (passthrough)");
    
    return sharp;
}
