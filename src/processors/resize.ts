import { getLogger } from "../logger";
import { IOperationOptions } from "./types";

export async function resize(options: IOperationOptions<"resize">) {
    const { sharp, step, width: currentWidth, height: currentHeight } = options;
    const aspectRatio = currentWidth / currentHeight;
    const logger = getLogger({ step: step });
    const { parameters } = step;
    let { width, height } = parameters;
    if (!width && !height) {
        logger.warn("Neither width nor height were specified. Skipping resize operation.");
        return;
    }

    if (width?.unit === "%" || height?.unit === "%") {
        if (width?.unit === "%") {
            width = { value: width.value * .01 * currentWidth, unit: "px" };
        }
        if (height?.unit === "%") {
            height = { value: height.value * .01 * currentHeight, unit: "px" };
        }
    }

    const newWidth = Math.floor(width?.value ?? height!.value * aspectRatio);
    const newHeight = Math.floor(height?.value ?? width!.value / aspectRatio);

    sharp.resize({ width: newWidth, height: newHeight });
    return { sharp, width: newWidth, height: newHeight };
}
