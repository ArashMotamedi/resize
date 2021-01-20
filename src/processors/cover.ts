import { getLogger } from "../logger";
import { IOperationOptions } from "./types";


export async function cover(options: IOperationOptions<"cover">) {
    const { step } = options;
    const logger = getLogger({ step });
    logger.debug("Performing cover operation (passthrough)");
}
