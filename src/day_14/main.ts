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
].map((line) =>
  line
    .split(/[^\d-]/gm)
    .filter(Boolean)
    .map(Number),
);

const input = file.split("\n").map((line) =>
  line
    .split(/[^\d-]/gm)
    .filter(Boolean)
    .map(Number),
);

const GRID_X = 101;
const GRID_Y = 103;

type gridType = (string | number)[][];

const grid: gridType = Array.from({ length: GRID_Y }, () =>
  Array.from({ length: GRID_X }, () => " "),
);

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

  time_shift(time: number) {
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

function calc_safety_score(coordinates: Coordinates[], grid: gridType) {
  const middle_x = Math.floor(grid[0].length / 2);
  const middle_y = Math.floor(grid.length / 2);

  const robots_by_quadrants = {
    top_left: coordinates.filter(({ x, y }) => x < middle_x && y < middle_y).length,
    top_right: coordinates.filter(({ x, y }) => x > middle_x && y < middle_y).length,
    bottom_left: coordinates.filter(({ x, y }) => x < middle_x && y > middle_y).length,
    bottom_right: coordinates.filter(({ x, y }) => x > middle_x && y > middle_y).length,
  };

  return (
    robots_by_quadrants.top_left *
    robots_by_quadrants.top_right *
    robots_by_quadrants.bottom_left *
    robots_by_quadrants.bottom_right
  );
}

const robots = input.map(([x, y, dx, dy]) => new Robot({ x, y }, { x: dx, y: dy }, grid));

const safety_score = { score: 0, frame: 0 };

// Tried math but it was too hard, so I just brute forced it
// Here we calculate the safety score for each frame and save the best one
for (let i = 0; i < 10000; i++) {
  const canvas = structuredClone(grid);
  robots.forEach((robot) => {
    robot.move();
    robot.draw(canvas);
  });
  const robots_end_positions = robots.map(({ position }) => position);
  const score = calc_safety_score(robots_end_positions, grid);
  if (i === 0) {
    safety_score.score = score;
    safety_score.frame = i;
  } else if (score < safety_score.score) {
    safety_score.score = score;
    safety_score.frame = i+1;
    await writeFile(
      `src/day_14/canvas/canvas_${i}.txt`,
      canvas.map((row) => row.join("")).join("\n"),
    );
  }
}

console.log("Best (lowest) Safety score:", safety_score);
