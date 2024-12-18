import { rm, writeFile, readFile} from "fs/promises";
import { existsSync, appendFileSync } from "fs";
import { downloadInput } from "../utils/download.js";

if (existsSync("src/day_15/frames.txt")) await rm("src/day_15/frames.txt");
await writeFile("src/day_15/frames.txt", "");

type GridType = string[][];
type Direction = [number, number];
type Coordinates = { x: number; y: number };
type Box = Coordinates & { symbol: string };
type Bracket = Coordinates & { bracket_type: "[" | "]" };
type DirectionSymbol = "^" | "v" | "<" | ">";

const PATH = "src/day_15/input.txt";

if (!existsSync(PATH)) await downloadInput(15);

const file = await readFile(PATH, "utf-8");
const [input1, input2] = file.split("\n\n");

const grid = input1.split("\n").map((row) => row.split(""));
const movements = input2.split("\n").join("").split("") as DirectionSymbol[];

class Robot {
  position: Coordinates;
  movements: DirectionSymbol[];
  grid: GridType;
  moves: number = 0;
  symbol_to_movement: Record<DirectionSymbol, Direction> = {
    "^": [0, -1],
    v: [0, 1],
    "<": [-1, 0],
    ">": [1, 0],
  };
  movement_to_symbol: Record<string, DirectionSymbol> = {
    "0,-1": "^",
    "0,1": "v",
    "-1,0": "<",
    "1,0": ">",
  };

  constructor(movements: DirectionSymbol[], grid: GridType, double_width = false) {
    this.movements = movements;
    this.grid = double_width ? this.double_width(grid) : grid;
    this.position = this.get_start();
  }

  move() {
    this.movements.forEach((move, i) => {
      const { x, y } = this.position;
      const [dx, dy] = this.symbol_to_movement[move];

      const [nx, ny] = [x + dx, y + dy]; // next position

      if (this.grid[ny][nx] === "#") return; // hit a wall, do nothing
      if (this.grid[ny][nx] === "O") this.push_box({ x: nx, y: ny }, [dx, dy]); // push the box
      if (this.grid[ny][nx] === "[" || this.grid[ny][nx] === "]") { // push the long box
        const box_pushed = this.push_longbox({ x: nx, y: ny }, [dx, dy]);
        if (box_pushed) this.draw(`0${i + 1}`, move, "Box pushed successfully.");
      }
      // If there was a box, we have already pushed it, so the robot can move into the empty space
      if (this.grid[ny][nx] === ".") { // free space, move the robot
        this.position = { x: nx, y: ny };
        this.grid[y][x] = "."; // robot leaves its place
        this.grid[ny][nx] = "@"; // robot takes the place of a dot
      }
    });
  }

  /**
   * This method is used to push a box that is adjacent to the robot
   * We use a "flood fill" algorithm to detect the brackets that are part of the box stack to be pushed
   * A box or "[]" is represented as a 2-tuple of LongBox objects which have the coordinates of the brackets and the bracket type ("[" or "]")
   * @param start The coordinates of the detected bracket near the robot (see move method)
   * @param direction The current direction of the robot
   * @returns True if the box was successfully pushed, false otherwise
   */
  push_longbox(
    start: Coordinates, 
    direction: Direction
  ): boolean {
    let { x, y } = start;
    const [dx, dy] = direction;
    const move_symbol = this.movement_to_symbol[`${dx},${dy}`];
    
    const visited: Record<string, Bracket[]> = {};
    const boxes_stack = [this.get_box({ x, y }, this.grid[y][x] as "[" | "]")];

    // 1. We constitute a "stack" of boxes coordinates
    while (boxes_stack.length) {
      const current_box = boxes_stack.pop()!;

      for (const bracket of current_box) {
        const key = `${current_box[0].x},${current_box[0].y}`; // key is the first bracket as determined in get_box
        const { x: cx, y: cy, bracket_type } = bracket;
        if (Object.hasOwn(visited, key) && bracket_type === "[") continue; // Skip if we have already visited this [
        visited[key] = this.get_box({ x: cx, y: cy }, bracket_type);

        let nx, ny;
        // Width is the double of the original grid, but the height is the same
        // so we need to handle vertical and horizontal movements differently
        if (move_symbol === "<" || move_symbol === ">"){ // horizontal movement
          [nx, ny] = [cx + dx, cy]; // can be either a "." or the complementary bracket
          if (this.grid[ny][nx] === ".") break; // we have reached the end of the box stack
          [nx, ny] = [cx + dx * 2, cy]; // We double the horizontal movement, otherwise we enter an infinite loop
        }
        else [nx, ny] = [cx, cy + dy]; // vertical movement

        if (this.grid[ny][nx] === "#") return false;
        if (this.grid[ny][nx] === "[" || this.grid[ny][nx] === "]") {
          boxes_stack.push(this.get_box({ x: nx, y: ny }, this.grid[ny][nx] as "[" | "]"));
        }
      }
    }

    // 2. The actual box pushing, we will swap each brackets individually
    let brackets;
    // sort by x des/asc or y des/asc depending on the direction before moving to the first empty space
    // "<" => sort by x ascending, ">" => sort by x descending, "^" => sort by y ascending, "v" => sort by y descending
    if (move_symbol === "<") {
      brackets = Object.values(structuredClone(visited))
        .flat()
        .sort((a, b) => a.x - b.x);
    }
    if (move_symbol === ">") {
      brackets = Object.values(structuredClone(visited))
        .flat()
        .sort((a, b) => b.x - a.x);
    }
    if (move_symbol === "^") {
      brackets = Object.values(structuredClone(visited))
        .flat()
        .sort((a, b) => a.y - b.y);
    }
    if (move_symbol === "v") {
      brackets = Object.values(structuredClone(visited))
        .flat()
        .sort((a, b) => b.y - a.y);
    }

    for (const bracket of brackets!) { // brackets should be defined
      const { x: cx, y: cy, bracket_type } = bracket;
      const [nx, ny] = [cx + dx, cy + dy];
      this.grid[ny][nx] = bracket_type;
      this.grid[cy][cx] = ".";
    }

    return true;
  }

  /**
   * From a single bracket (either type "[" or "]"), and its coordinates,
   * we can determine the other bracket that is part of the same box.
   * The first element of the returned 2-tuple is always "[" and the second element is always "]"
   * @param position Coordinates of a single bracket (either "[" or "]")
   * @param bracket_type The type of bracket ("[" or "]")
   * @returns A 2-tuple of LongBox objects {x, y, bracket_type} that represent the box
   */
  get_box(
    position: Coordinates, // box position
    bracket_type: "[" | "]",
  ): Bracket[] {
    let { x: cx, y: cy } = position;
    return bracket_type === "["
      ? [
          { x: cx, y: cy, bracket_type: "[" },
          { x: cx + 1, y: cy, bracket_type: "]" },
        ]
      : [
          { x: cx - 1, y: cy, bracket_type: "[" },
          { x: cx, y: cy, bracket_type: "]" },
        ];
  }

  push_box(
    position: Coordinates, // box position
    movement: Direction, // direction to push the box
  ) {
    let { x, y } = position;
    const [dx, dy] = movement;
    const box_stack: Box[] = [{ x, y, symbol: this.grid[y][x] }];

    let [nx, ny] = [x + dx, y + dy];

    while (this.grid[ny][nx] === "O") {
      box_stack.push({ x: nx, y: ny, symbol: this.grid[ny][nx] });
      [x, y] = [nx, ny];
      [nx, ny] = [x + dx, y + dy];
    }

    if (this.grid[ny][nx] === "#") return false; // we have hit a wall

    while (box_stack.length) {
      const { x, y, symbol } = box_stack.pop()!;
      const [nx, ny] = [x + dx, y + dy];
      this.grid[ny][nx] = symbol;
      this.grid[y][x] = ".";
    }
  }

  draw(frame: string, move_symbol: DirectionSymbol, additional?: string) {
    const header = `Frame: ${frame}, Move: ${move_symbol}`;
    const additional_info = additional ? `, ${additional}` : "";
    const grid = this.grid.map((row) => row.join("")).join("\n");
    appendFileSync(`src/day_15/frames.txt`, `${header}${additional_info}\n${grid}\n-----------\n`);
  }

  get_result() {
    const boxes_positions = this.grid.reduce((acc, row, y) => {
      row.forEach((cell, x) => {
        if (cell === "O" || cell === "[") acc.push({ x, y });
      });
      return acc;
    }, [] as Coordinates[]);
    return boxes_positions.reduce((acc, box) => {
      const { x, y } = box;
      const gps = 100 * y + x;
      acc += gps;
      return acc;
    }, 0);
  }

  get_start(): Coordinates {
    return this.grid.reduce((acc, row, y) => {
      const x = row.indexOf("@");
      if (x !== -1) acc = { x, y };
      return acc;
    }, { x: 0, y: 0 });
  }

  double_width(grid:GridType): GridType {
    return grid.map(
      (row) =>
        row
          .map((cell) => {
            if (cell === "#") return ["#", "#"];
            if (cell === "O") return ["[", "]"];
            if (cell === ".") return [".", "."];
            if (cell === "@") return ["@", "."];
          })
          .flat() as string[],
    );
  }

}

const roboto = new Robot(movements, grid, true);
roboto.move();
const result = roboto.get_result();

console.log(`\n####### THE END #######\nResult: ${result}`);

