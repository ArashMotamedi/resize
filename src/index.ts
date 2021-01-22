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
    polyfillReplaceAll();
    sharp.cache(false);
    const config = getConfig();
    const logger = getLogger();
    logger.debug(config);

    console.log(process.execPath);
    console.log(process.env);

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

function polyfillReplaceAll() {
    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function (str: string | RegExp, newStr: any) {

            // If a regex pattern
            if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
                return this.replace(str, newStr);
            }

            // If a string
            return this.replace(new RegExp(str, 'g'), newStr);

        };
    }
}


declare namespace global {
    let mode: string | undefined;
}