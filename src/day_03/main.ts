import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_03/input.txt";

if (!existsSync(PATH)) await downloadInput(3);

const input = await readFile(PATH, "utf-8");

// Will match every mul(x,y)
const regex_part1 = /mul\(\d{1,3},\d{1,3}\)/gm;
const res_part1 = input
    .match(regex_part1)
    // We match the two numbers in the string and multiply them
    // ["mul(1,2)", "mul(3,4)"] => [[1, 2], [3, 4]] => [2, 12]
    ?.map((match) => match.match(/\d{1,3}/g)?.reduce((acc, curr) => acc * +curr, 1))
    // We sum all the results of the previous step
    // Because of my ts linting rules, I need to ensure acc and curr are not undefined
    // And since the acc begin at 0, we return the first element of the array at the start of the loop
    // [2, 12] => 14
    .reduce((acc, curr, _, arr) => acc && curr ? acc + curr : arr[0], 0);

console.log(`Part 1: ${res_part1}`);

// Will match everything between don't()...do(), including the don't() and do()
const regex_part2 = /don't\(\).+?do\(\)/gm
const res_part2 = input
    .split("\n") // Added this part after seeing that \n was breaking my regex
    .join("")
    .split(regex_part2) // We remove everything that is matched by the regex
    .join("")
    .match(regex_part1) // We then apply the same regex as part 1
    ?.map((match) => match.match(/\d{1,3}/g)?.reduce((acc, curr) => acc * +curr, 1))
    .reduce((acc, curr, _, arr) => acc && curr ? acc + curr : arr[0], 0);

console.log(`Part 2: ${res_part2}`)