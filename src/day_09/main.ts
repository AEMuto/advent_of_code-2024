import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_09/input.txt";

if (!existsSync(PATH)) await downloadInput(9);
const file = await readFile(PATH, "utf-8");
const input = file.split("").map((x) => parseInt(x, 10));

// 00...111...2...333.44.5555.6666.777.888899
// const input = "2333133121414131402".split("").map((x) => parseInt(x, 10));

const to_blocks = async (diskmap: number[]) => {
  const res = [];
  for (let i = 0; i < diskmap.length; i++) {
    // console.log(`\ni: ${i} | diskmap[i]: ${diskmap[i]}`);
    if (i % 2 === 0) {
      res.push(Array(diskmap[i]).fill(i / 2));
    } else if (diskmap[i] !== 0) {
      res.push(Array(diskmap[i]).fill(".").join(""));
    }
  }
  // console.log(res); // look like [[51, 51],'.....']
  // await writeFile("src/day_09/blockfiles.txt", block_files.join(""));
  return res;
};

const calc_checksum = (input: Array<number | string>) => {
  let res = 0;
  for (let i = 0; i < input.length; i++) {
    if (typeof input[i] === "number") {
      res += (input[i] as number) * i;
    }
  }

  return res;
};

const findLastNumIndex = (block_files: (string | number)[]) => {
  for (let i = block_files.length - 1; i >= 0; i--) {
    if (typeof block_files[i] === "number") return i;
  }
};

const result_part1 = async (input: number[]) => {
  const blocks = (await to_blocks(input)).flat(); // blocks: [[51, 51],'.....'] -> [51, 51, '.....']
  const block_files = blocks
    .map((block) => (typeof block === "string" ? block.split("") : block))
    .flat();
  await writeFile("src/day_09/blockfiles.txt", JSON.stringify(block_files));
  // blocks: [51, 51, '.....'] -> block_files: [51, 51, '.', '.', '.', '.']
  const length = block_files.length;
  for (let i = 0; i < length; i++) {
    if (block_files[i] === ".") {
      const last_num_index = findLastNumIndex(block_files);
      if (last_num_index && last_num_index < i) break;
      if (last_num_index) {
        const temp = block_files[i];
        block_files[i] = block_files[last_num_index];
        block_files[last_num_index] = temp;
      }
    }
  }
  // console.log(`block_files length (sorted): ${block_files.length}`);
  await writeFile("src/day_09/blockfiles_sorted.txt", JSON.stringify(block_files));
  //const res = block_files.filter((x) => typeof x === "number");
  return calc_checksum(block_files.filter((x) => typeof x === "number"));
};

console.time("part1");
console.log(await result_part1(input));
console.timeEnd("part1");

// console.log(
//   calc_checksum(
//     "00992111777.44.333....5555.6666.....8888..".split("").map((x) => (x !== "." ? +x : x)),
//   ),
// );

const result_part2 = async (input: number[]) => {
  // block_files: [[51, 51],'.....']
  const block_files = await to_blocks(input);
  await writeFile("src/day_09/blockfiles_part2.txt", JSON.stringify(block_files));
  // console.log("block_files (og):", block_files);
  // console.log(`block_files (og) length: ${block_files.length}`);
  const length = block_files.length;

  /**
   * Reverse loop: we take the last number and try to fit it into the first free space
   */
  let round = 0;
  for (let right = length - 1; right >= 0; right--) {
    // console.log(`\n### Round ${round} ###`);
    // console.log(`Current right: ${right}`);
    // console.log(`Current block_files: "${block_files}"`);
    // console.log(`Current block_file: "${block_files[right]}"`);
    if (!block_files[right].includes(".")) {
      const num = block_files[right];
      for (let left = 0; left < length && left < right; left++) {
        // ! left < right

        if (block_files[left].includes(".")) {
          const free_space = block_files[left];
          if (num.length <= free_space.length) {
            const diff = free_space.length - num.length;
            if (diff > 0) {
              block_files[left] = num;
              block_files[right] = Array(num.length).fill(".").join("");
              block_files.splice(left + 1, 0, Array(diff).fill(".").join(""));
              right++;
            } else {
              block_files[left] = num;
              block_files[right] = Array(num.length).fill(".").join("");
            }
            break;
          }
        }
      }
    }
    round++;
  }

  // console.log("block_files (sorted):", block_files);
  // console.log(`block_files length (sorted): ${block_files.length}`);
  // console.log(`First number: ${res[0]}, is it a number? ${typeof res[0] === "number"}`);
  const res = block_files.flat().map((x) => typeof x === "string" && x.length > 1 ? x.split("") : x).flat();
  await writeFile("src/day_09/blockfiles_sorted_part2.txt", JSON.stringify(res));
  return calc_checksum(res);
};

console.time("part2");
console.log(await result_part2(input));
console.timeEnd("part2");

// 6352041120068 too low
