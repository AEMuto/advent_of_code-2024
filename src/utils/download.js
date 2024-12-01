// src/utils/download.ts
import { writeFileSync } from "fs";
import { get } from "https";
import "dotenv/config";
if (!process.env.SESSION_COOKIE) {
    throw new Error("SESSION_COOKIE not found in .env");
}
export function downloadInput(day) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                Cookie: `session=${process.env.SESSION_COOKIE}`,
            },
        };
        get(`https://adventofcode.com/2024/day/${day}/input`, options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                writeFileSync(`src/day_${String(day).padStart(2, "0")}/input.txt`, data);
                resolve();
            });
        }).on("error", reject);
    });
}
