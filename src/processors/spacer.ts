import sharp from "sharp";

export function getEmpty() {
    return sharp({ create: { width: 0, height: 0, background: "black", channels: 3 } })
}