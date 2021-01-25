import { watch as watchFiles } from "chokidar";
import { MD5 } from "object-hash";
import { getLogger } from "./logger";
import Queue from "p-queue";
import path from "path";
import { getDocument } from "./instructions";
import { processSegment } from "./processors";
import { IPath, ISegment } from "./instructions/parsed/types";
import { getPath, isValidDocumentFile } from "./util";

export function watch() {
    const logger = getLogger();
    const watcher = watchFiles("**/*.resize", { ignored: "node_modules" });
    const operator = getOperator();

    watcher.on("add", async (file, stat) => {
        if (!isValidDocumentFile(file, stat)) {
            logger.debug(`not a .resize file: ${file}`);
            return;
        }
        const path = getPath(file);
        logger.debug(`instruction set added: ${path.path}`);
        operator.addDocument(path);
    });

    watcher.on("change", async (file) => {
        const path = getPath(file);
        logger.debug(`instruction set changed: ${path.path}`);
        operator.addDocument(path);
    });

    watcher.on("unlink", async (file) => {
        const path = getPath(file);
        logger.debug(`instruction set deleted: ${path.path}`);
        operator.removeDocument(path);
    })

    return { addEventListener: operator.addEventListener }
}

function id(segment: ISegment) {
    const sub = {
        documentPath: segment.document.file.path,
        sourcePath: segment.source.path,
        steps: segment.steps.map(({ operation, parameters }) => ({ operation, parameters })),
    }
    return MD5(sub);
}
function getOperator() {
    const logger = getLogger();
    const queue = new Queue({ concurrency: 1 });
    const status = getStatus(1000);

    queue.on("add", () => status.setStatus("busy"));
    queue.on("idle", () => status.setStatus("idle"));
    status.setStatus("idle");
    status.addEventListener("idle", () => {
        logger.log(segmentRepo.values().map(s => ({
            documentPath: s.document.file.path,
            sourcePath: s.source.path,
            steps: s.steps.map(s => ({
                operation: s.operation,
                parameters: s.parameters
            }))
        })));
    });

    const imageWatcher = watchFiles([], { disableGlobbing: true, usePolling: true });

    imageWatcher.on("add", imageListener);
    imageWatcher.on("change", imageListener);
    function imageListener(file: string) {
        file = path.resolve(file);
        logger.debug(`${file} updated`);
        const segments = segmentRepo.filter(s => s.source.path === file);
        queue.addAll(segments.map(segment => () => processSegment(segment)));
    }

    const segmentRepo = getSet<ISegment>(id);
    segmentRepo.addEventListener("add", segment => {
        getLogger({ segment }).debug("Segment added to repo");
        const imageAdded = imageRepo.add(segment.source.path);

        if (imageAdded) {
            // imageListener will trigger processing
            return;
        }

        // Image was already in the repo, trigger processing
        queue.add(() => processSegment(segment));
    });
    segmentRepo.addEventListener("delete", segment => {
        getLogger({ segment }).debug("Segment removed from repo");
        if (segmentRepo.filter(s => s.source.path === segment.source.path).length === 0) {
            imageRepo.delete(segment.source.path);
        }
    });

    const imageRepo = getSet<string>(file => file);
    imageRepo.addEventListener("add", path => {
        imageWatcher.add(path);
    });
    imageRepo.addEventListener("delete", path => {
        imageWatcher.unwatch(path);
    })

    async function addDocument(file: IPath) {
        const document = await getDocument(file);
        const newSegments = new Map(document.segments.map(segment => [id(segment), segment]));
        const currentSegments = new Map(segmentRepo.filter(s => s.document.file.path === file.path).map(segment => [id(segment), segment]));

        // delete extra segments
        [...currentSegments].filter(([id, segment]) => !newSegments.has(id)).forEach(([id, segment]) => {
            segmentRepo.delete(segment);
        });

        // add new segments
        [...newSegments].filter(([id, segment]) => !currentSegments.has(id)).forEach(([id, segment]) => {
            segmentRepo.add(segment);
        })

    }
    async function removeDocument(file: IPath) {
        segmentRepo.filter(s => s.document.file.path === file.path).forEach(segmentRepo.delete);
    }

    return {
        addDocument, removeDocument, addEventListener: status.addEventListener
    }
}

function getSet<T>(hash: (item: T) => string) {
    // const set = new Set<string>();
    const map = new Map<string, T>();

    function add(item: T) {
        const id = hash(item);
        if (map.has(id)) return false;
        // if (set.has(id)) return false;
        // set.add(id);
        map.set(id, item);
        notify("add", item);
        return true;
    }

    function _delete(item: T) {
        const id = hash(item);
        if (!map.has(id)) return false;
        // const result = set.delete(id);
        // if (!result) return false;
        map.delete(id);
        notify("delete", item);
        return true;
    }

    function has(item: T) {
        const id = hash(item);
        return map.has(id);
    }

    function values() {
        return [...map.values()];
    }

    function filter(predicate: (item: T) => any) {
        return [...map.values()].filter(predicate);
    }

    const listeners = {
        add: new Set<(item: T) => void>(),
        delete: new Set<(item: T) => void>()
    } as const;

    function addEventListener(event: "add", listener: (item: T) => void): void;
    function addEventListener(event: "delete", listener: (item: T) => void): void;
    function addEventListener(event: "add" | "delete", listener: (item: T) => void) {
        listeners[event].add(listener);
    }


    function removeEventListener(event: "add", listener: (item: T) => void): void;
    function removeEventListener(event: "delete", listener: (item: T) => void): void;
    function removeEventListener(event: "add" | "delete", listener: (item: T) => void) {
        listeners[event].delete(listener);
    }

    function notify(event: "add" | "delete", item: T) {
        const eventListeners = listeners[event];
        for (const listener of eventListeners) {
            setImmediate(() => listener(item));
        }
    }

    return {
        add, delete: _delete, has, values, filter, addEventListener, removeEventListener
    }

}


function getStatus(timeout: number) {
    const logger = getLogger("STATUS");
    type IStatus = "idle" | "busy";
    const listeners: { [key in IStatus]: Set<(event: IStatus) => void> } = {
        "idle": new Set(),
        "busy": new Set(),
    };

    let timer: any = null;
    let status: IStatus | undefined = undefined;

    function setBusy() {
        if (status === "busy") return;
        clearTimeout(timer);
        status = "busy";
        notify("busy");
    }

    function setIdle() {
        if (status === "idle") return;
        status = "idle";
        timer = setTimeout(() => {
            notify("idle");
        }, timeout);
    }

    function setStatus(status: IStatus) {
        status === "busy" ? setBusy() : setIdle();
    }

    function notify(event: IStatus) {
        logger.debug(`Status: ${event}`)
        listeners[event].forEach(listener => setImmediate(() => listener(event)));
    }

    function addEventListener(event: IStatus, listener: (event: IStatus) => void) {
        listeners[event].add(listener);
    }

    return {
        setStatus, addEventListener
    }
}