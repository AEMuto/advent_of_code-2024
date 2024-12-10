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
      res.push(Array(diskmap[i]).fill(i / 2))
    } else if (diskmap[i] !== 0) {
      res.push(Array(diskmap[i]).fill(".").join(""));
    }
  }
  // console.log(res); // look like [[51, 51],'.....']
  // await writeFile("src/day_09/blockfiles.txt", block_files.join(""));
  return res.flat(); // [51, 51, '.....']
};

const calc_checksum = (input: Array<number>) => {
  let res = 0;
  for (let i = 0; i < input.length; i++) {
    res += input[i] * i;
  }
  return res;
};

const findLastNumIndex = (block_files: (string | number)[]) => {
  for (let i = block_files.length - 1; i >= 0; i--) {
    if (typeof block_files[i] === "number") return i;
  }
}

const result_part1 = async (input: number[]) => {
  const blocks = await to_blocks(input);
  const block_files = blocks.map((block) => typeof block === "string" ? block.split("") : block).flat();
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
  // await writeFile("src/day_09/blockfiles_sorted.txt", block_files.join(""));
  return calc_checksum(block_files.filter(x=>typeof x === "number"));
};

const input_1 = structuredClone(input);
const input_2 = structuredClone(input);

console.time("part1");
console.log(await result_part1(input_1));
console.timeEnd("part1");

// console.log(
//   calc_checksum(
//     "00992111777.44.333....5555.6666.....8888..".split("").map((x) => (x !== "." ? +x : x)),
//   ),
// );

// const result_part2 = (input: number[]) => {
//   const block_files = to_blocks(input);
//   const nums = block_files.filter((str) => !str.includes(".")).reverse(); // Help array
//   //console.log(block_files);
//   for (let i = 0; i < block_files.length; i++) {
//     // console.log(`### ROUND N°${i} ###`)
//     let current = block_files[i];
//     // console.log("current: ",current)
//     if (current.includes(".")) {
//       for (let j = 0; j < nums.length; j++) {
//         // Go through all nums, eg : 99,8888,777,6666,...
//         const last_num = nums[j];
//         // console.log("last_num: ",last_num)
//         if (current.length < last_num.length) {
//           // console.log("current < last_num", current, last_num);
//           continue;
//         } else {
//           // console.log("current > last_num", current, last_num);
//           nums.splice(j, 1); // Delete num from help array since we can insert
//           const last_num_index = block_files.lastIndexOf(last_num);
//           // numbers should be only moved from left to right so if the current index is greater than the last_num_index
//           // then we exit the loop
//           if (i > last_num_index) {
//             // console.log("i > last_num_index");
//             break;
//           }
//           const remove = block_files
//             .splice(
//               last_num_index, // Start index
//               1, // Replace
//               Array(last_num.length).fill(".").join(""), // With dots (free space)
//             )
//             .join("");

//           const diff = current.length - last_num.length;
//           const insert = `${diff > 0 ? Array(diff).fill(".").join("") : ""}`;
//           // console.log("insert: ", insert);
//           // console.log("before:", block_files)
//           insert.length > 0
//             ? block_files.splice(i, 1, remove, insert)
//             : block_files.splice(i, 1, remove);
//           // console.log("after:", block_files)
//           break;
//         }
//       }
//     }
//   }
//   // console.log(block_files);
//   const res = block_files
//     .join("")
//     .split("")
//     .map((x) => (x !== "." ? +x : x));
//   // console.log(res);
//   //return calc_checksum(res);
// };

// console.time("part2");
// console.log(result_part2(input_2));
// console.timeEnd("part2");
