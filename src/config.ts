import clargs from "command-line-args";

interface IConfig {
    silent: boolean;
    watch: boolean;
    debug: boolean;
}

const cl = clargs([
    { name: "watch", alias: "w", defaultValue: false, type: Boolean },
    { name: "silent", alias: "s", defaultValue: false, type: Boolean },
    { name: "debug", alias: "d", defaultValue: false, type: Boolean },
]);

const config: IConfig = {
    watch: cl.watch,
    silent: cl.silent,
    debug: cl.debug,
}

export function getConfig() {
    return config;
}