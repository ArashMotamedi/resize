import path from "path";
import { IOperationOptions } from "./types";
import mkdirp from "mkdirp";
import fs from "fs";
import sharp from "sharp";
import { AppError } from "../errors";

const acceptableExtensions: Record<string, keyof sharp.FormatEnum> = {
    "jpg": "jpeg",
    "jpeg": "jpeg",
    "webp": "webp",
    "png": "png",
}

export async function save(options: IOperationOptions<"save">) {
    const { sharp, step } = options;
    const { parameters } = step;
    const { as } = parameters;
    if (!as) {
        throw new AppError("saveNoFileName");
    }

    const originalFormat = (await sharp.metadata()).format;
    let targetFormat: typeof originalFormat = "input";
    const extension = as.substr(as.lastIndexOf(".") + 1).toLowerCase();
    if (acceptableExtensions.hasOwnProperty(extension)) {
        targetFormat = acceptableExtensions[extension];
    }
    else {
        throw new AppError("saveInvalidExtension")
    }


    if (targetFormat !== "input" || targetFormat !== originalFormat) {
        sharp.toFormat(targetFormat);
    }

    const file = path.resolve(step.segment.document.file.dir, as);
    const dir = path.dirname(file);
    await mkdirp(dir);
    const buffer = await sharp.toBuffer();
    await fs.promises.writeFile(file, buffer);
}
