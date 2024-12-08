import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";
import { get } from "http";

const PATH = "src/day_08/input.txt";

if (!existsSync(PATH)) await downloadInput(8);
const file = await readFile(PATH, "utf-8");
const input = file
  .split("\n")
  .map((line) => line.split(""))
  .filter(Boolean);
// const input = [
//   "............",
//   "........0...",
//   ".....0......",
//   ".......0....",
//   "....0.......",
//   "......A.....",
//   "............",
//   "............",
//   "........A...",
//   ".........A..",
//   "............",
//   "............",
// ].map((line) => line.split(""));

type Coordinate = { x: number; y: number };

const antennas = input.reduce(
  (acc, row, y) => {
    row.forEach((cell, x) => {
      if (cell !== ".") {
        acc[cell] = acc[cell] || [];
        acc[cell].push({ x, y });
      }
    });
    return acc;
  },
  {} as Record<string, Coordinate[]>,
);

console.log(antennas);

const is_inbounds = (x: number, y: number, height: number, width: number) =>
  x >= 0 && x < width && y >= 0 && y < height;

const get_antinodes = (antennas: Coordinate[], height: number, width: number) => {
  const result_part1 = [] as number[][];
  const result_part2 = [] as number[][];
  const calc_antinodes_part1 = (
    antennas: Coordinate[],
    grid_height: number,
    grid_width: number,
  ) => {
    if (antennas.length === 0) return;
    for (let i = 1; i < antennas.length; i++) {
      // Distance
      const dx = antennas[0].x - antennas[i].x;
      const dy = antennas[0].y - antennas[i].y;
      // Antinode 1
      const x1 = antennas[0].x + dx;
      const y1 = antennas[0].y + dy;
      // Antinode 2
      const x2 = antennas[i].x - dx;
      const y2 = antennas[i].y - dy;
      // Check if antinode 1 is in the grid
      if (is_inbounds(x1, y1, grid_height, grid_width)) result_part1.push([x1, y1]);
      // Check if antinode 2 is in the grid
      if (is_inbounds(x2, y2, grid_height, grid_width)) result_part1.push([x2, y2]);
    }
    antennas.shift();
    calc_antinodes_part1(antennas, grid_height, grid_width);
  };
  const calc_antinodes_part2 = (
    antennas: Coordinate[],
    grid_height: number,
    grid_width: number,
  ) => {
    if (antennas.length === 0) return;
    for (let i = 1; i < antennas.length; i++) {
      let [x, y] = [antennas[0].x, antennas[0].y];
      // Distance
      const dx = antennas[0].x - antennas[i].x;
      const dy = antennas[0].y - antennas[i].y;
      while (is_inbounds(x, y, grid_height, grid_width)) {
        result_part2.push([x, y]);
        x += dx;
        y += dy;
      }
      x = antennas[i].x;
      y = antennas[i].y;
      while (is_inbounds(x, y, grid_height, grid_width)) {
        result_part2.push([x, y]);
        x -= dx;
        y -= dy;
      }
    }
    antennas.shift();
    calc_antinodes_part2(antennas, grid_height, grid_width);
  };
  calc_antinodes_part1(structuredClone(antennas), height, width);
  calc_antinodes_part2(structuredClone(antennas), height, width);
  return [result_part1,result_part2]
};

const total_antinodes = Object.values(antennas).reduce((acc, antennas) => {
  const [part1,part2] = get_antinodes(antennas, input.length, input[0].length);
  part1.forEach((coord) => acc[0].add(JSON.stringify(coord)));
  part2.forEach((coord) => acc[1].add(JSON.stringify(coord)));
  return acc;
}, [new Set<string>(),new Set<string>()]);

console.log(`Total unique antinodes part 1: ${total_antinodes[0].size}`);
console.log(`Total unique antinodes part 2: ${total_antinodes[1].size}`);
// ❌ 397 too high
// ✅ 392
