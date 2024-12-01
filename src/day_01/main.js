import { readFile } from "fs/promises";
import { downloadInput } from "../utils/download.js";
await downloadInput(1);
// Read the input file
const input = await readFile("src/day_01/input.txt", "utf-8");
const lines = input.trim().split("\n");
const left = lines
    .map((line) => Number(line.split(/\s{3}/)[0]))
    .sort((a, b) => a - b);
const right = lines
    .map((line) => Number(line.split(/\s{3}/)[1]))
    .sort((a, b) => a - b);
// Part 1
let result_part1 = 0;
for (let i = 0; i < lines.length; i++) {
    result_part1 += Math.abs(left[i] - right[i]);
}
console.log(`Part 1: ${result_part1}`);
// Part 2 - Similarity Score
let result_part2 = 0;
for (let i = 0; i < lines.length; i++) {
    // how many times left[i] exists in right?
    const count = right.filter((r) => r === left[i]).length;
    const similarity_score = left[i] * count;
    result_part2 += similarity_score;
}
console.log(`Part 2: ${result_part2}`);
