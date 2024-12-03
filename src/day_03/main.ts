import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_03/input.txt";

if (!existsSync(PATH)) await downloadInput(3);

const input = await readFile(PATH, "utf-8");

const regex_part1 = /mul\(\d{1,3},\d{1,3}\)/gm;
const res_part1 = input
    .split("\n")
    .join("")
    .match(regex_part1)
    ?.map((match) => match.match(/\d{1,3}/g)?.reduce((acc, curr) => acc * +curr, 1))
    .reduce((acc, curr, _, arr) => acc && curr ? acc + curr : arr[0], 0);

console.log(`Part 1: ${res_part1}`);

const regex_part2 = /don't\(\).+?do\(\)/gm

const res_part2 = input
    .split("\n")
    .join("")
    .split(regex_part2)
    .join('')
    .match(regex_part1)
    ?.map((match) => match.match(/\d{1,3}/g)?.reduce((acc, curr) => acc * +curr, 1))
    .reduce((acc, curr, _, arr) => acc && curr ? acc + curr : arr[0], 0);

console.log(`Part 2: ${res_part2}`)