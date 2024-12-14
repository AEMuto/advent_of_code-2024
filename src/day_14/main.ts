import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_14/input.txt";

if (!existsSync(PATH)) await downloadInput(14);
const file = await readFile(PATH, "utf-8");
const example = [
  "p=0,4 v=3,-3",
  "p=6,3 v=-1,-3",
  "p=10,3 v=-1,2",
  "p=2,0 v=2,-1",
  "p=0,0 v=1,3",
  "p=3,0 v=-2,-2",
  "p=7,6 v=-1,-3",
  "p=3,0 v=-1,-2",
  "p=9,3 v=2,3",
  "p=7,3 v=-1,2",
  "p=2,4 v=2,-3",
  "p=9,5 v=-3,-3",
].map((line) => line.split(/[^\d-]/gm).filter(Boolean).map(Number));

const input = file.split("\n").map((line) => line.split(/[^\d-]/gm).filter(Boolean).map(Number));
// console.log(example);

const GRID_X = 101;
const GRID_Y = 103;

// elements can be string or number
type gridType = (string | number)[][];

const grid:gridType = Array.from({ length: GRID_Y }, () => Array.from({ length: GRID_X }, () => " "));

type Coordinates = {
  x: number;
  y: number;
};

class Robot {
  #position: Coordinates;
  private velocity: Coordinates;
  private grid: gridType;
  private rows: number;
  private cols: number;
  constructor(position: Coordinates, velocity: Coordinates, grid: gridType) {
    this.#position = position;
    this.velocity = velocity;
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
  }

  move() {
    const { x, y } = this.position;
    const { x: dx, y: dy } = this.velocity;
    let nx = x + dx;
    let ny = y + dy;
    if (nx < 0) nx = this.cols - Math.abs(nx);
    if (ny < 0) ny = this.rows - Math.abs(ny);
    if (nx >= this.cols) nx = nx - this.cols;
    if (ny >= this.rows) ny = ny - this.rows;
    this.position = { x: nx, y: ny };
  }

  time_shift(time:number) {
    const { x, y } = this.position;
    const { x: dx, y: dy } = this.velocity;
    let nx = Math.abs((x + dx * time) % this.cols);
    let ny = Math.abs((y + dy * time) % this.rows);
    console.log(`Moving to x: ${nx}, y: ${ny}`);
    this.position = { x: nx, y: ny };
  }

  draw(target: gridType) {
    const { x, y } = this.position;
    // console.log(`Moved to x: ${x}, y: ${y}`);
    target[y][x] = "◉";
  }

  private set position(position: Coordinates) {
    this.#position = position;
  }

  get position() {
    return this.#position;
  }
}

const robots = input.map(([x, y, dx, dy]) => new Robot({ x, y }, { x: dx, y: dy }, grid));

// const start_grid = structuredClone(grid)

// robots.forEach((robot) => {
//   const { x, y } = robot.position;
//   let curr = start_grid[y][x];
//   if (typeof curr === "string") start_grid[y][x] = 1;
//   else {
//     curr++;
//     start_grid[y][x] = curr;
//   }
// });

// console.log("\nStart grid:");
// console.log(start_grid.map((row) => row.join("")).join("\n"));

for (let i = 0; i < 1850; i++) {
  const canvas = structuredClone(grid);
  robots.forEach((robot) => {robot.move(); robot.draw(canvas)});
  await writeFile(`src/day_14/canvas/canvas_${i}.txt`, canvas.map((row) => row.join("")).join("\n"));
}

// const end_grid = structuredClone(grid)

// robots.forEach((robot) => {
//   const { x, y } = robot.position;
//   let curr = end_grid[y][x];
//   if (typeof curr === "string") end_grid[y][x] = 1;
//   else {
//     curr++;
//     end_grid[y][x] = curr;
//   }
// });

// console.log("\nEnd grid:");
// console.log(end_grid.map((row) => row.join("")).join("\n"));

// filter robots by quadrant
const middle_x = Math.floor(GRID_X / 2);
const middle_y = Math.floor(GRID_Y / 2);
const robots_end_positions = robots.map(({ position }) => position);

const robots_by_quadrants = {
  top_left: robots_end_positions.filter(({ x, y }) => x < middle_x && y < middle_y).length,
  top_right: robots_end_positions.filter(({ x, y }) => x > middle_x && y < middle_y).length,
  bottom_left: robots_end_positions.filter(({ x, y }) => x < middle_x && y > middle_y).length,
  bottom_right: robots_end_positions.filter(({ x, y }) => x > middle_x && y > middle_y).length,
}

console.log("\nRobots by quadrants:");
console.log(robots_by_quadrants);
console.log(`\nSafety Score: ${robots_by_quadrants.top_left * robots_by_quadrants.top_right * robots_by_quadrants.bottom_left * robots_by_quadrants.bottom_right}`);


console.log("NEW ROBOT");
const roboto = new Robot({ x: 0, y: 0 }, { x: 4, y: 4 }, grid);
roboto.time_shift(100);
console.log(roboto.position);