import { watch } from "chokidar";
import { getLogger } from "./logger";
import { getQueue } from "./queue";
import { getDocument } from "./instructions";
import { processSegment } from "./processors";
import { getPath, isValidDocumentFile } from "./util";
import { IPath } from "./instructions/parsed/types";

export async function once() {
    const files: IPath[] = [];
    const watcher = watch("**/*.resize");
    const logger = getLogger();
    const queue = getQueue();
    await new Promise<void>(r => {
        watcher.on("ready", async () => {
            watcher.removeAllListeners();
            watcher.unwatch("**/*.resize");
            for (const file of files) {
                const document = await getDocument(file);
                queue.addAll(document.segments.map(segment => () => processSegment(segment)));
            }
            queue.add(() => r());
        });

        watcher.on("add", (file, stat) => {
            if (!isValidDocumentFile(file, stat)) {
                logger.debug(`not a .resize file: ${file}`);
                return;
            }
            files.push(getPath(file));
        });
    });
}