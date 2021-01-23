import "./shim";
import { getLogger } from "./logger";
import { getConfig } from "./config";
import { once } from "./once";
import { watch } from "./watch";
import sharp from "sharp";

// a .resize file contains a document
// a document contains an array of segments
// an segment is a bundle of a source file and an array of steps
// a step is a bundle of an operation name and an object of parameters

export async function main() {
    sharp.cache(false);
    const config = getConfig();
    const logger = getLogger();
    logger.debug(config);

    if (config.watch) {
        logger.debug("Running in watch mode");
        await watch();
    }
    else {
        logger.debug("Running once");
        await once();
    }
}

main();