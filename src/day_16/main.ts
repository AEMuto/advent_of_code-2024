import { readFile, writeFile } from "fs/promises";
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
  visited: Record<string, State> = {};
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

  compute_best_path(): {} {
    this.queue.push({ ...this.start, dir: "E", score: 0 }, 0);
    // console.log(JSON.stringify(this.queue));
    while (!this.queue.isEmpty()) {
      const currentState = this.queue.pop();
      // console.log(currentState);
      const { x, y, dir, score } = currentState;
      // console.log("Current position symbol: ", this.grid[y][x])

      // If reached the end, return the score
      if (x === this.end.x && y === this.end.y) {
        const visited = Object.values(this.visited)
        return { ...currentState, visited, visited_size: Object.keys(this.visited).length };
      }

      const stateKey = `${x},${y},${dir}`;
      if (Object.hasOwn(this.visited, stateKey)) continue;
      this.visited[stateKey] = currentState;

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

  compute_paths(visited: { [key: string]: State }, end: Coordinate, best_score: number): Set<string> {
    const best_tiles = new Set<string>();
    const stack: State[] = [];
  
    // Step 1: Start with end state(s)
    for (const key in visited) {
      const state = visited[key];
      if (state.x === end.x && state.y === end.y && state.score === best_score) {
        stack.push(state);
        best_tiles.add(`${state.x},${state.y}`);
      }
    }
  
    // Step 2: Reverse traverse to find all optimal states
    while (stack.length > 0) {
      const current = stack.pop()!;
      const { x, y, dir, score } = current;
  
      // Reverse movements: Check all possible predecessors
      for (const [prevDir, [dx, dy]] of Object.entries(this.directions)) {
        const [prevX, prevY] = [x - dx, y - dy];
        const prevKey = `${prevX},${prevY},${prevDir}`;
        const prevState = visited[prevKey];
  
        // If a previous state exists and has a valid transition
        if (
          prevState &&
          (prevState.score + 1 === score || prevState.score + 1000 === score) // Forward or rotation
        ) {
          const posKey = `${prevX},${prevY}`;
          if (!best_tiles.has(posKey)) {
            best_tiles.add(posKey);
            stack.push(prevState); // Continue backtracking
          }
        }
      }
    }
  
    return best_tiles;
  }

}

const reindeer_proto_x1 = new Reindeer(example);

const result = reindeer_proto_x1.compute_best_path();

await writeFile("src/day_16/output.json", JSON.stringify(result, null, 2));
