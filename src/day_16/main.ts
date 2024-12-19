import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";
import PriorityQueue from "./PriorityQueue.js";

const PATH = "src/day_16/input.txt";

type Coordinate = { x: number; y: number };
type Direction = "N" | "E" | "S" | "W";
type DirectionsMap = Record<Direction, [number, number]>; // [dx, dy]
type RotationsMap = Record<Direction, [Direction, Direction]>;
type State = Coordinate & { dir: Direction; score: number };

if (!existsSync(PATH)) await downloadInput(16);
const file = await readFile(PATH, "utf-8");
const grid = file.split("\n").map((line) => line.split(""));

const example = [
  "###############",
  "#.......#....E#",
  "#.#.###.#.###.#",
  "#.....#.#...#.#",
  "#.###.#####.#.#",
  "#.#.#.......#.#",
  "#.#.#####.###.#",
  "#...........#.#",
  "###.#.#####.#.#",
  "#...#.....#.#.#",
  "#.#.#.###.#.#.#",
  "#.....#...#.#.#",
  "#.###.#.#.#.#.#",
  "#S..#.....#...#",
  "###############",
].map((line) => line.split(""));

class Reindeer {
  directions: DirectionsMap;
  rotations: RotationsMap;
  start: Coordinate;
  end: Coordinate;
  grid: string[][];
  visited: Set<string> = new Set();
  queue: PriorityQueue<State>;

  constructor(grid: string[][]) {
    this.directions = {
      N: [0, -1], // north
      S: [0, 1],  // south
      W: [-1, 0], // west
      E: [1, 0],  // east
    };
    this.rotations = {
      N: ["W", "E"],
      E: ["N", "S"],
      S: ["E", "W"],
      W: ["S", "N"],
    };
    [this.start, this.end] = this.find_start_end(grid);
    this.grid = grid;
    this.queue = new PriorityQueue<State>((a, b) => a - b); // Min heap
  }

  compute_best_path(): number {
    this.queue.push({ ...this.start, dir: "E", score: 0 }, 0);
    // console.log(JSON.stringify(this.queue));
    while (!this.queue.isEmpty()) {
      const currentState = this.queue.pop();
      // console.log(currentState);
      const { x, y, dir, score } = currentState;
      // console.log("Current position symbol: ", this.grid[y][x])

      // If reached the end, return the score
      if (x === this.end.x && y === this.end.y) return score;

      const stateKey = `${x},${y},${dir}`;
      if (this.visited.has(stateKey)) continue;
      this.visited.add(stateKey);

      // Move forward
      const [dx, dy] = this.directions[dir];
      const [nx, ny] = [x + dx, y + dy];
      if (this.grid[ny][nx] === "." || this.grid[ny][nx] === "E") {
        const new_score = score + 1;
        this.queue.push({ x: nx, y: ny, dir, score: new_score }, new_score);
      }

      // Rotate clockwise and counterclockwise
      for (const newDir of this.rotations[dir]) {
        const new_score = score + 1000;
        this.queue.push({ x, y, dir: newDir, score: new_score }, new_score);
      }
    }
    throw new Error("No path found");
  }

  find_start_end(grid: string[][]): [Coordinate, Coordinate] {
    let start: Coordinate | null = null;
    let end: Coordinate | null = null;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === "S") start = { x, y };
        if (grid[y][x] === "E") end = { x, y };
      }
    }
    if (!start || !end) throw new Error("Invalid grid: missing start or end");
    return [start, end];
  }
}

const reindeer_proto_x1 = new Reindeer(grid);

console.log(reindeer_proto_x1.compute_best_path());
