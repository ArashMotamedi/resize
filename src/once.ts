import { watch } from "chokidar";
import { getLogger } from "./logger";
import Queue from "p-queue";
import { getDocument } from "./instructions";
import { processSegment } from "./processors";
import { getPath, isValidDocumentFile } from "./util";
import { IPath } from "./instructions/parsed/types";

export async function once() {
    const files: IPath[] = [];
    const watcher = watch("**/*.resize", { ignored: "node_modules" });
    const logger = getLogger();
    const queue = new Queue({ concurrency: 1 });;
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

        watcher.on("add", function addResizeDocument(file, stat) {
            if (!isValidDocumentFile(file, stat)) {
                logger.debug(`not a .resize file: ${file}`);
                return;
            }
            const path = getPath(file);
            files.push(path);
        });
    });
}