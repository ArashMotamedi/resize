import "core-js/es";
import path from "path";
import { watch } from "chokidar";
import { getRawInstructionSet } from "./instructions/raw";
import { getParsedInstructionSet } from "./instructions/parsed";

function isUnderPath(options: { base: string, test: string }) {
    const { base, test } = options;
    let baseResolved = path.resolve(base);
    let testResolved = path.resolve(test);
    if (!baseResolved.endsWith("/")) {
        baseResolved += "/";
    }

    return testResolved.startsWith(baseResolved);
}

async function main() {
    const base = path.resolve(".");
    const watcher = watch("**/.resize", { usePolling: true });
    watcher.on("add", async (file, stat) => {
        if (!stat?.isFile() || !(file === ".resize" || file.endsWith("/.resize"))) return;
        console.log(`added: ${file}`);

        const raw = await getRawInstructionSet(file);
        if (typeof raw === "string") console.log(raw);
        else {
            const rich = getParsedInstructionSet(raw);
            console.log(JSON.stringify(rich, undefined, 4));
        }

        const watcher = watch(path.resolve(file), { disableGlobbing: true });
        watcher.on("change", () => {
            console.log(`changed: ${file}`);
        });

        watcher.on("unlink", () => {
            console.log(`deleted: ${file}`);
            watcher.removeAllListeners();
            watcher.unwatch(file);
        });
    });

    await new Promise(r => setInterval(() => { }, 10000));
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