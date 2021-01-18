import Queue from "p-queue";

const queue = new Queue({ concurrency: 1 });
export function getQueue() {
    return queue;
}
