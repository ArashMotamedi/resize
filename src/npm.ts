import fs from "fs";
import cp from "child_process";
import { getLogger } from "./logger";

const [node, code, ...argv] = process.argv;
const { npm_execpath, npm_node_execpath, npm_lifecycle_event } = process.env;

function inNpm() {
    return npm_execpath && npm_node_execpath && npm_lifecycle_event;
}

async function getAllScripts() {
    try {
        const packageContent = (await fs.promises.readFile("package.json")).toString();
        const packageJson = JSON.parse(packageContent);
        const scripts = Object.keys(packageJson.scripts);
        return scripts;
    }
    catch (e) {
        return [];
    }
};

function getScriptRunner() {
    const processes = new Map<string, Promise<void>>();
    const logger = getLogger("SCRIPT RUNNER");

    function run(script: string) {
        script = script.toLowerCase();
        if (processes.has(script)) {
            logger.debug(`${script} is already running`);
            return;
        }

        logger.debug(`Running ${script}`);
        const scriptProcess = cp.spawn(npm_node_execpath!, [npm_execpath!, "run", script], { stdio: "inherit" });
        const promise = new Promise<void>(r => {
            scriptProcess.addListener("close", () => {
                logger.debug(`Completed ${script}`)
                processes.delete(script);
                r();
            });
        });
        processes.set(script, promise);
    }

    return { run }
}

const runner = getScriptRunner();

export async function getNpm() {
    const logger = getLogger("NPM");
    if (!inNpm()) {
        logger.debug("Not running in NPM");
        return;
    }

    const currentScript = npm_lifecycle_event;
    const otherScripts = (await getAllScripts()).filter(s => s.toLowerCase() !== currentScript?.toLowerCase());
    function run(script: string) {
        return runner.run(script);
    }

    return {
        currentScript,
        otherScripts,
        run
    }
}