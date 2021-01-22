import clargs from "command-line-args";

interface IConfig {
    silent: boolean;
    watch: boolean;
    debug: boolean;
    and: string;
    then: string;
}

const cl = clargs([
    { name: "watch", alias: "w", defaultValue: false, type: Boolean },
    { name: "silent", alias: "s", defaultValue: false, type: Boolean },
    { name: "debug", alias: "d", defaultValue: false, type: Boolean },
    { name: "and", defaultValue: "", type: String },
    { name: "then", defaultValue: "", type: String },
]);

const config: IConfig = {
    watch: cl.watch,
    silent: cl.silent,
    debug: cl.debug,
    and: cl.and,
    then: cl.then
}

export function getConfig() {
    return config;
}