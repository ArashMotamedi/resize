import "core-js/es";
import { getLogger } from "./logger";
import { getConfig } from "./config";
import { once } from "./once";
import { watch } from "./watch";
import sharp from "sharp";

// a .resize file contains an document
// a document contains an array of segments
// an segment is a bundle of a source file and an array of steps
// a step is a bundle of an operation name and an object of parameters

async function main() {

    const config = getConfig();
    const logger = getLogger();
    sharp.cache(false);

    if (config.watch) {
        logger.debug("Running in watch mode");
        await watch();
    }
    else {
        logger.debug("Running once");
        await once();
    }
}

main()
    .then(() => 0)
    .catch(e => {
        console.error(e);
        return 1;
    })
    .then(code => {
        process.exit(code);
    })