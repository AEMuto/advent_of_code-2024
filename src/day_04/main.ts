import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

/**
 * --- Day 4: XMAS ---
 * As the search for the Chief continues, a small Elf who lives on the station tugs on your shirt; she'd like to know if you could help her with her word search (your puzzle input). She only has to find one word: XMAS.
 * This word search allows words to be horizontal, vertical, diagonal, written backwards, or even overlapping other words. It's a little unusual, though, as you don't merely need to find one instance of XMAS - you need to find all of them.
 */

const PATH = "src/day_04/input.txt";

if (!existsSync(PATH)) await downloadInput(4);

const input = await readFile(PATH, "utf-8");
const grid = input.split("\n").map((line) => line.split(""));

let xmas_count = 0;
for (let x = 0; x < grid.length; x++) {
  for (let y = 0; y < grid[x].length; y++) {
    const letter = grid[x][y];
    if (letter === "X") {
      // Three directions to check
      // 1. Horizontal (Left and Right)
      // 2. Diagonal (Up-Right, Down-Right, Down-Left, Up-Left)
      // 3. Vertical (Up, Down)
      const res = {
        right:
          y + 3 < grid[x].length
            ? `X${grid[x][y + 1]}${grid[x][y + 2]}${grid[x][y + 3]}`
            : "",

        down_right:
          x + 3 < grid.length && y + 3 < grid[x].length
            ? `X${grid[x + 1][y + 1]}${grid[x + 2][y + 2]}${grid[x + 3][y + 3]}`
            : "",
        down:
          x + 3 < grid.length
            ? `X${grid[x + 1][y]}${grid[x + 2][y]}${grid[x + 3][y]}`
            : "",
        down_left:
          x + 3 < grid.length && y - 3 >= 0
            ? `X${grid[x + 1][y - 1]}${grid[x + 2][y - 2]}${grid[x + 3][y - 3]}`
            : "",

        left:
          y - 3 >= 0
            ? `X${grid[x][y - 1]}${grid[x][y - 2]}${grid[x][y - 3]}`
            : "",

        up_left:
          x - 3 >= 0 && y - 3 >= 0
            ? `X${grid[x - 1][y - 1]}${grid[x - 2][y - 2]}${grid[x - 3][y - 3]}`
            : "",
        up:
          x - 3 >= 0
            ? `X${grid[x - 1][y]}${grid[x - 2][y]}${grid[x - 3][y]}`
            : "",
        up_right:
          x - 3 >= 0 && y + 3 < grid[x].length
            ? `X${grid[x - 1][y + 1]}${grid[x - 2][y + 2]}${grid[x - 3][y + 3]}`
            : "",
      };
      Object.entries(res).forEach((entry) => {
        let [_, word] = entry;
        if (word === "XMAS") {
            // console.log(
            //   `XMAS found! Beginning at grid[${x}][${y}], direction: ${direction}`,
            // );
          xmas_count++;
        }
      });
    }
  }
}

console.log(`XMAS was found ${xmas_count} times!`);

/**
 * --- Part Two ---
 * Looking for the instructions, you flip over the word search to find that this isn't actually an XMAS puzzle; it's an X-MAS puzzle in which you're supposed to find two MAS in the shape of an X. One way to achieve that is like this:
 * M.S
 * .A.
 * M.S
 * So there is 4 possible ways to form an XMAS:
 * 1. M.S
 *    .A.
 *    M.S -> MSMS (top_left-top_right-bottom_left-bottom_right)
 * 2. M.M
 *    .A.
 *    S.S -> MMSS (top_left-top_right-bottom_left-bottom_right)
 * 3. S.M
 *    .A.
 *    S.M -> SMSM (top_left-top_right-bottom_left-bottom_right)
 * 4. S.S
 *    .A.
 *    M.M -> SSMM (top_left-top_right-bottom_left-bottom_right)
 */
const valid_words = ["MSMS", "MMSS", "SMSM", "SSMM"];
let x_mas_count = 0;

for (let x = 0; x < grid.length; x++) {
  for (let y = 0; y < grid[x].length; y++) {
    if (
      grid[x][y] === "A" && // The center letter is A
      x > 0 && // Not the first row
      y > 0 && // Not the first column
      x < grid.length - 1 && // Not the last row
      y < grid[x].length - 1 // Not the last column
    ) {
      const [
          top_left, top_right,
          bottom_left, bottom_right
      ] = [
          grid[x - 1][y - 1], grid[x - 1][y + 1],
          grid[x + 1][y - 1], grid[x + 1][y + 1]
      ];
      const word = `${top_left}${top_right}${bottom_left}${bottom_right}`;
      if (valid_words.includes(word)) {
          x_mas_count++;
          // console.log(`X_MAS found! Beginning at grid[${x}][${y}]`);
      }
    }
  }
}

console.log(`X_MAS was found ${x_mas_count} times!`);