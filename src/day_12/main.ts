import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_12/input.txt";

if (!existsSync(PATH)) await downloadInput(12);
const file = await readFile(PATH, "utf-8");

const example = [
  "RRRRIICCFF",
  "RRRRIICCCF",
  "VVRRRCCFFF",
  "VVRCCCJFFF",
  "VVVVCJJCFE",
  "VVIVCCJJEE",
  "VVIIICJJEE",
  "MIIIIIJJEE",
  "MIIISIJEEE",
  "MMMISSJEEE",
].map((row) => row.split(""));

// const input = example;

const input = file.split("\n").map((row) => row.split(""));

type RegionMetric = {
  area: number;
  perimeter: number;
};

type RegionsData = Record<string, RegionMetric[]>;

function calc_regions(grid: string[][]): RegionsData {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const directions = [
    [1, 0], // down
    [0, 1], // right
    [-1, 0], // up
    [0, -1], // left
  ];
  const results: RegionsData = {};

  function floodFill(x: number, y: number, symbol: string) {
    const stack = [[x, y]];
    let area = 0;
    let perimeter = 0;

    while (stack.length > 0) {
      const curr = stack.pop();
      if (!curr) continue;
      const [cx, cy] = curr;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      area++;
      let localPerimeter = 0;

      for (const [dx, dy] of directions) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx < 0 || ny < 0 || nx >= rows || ny >= cols || grid[nx][ny] !== symbol) {
          localPerimeter++;
        } else if (!visited.has(`${nx},${ny}`)) {
          stack.push([nx, ny]);
        }
      }

      perimeter += localPerimeter;
    }

    return { area, perimeter };
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const symbol = grid[i][j];
      if (!visited.has(`${i},${j}`)) {
        const { area, perimeter } = floodFill(i, j, symbol);
        if (!results[symbol]) results[symbol] = [];
        results[symbol].push({ area, perimeter });
      }
    }
  }

  return results;
}

console.time("Time to compute | Part 1");
const result_part1 = Object.values(calc_regions(input))
  .flat()
  .reduce((acc, curr) => acc + curr.area * curr.perimeter, 0);
console.timeEnd("Time to compute | Part 1");

console.log(`Part 1, Price: ${result_part1}`);