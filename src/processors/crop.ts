import { AppError } from "../errors";
import { getLogger } from "../logger";
import { IOperationOptions } from "./types";

export async function crop(options: IOperationOptions<"crop">) {
    const { sharp, step, width, height } = options;
    const defaultParams = {
        top: { value: 0, unit: "px" },
        left: { value: 0, unit: "px" },
        right: { value: 0, unit: "px" },
        bottom: { value: 0, unit: "px" },
    }
    let { top, left, right, bottom } = { ...defaultParams, ...step.parameters };
    
    // Convert percent to pixel
    [
        [top, height] as const,
        [left, width] as const,
        [right, width] as const,
        [bottom, height] as const
    ].forEach(([edge, total]) => {
        if (edge.unit === "%") {
            edge.value = total * edge.value;
            edge.unit = "px";
        }
    });

    const cropWidth = width - left.value - right.value;
    const cropHeight = height - top.value - bottom.value;

    if (cropWidth <= 0 || cropHeight <= 0) {
        throw new AppError("invalidDimensions")
    }

    getLogger({ step }).debug({ top: top.value, left: left.value, width: cropWidth, height: cropHeight });

    sharp.extract({ top: top.value, left: left.value, width: cropWidth, height: cropHeight });
    return { width: cropWidth, height: cropHeight }
}
