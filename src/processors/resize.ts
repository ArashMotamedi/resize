import { getLogger } from "../logger";
import { IOperationOptions } from "./types";


export async function resize(options: IOperationOptions<"resize">) {
    const { sharp, step } = options;
    const logger = getLogger({ step: step });
    const { parameters } = step;
    let { width, height } = parameters;
    if (!width && !height) {
        logger.warn("Neither width nor height were specified. Skipping resize operation.");
        return sharp;
    }

    if (width?.unit === "%" || height?.unit === "%") {
        const metadata = await sharp.metadata();
        if (width?.unit === "%") {
            width = { value: width.value * .01 * (metadata.width ?? 1), unit: "px" };
        }
        if (height?.unit === "%") {
            height = { value: height.value * .01 * (metadata.height ?? 1), unit: "px" };
        }
    }

    sharp.resize(width?.value, height?.value);

    return sharp;
}
