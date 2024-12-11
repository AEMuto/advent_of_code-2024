import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_11/input.txt";

if (!existsSync(PATH)) await downloadInput(11);
const file = await readFile(PATH, "utf-8");
// let input = file.split(" ").map(x => +x)
let input = [125, 17];

for (let x = 0; x < 75; x++) {
  try {
    const new_arr = input.reduce<number[]>((acc, curr) => {
      const str = `${curr}`;
      if (curr === 0) acc.push(1);
      else if (str.length % 2 === 0) {
        const middle = Math.floor(str.length / 2);
        const left = str.substring(0, middle);
        const right = str.substring(middle, str.length);
        acc.push(parseInt(left, 10), parseInt(right, 10));
      } else {
        acc.push(curr * 2024);
      }
      return acc;
    }, []);
    input = new_arr;
  } catch (e) {
    console.log(e);
    console.log(`Max x value: ${x}`);
    console.log(input.length);
    break;
  }
}

console.time("part1");
console.log(input.length);
console.timeEnd("part1");
