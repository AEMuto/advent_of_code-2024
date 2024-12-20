import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";
import PriorityQueue from "./PriorityQueue.js";

const PATH = "src/day_16/input.txt";

type Coordinate = { x: number; y: number };
type Direction = "N" | "E" | "S" | "W";
type DirectionsMap = Record<Direction, [number, number]>; // [dx, dy]
type RotationsMap = Record<Direction, [Direction, Direction]>;
type OppositesMap = Record<Direction, Direction>;
type State = Coordinate & { dir: Direction; score: number };

if (!existsSync(PATH)) await downloadInput(16);
const file = await readFile(PATH, "utf-8");
const grid = file.split("\n").map((line) => line.split(""));

const example_small = [
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

const example = [
  "#################",
  "#...#...#...#..E#",
  "#.#.#.#.#.#.#.#.#",
  "#.#.#.#...#...#.#",
  "#.#.#.#.###.#.#.#",
  "#...#.#.#.....#.#",
  "#.#.#.#.#.#####.#",
  "#.#...#.#.#.....#",
  "#.#.#####.#.###.#",
  "#.#.#.......#...#",
  "#.#.###.#####.###",
  "#.#.#...#.....#.#",
  "#.#.#.#####.###.#",
  "#.#.#.........#.#",
  "#.#.#.#########.#",
  "#S#.............#",
  "#################",
].map((line) => line.split(""));

class Reindeer {
  directions: DirectionsMap;
  rotations: RotationsMap;
  opposites: OppositesMap;
  start: Coordinate;
  end: Coordinate;
  grid: string[][];
  visited: Record<string, State> = {};
  state: State;
  queue: PriorityQueue<State>;

  constructor(grid: string[][]) {
    this.directions = {
      N: [0, -1], // north
      S: [0, 1], // south
      W: [-1, 0], // west
      E: [1, 0], // east
    };
    this.rotations = {
      N: ["W", "E"],
      E: ["N", "S"],
      S: ["E", "W"],
      W: ["S", "N"],
    };
    this.opposites = {
      N: "S",
      S: "N",
      E: "W",
      W: "E",
    };
    [this.start, this.end] = this.find_start_end(grid);
    this.grid = grid;
    this.queue = new PriorityQueue<State>((a, b) => a - b); // Min heap
    this.state = { ...this.start, dir: "E", score: 0 };
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
    console.log("Start:", start, "End:", end);
    return [start, end];
  }

  compute_best_path():
    | { score: number; visited: Record<string, { x: number; y: number; scores: number[] }> }
    | undefined {
    this.queue.push({ ...this.start, dir: "E", score: 0 }, 0);
    // console.log(JSON.stringify(this.queue));
    while (!this.queue.isEmpty()) {
      const currentState = this.queue.pop();
      // console.log(currentState);
      const { x, y, dir, score } = currentState;
      // console.log("Current position symbol: ", this.grid[y][x])

      const stateKey = `${x},${y},${dir}`;
      if (Object.hasOwn(this.visited, stateKey)) continue;
      this.visited[stateKey] = currentState;
      this.state = currentState;

      // If reached the end, return the score
      if (x === this.end.x && y === this.end.y) {
        const visited = Object.values(this.visited).reduce<
          Record<string, { x: number; y: number; scores: number[] }>
        >((acc, { x, y, score }) => {
          const key = `${x},${y}`;
          const new_state = { x, y, scores: [score] };
          if (key in acc) acc[key].scores.includes(score) ? null : acc[key].scores.push(score);
          else acc[key] = new_state;
          return acc;
        }, {});
        return { score, visited };
      }

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
    // If no path found
    // reset visited
    this.visited = {};
    this.state = { ...this.start, dir: "E", score: 0 };
    console.error("No path found");
    return;
  }

  compute_paths(
    visited: Record<string, { x: number; y: number; scores: number[] }>,
  ): { best_tiles_length: number; best_tiles: Coordinate[] } | undefined {
    if (Object.keys(this.visited).length === 0) {
      console.error(
        "There are no stored tiles in the 'visited' record. You need to call compute_best_path() method first, before calling compute_paths() method.",
      );
      return;
    }

    const best_tiles = new Set<string>();
    const stack: { x: number; y: number; scores: number[] }[] = [];

    // Step 1: Start with end state(s) (compute_best_path() should have been called first, so the visited record is populated)
    const start_state = { x: this.state.x, y: this.state.y, scores: [this.state.score] };
    stack.push(start_state);
    best_tiles.add(`${this.state.x},${this.state.y}`);

    // Step 2: Reverse traverse to find all optimal tiles
    while (stack.length > 0) {
      const current = stack.pop()!;
      // console.log("\ncurrent", current);
      const { x, y, scores } = current;

      // Reverse movements: Check all possible predecessors
      for (let [_, [dx, dy]] of Object.entries(this.directions)) {
        const [prevX, prevY] = [x + dx, y + dy];
        // prevDir should be the opposite of current direction
        const prevKey = `${prevX},${prevY}`;
        // console.log("prevKey", prevKey);
        const prevState = visited[prevKey];
        // console.log("prevState", prevState);

        // old version
        //! give wrong results, got 631 tiles but its too high
        if (prevState && prevState.scores.some((score) => scores.includes(score + 1))) {
          const posKey = `${prevX},${prevY}`;
          if (!best_tiles.has(posKey)) {
            best_tiles.add(posKey);
            stack.push(prevState); // Continue backtracking
          }
        }
        // new version

      }
    }

    return {
      best_tiles_length: best_tiles.size,
      best_tiles: [...best_tiles].map((tile) => {
        const [x, y] = tile.split(",").map(Number);
        return { x, y };
      }),
    };
  }
}

const reindeer_proto_x1 = new Reindeer(grid);

const result = reindeer_proto_x1.compute_best_path();
await writeFile("src/day_16/compute_best_path-result.json", JSON.stringify(result, null, 2));

if (!result) throw new Error("No path found");
const paths = reindeer_proto_x1.compute_paths(result.visited);
await writeFile("src/day_16/compute_paths-result.json", JSON.stringify(paths, null, 2));
const coordinates = paths?.best_tiles;
// change # to █ and . to " "
let grid_visualization = reindeer_proto_x1.grid.map((row) => row.map<string>((cell) => (cell === "#" ? "█" : " ")));
coordinates?.forEach(({ x, y }) => {
  grid_visualization[y][x] = "•";
});
await writeFile(
  "src/day_16/grid_visualization.txt",
  grid_visualization.map((row) => row.join("")).join("\n"),
);
