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

const DIRECTIONS = [
  [1, 0], // down
  [0, 1], // right
  [-1, 0], // up
  [0, -1], // left
];

type Directions = "down" | "right" | "up" | "left";

type RegionMetrics = {
  area: number;
  perimeter: number;
  sides: number;
};

type RegionsData = Record<string, RegionMetrics[]>;

// TODO: Want to make a count corners instead of sides
// This should be more efficient but I will need to add
// diagonals directions to the DIRECTIONS array

const countSides = (boundary: number[][], symbol: string) => {
  if (boundary.length === 0) return 0;
  // {down[y], right[x], up[y], left[x]} structure to store "sides"
  const sides: Record<Directions, Record<string, number[]>> = {
    up: {},
    down: {},
    right: {},
    left: {},
  };

  for (let i = 0; i < boundary.length; i++) {
    const [x, y, dx, dy] = boundary[i];
    const direction = `${dx},${dy}`;
    switch (direction) {
      case "1,0": // down
        if (!Object.hasOwn(sides["down"], x)) sides["down"][x] = [y];
        else sides["down"][x].push(y);
        break;
      case "0,1": // right
        if (!Object.hasOwn(sides["right"], y)) sides["right"][y] = [x];
        else sides["right"][y].push(x);
        break;
      case "-1,0": // up
        if (!Object.hasOwn(sides["up"], x)) sides["up"][x] = [y];
        else sides["up"][x].push(y);
        break;
      case "0,-1": // left
        if (!Object.hasOwn(sides["left"], y)) sides["left"][y] = [x];
        else sides["left"][y].push(x);
        break;
      default:
        console.error("Invalid direction");
        break;
    }
  }
  // console.log(`Sides for ${symbol}:`, sides);
  return Object.values(sides).reduce((acc, side) => {
    const result = Object.values(side).reduce((acc, nums) => {
      const contiguous = nums
        .sort((a, b) => a - b)
        .reduce((acc, num, i, nums) => {
          if (i === 0) return acc;
          if (num - nums[i - 1] > 1) return acc + 1;
          return acc;
        }, 1);
      return acc + contiguous;
    }, 0);
    return acc + result;
  }, 0);
};

function calc_regions(grid: string[][]): RegionsData {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const results: RegionsData = {};

  function floodFill(x: number, y: number, symbol: string) {
    const stack = [[x, y]];
    let area = 0;
    let perimeter = 0;
    const boundary = [];

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!; // non-null assertion, trust me bro
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue; // Skip if we have already visited this cell
      visited.add(key);

      area++;
      let localPerimeter = 0;

      for (const [dx, dy] of DIRECTIONS) {
        // Look ahead in all directions
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx < 0 || ny < 0 || nx >= rows || ny >= cols || grid[nx][ny] !== symbol) {
          // out of bounds or different symbol
          localPerimeter++; // Means we are at the edge of the region, so increment the perimeter
          boundary.push([cx, cy, dx, dy]);
        } else if (!visited.has(`${nx},${ny}`)) {
          // If we haven't visited this cell yet, add it to the stack
          stack.push([nx, ny]);
        }
      }

      perimeter += localPerimeter; // Add the local perimeter to the global perimeter of the current region
    }
    const sides = countSides(boundary, symbol);
    return { area, perimeter, sides };
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const symbol = grid[i][j];
      if (!visited.has(`${i},${j}`)) {
        const { area, perimeter, sides } = floodFill(i, j, symbol);
        if (!results[symbol]) results[symbol] = [];
        results[symbol].push({ area, perimeter, sides });
      }
    }
  }

  return results;
}

console.time("Time to compute | Part 1 & 2");

const results = calc_regions(input);

const prices = Object.values(results).reduce<{ p1: number; p2: number }>(
  (acc, regions) => {
    return {
      p1: acc.p1 + regions.reduce((acc, region) => acc + region.area * region.perimeter, 0),
      p2: acc.p2 + regions.reduce((acc, region) => acc + region.area * region.sides, 0),
    };
  },
  { p1: 0, p2: 0 },
);

console.timeEnd("Time to compute | Part 1 & 2");

// console.log(results);
console.log(`Part 1: ${prices.p1}`);
console.log(`Part 2: ${prices.p2}`);
