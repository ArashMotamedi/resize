import "./shim";
import { getLogger } from "./logger";
import { getConfig } from "./config";
import { once } from "./once";
import { watch } from "./watch";
import sharp from "sharp";
import { AppError } from "./errors";
import { getNpm } from "./npm";

// a .resize file contains a document
// a document contains an array of segments
// an segment is a bundle of a source file and an array of steps
// a step is a bundle of an operation name and an object of parameters

export async function main() {
    const config = getConfig();
    const logger = getLogger();
    try {
        await validateConfig();
        logger.debug(config);

        // global sharp settings
        sharp.cache(false);

        if (config.watch) {
            logger.debug("Running in watch mode");
            const watcher = watch();
            if (config.and) {
                const npm = (await getNpm())!;
                watcher.addEventListener("idle", () => npm.run(config.and));
            }
        }
        else {
            logger.debug("Running once");
            await once();
            if (config.then) {
                const npm = (await getNpm())!;
                await npm.run(config.then);
            }
        }
    }
    catch (e) {
        logger.error(e);
    }
}

main();

async function validateConfig() {
    const config = getConfig();
    const logger = getLogger();
    if (!config.then && !config.and) return;
    const npm = await getNpm();
    if (!npm) throw new AppError("notInNpm");

    if (config.then && config.watch) {
        throw new AppError("invalidArguments", { description: "--watch and --then switches cannot be combined." });
    }

    if (config.then && config.watch) {
        throw new AppError("invalidArguments", { description: "--then and --and switched cannot be combined." });
    }

    const chainedScript = config.then ? config.then : config.and;
    if (!npm.otherScripts.find(s => s.toLowerCase() === chainedScript.toLowerCase()))
        throw new AppError("npmScriptNotFound", { description: `package.json does not contain script named ${chainedScript}.` });

    if (config.and && !config.watch) {
        // watch is implied when --and is used
        logger.debug("Switching to watch mode due to --and switch.");
        config.watch = true;
    }
}