import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";
import { isWithinBounds } from "../utils/utils.js";

const PATH = "src/day_10/input.txt";

if (!existsSync(PATH)) await downloadInput(10);
const file = await readFile(PATH, "utf-8");
const input = file.split("\n").map((line) => line.split("").map(Number));

const DIRECTIONS = [
  [1, 0], // down
  [0, 1], // right
  [-1, 0], // up
  [0, -1], // left
];

const example = [
  "89010123",
  "78121874",
  "87430965",
  "96549874",
  "45678903",
  "32019012",
  "01329801",
  "10456732",
].map((line) => line.split("").map(Number));

async function calc_trails(grid: number[][]) {
  const rows = grid.length;
  const cols = grid[0].length;
  let unique_global_trails = 0;
  let all_global_trails = 0;

  /**
   * Purpose: start at 0 and find all possible trails to 9s
   * by moving to adjacent cells with increasing numbers
   *
   * 0->1->2->3->4->5->6->7->8->9
   *
   * Use dfs (because stack) to find all possible trails
   * @param x x coordinate (j)
   * @param y y coordinate (i)
   * @returns number of trails found
   */
  async function find_trails(x: number, y: number, unique_trail=true,writefile=false) {
    let grid_clone;
    let visited;
    
    if (writefile) grid_clone = structuredClone(grid) as unknown as string[][];
    if (unique_trail) visited = new Set<string>();
    
    let local_trails = 0; // we increase it by 1 each time we reach 9
    const stack = [[x, y]]; // initialize the stack with the starting point
    
    while (stack.length) {
      const [x, y] = stack.pop()!;
      const current = grid[x][y];
      
      if (unique_trail && visited && visited.has(`${x},${y}`)) continue;
      
      if (unique_trail && visited) visited.add(`${x},${y}`);
      if (writefile && grid_clone) grid_clone[x][y] = "X"; // mark as visited
      
      if (current === 9) {
        // we found the end of the trail
        // console.log(`Trail found at ${x}, ${y}, which is ${current}, score: ${local_trails}`);
        local_trails++;
        continue
      }

      for (const [dx, dy] of DIRECTIONS) {
        // we look around
        const newX = x + dx;
        const newY = y + dy;
        if (isWithinBounds(newX, newY, grid)) {
          const next = grid[newX][newY];
        
          if (next - current === 1) {
            // we found the next number
            stack.push([newX, newY]);
          }
        }
      }
    }
    if (writefile && grid_clone) await writeFile(`src/day_10/grid_${x}_${y}.txt`, grid_clone.map((row) => row.join("")).join("\n"));
    return local_trails;
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const current = grid[i][j];
      if (current === 0) {
        const unique_local_trails = await find_trails(i, j);
        const all_local_trails = await find_trails(i, j, false);
        // console.log("trails found", local_trails);
        unique_global_trails += unique_local_trails;
        all_global_trails += all_local_trails;
      }
    }
  }
  return { unique_global_trails, all_global_trails };
}

console.time("Time to compute | Part 1");
const trails = await calc_trails(input);
console.log("Unique trails found", trails.unique_global_trails);
console.log("All trails found", trails.all_global_trails);
console.timeEnd("Time to compute | Part 1");
