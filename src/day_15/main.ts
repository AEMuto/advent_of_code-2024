import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

type GridType = string[][];
type Direction = [number, number];
type Coordinates = { x: number; y: number };
type Box = Coordinates & { symbol: string };
type Bracket = Coordinates & { bracket_type: "[" | "]" };
type DirectionSymbol = "^" | "v" | "<" | ">";

const PATH = "src/day_15/input.txt";
const DIRECTIONS = [
  [0, -1], // up
  [0, 1], // down
  [-1, 0], // left
  [1, 0], // right
];

if (!existsSync(PATH)) await downloadInput(15);

const file = await readFile(PATH, "utf-8");
const [input1, input2] = file.split("\n\n");

const grid = input1.split("\n").map((row) => row.split(""));
const movements = input2.split("") as DirectionSymbol[];

function double_width(grid: GridType): GridType {
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

const example_grid = [
  "########",
  "#..O.O.#",
  "##@.O..#",
  "#...O..#",
  "#.#.O..#",
  "#...O..#",
  "#......#",
  "########",
].map((row) => row.split(""));
const example_robot_movements = "<^^>>>vv<v>>v<<".split("") as DirectionSymbol[];

const example_grid_part2 = [
  "##############",
  "##......##..##",
  "##...[].....##",
  "##....[][]..##",
  "##....@.[]..##",
  "##..........##",
  "##############",
].map((row) => row.split(""));
const example_robot_movements_part2 = "^^".split("") as DirectionSymbol[];
// const example_grid_part2_double = double_width(example_grid_part2);

const big_example_grid = [
  "##########",
  "#..O..O.O#",
  "#......O.#",
  "#.OO..O.O#",
  "#..O@..O.#",
  "#O#..O...#",
  "#O..O..O.#",
  "#.OO.O.OO#",
  "#....O...#",
  "##########",
].map((row) => row.split(""));

const big_example_robot_movements =
  "<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^".split(
    "",
  ) as DirectionSymbol[];

class Robot {
  position: Coordinates;
  movements: DirectionSymbol[];
  grid: GridType;
  rows: number;
  cols: number;

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

  possible_directions: Record<DirectionSymbol, Direction[]> = {
    "^": [this.symbol_to_movement["<"], this.symbol_to_movement[">"], this.symbol_to_movement["^"]], // up => [left, right, up]
    v: [this.symbol_to_movement["<"], this.symbol_to_movement[">"], this.symbol_to_movement["v"]], // down => [left, right, down]
    "<": [this.symbol_to_movement["<"]], // left => [left]
    ">": [this.symbol_to_movement[">"]], // right => [right]
  };

  constructor(start: Coordinates, movements: DirectionSymbol[], grid: GridType) {
    this.position = start;
    this.movements = movements;
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
  }

  move() {
    this.movements.forEach((move, i) => {
      //if (i > 5) return;
      console.log(`\n####### Move: ${i + 1} #######`);
      // console.log(`Current move: ${move}`);
      this.draw(`0${i + 1}_start`);
      const { x, y } = this.position;
      const [dx, dy] = this.symbol_to_movement[move];
      console.log(`"${move}" converted to: ${dx}, ${dy}`);

      const nx = x + dx;
      const ny = y + dy;
      // console.log(`Robot at: ${x}, ${y}, ${this.grid[y][x]}`);
      // console.log(`Moving to: ${nx}, ${ny}, ${this.grid[ny][nx]}`);

      if (this.grid[ny][nx] === "#") {
        // hit a wall, do nothing
        console.log("Hit a wall, do nothing");
        this.draw(`0${i + 1}`);
        return;
      }

      if (this.grid[ny][nx] === "O" || this.grid[ny][nx] === "[" || this.grid[ny][nx] === "]") {
        // hit a box, try to push it
        // console.log("Hit a box, try to push it");
        if (this.grid[ny][nx] === "O") this.push_boxv1({ x: nx, y: ny }, [dx, dy]);
        if (this.grid[ny][nx] === "[" || this.grid[ny][nx] === "]")
          this.push_boxv2({ x: nx, y: ny }, [dx, dy]);
      }

      if (this.grid[ny][nx] === ".") {
        // free space, move the robot
        // console.log("Free space, move the robot");
        this.position = { x: nx, y: ny };
        this.grid[y][x] = "."; // robot leaves its place
        this.grid[ny][nx] = "@"; // robot takes the place of a dot
      }

      this.draw(`0${i + 1}`);
    });
  }

  /**
   * This method is used to push a box that is adjacent to the robot
   * We use a "flood fill" algorithm to detect the brackets that are part of the box stack to be pushed
   * A box or "[]" is represented as a 2-tuple of LongBox objects which have the coordinates of the brackets and the bracket type ("[" or "]")
   * @param start The coordinates of the detected bracket near the robot (see move method)
   * @param direction The current direction of the robot
   * @returns 
   */
  push_boxv2(start: Coordinates, direction: Direction) {
    const visited: Record<string, Bracket[]> = {};
    let { x, y } = start;
    const [dx, dy] = direction;
    const move_symbol = this.movement_to_symbol[`${dx},${dy}`];

    const boxes_stack = [this.get_box({ x, y }, this.grid[y][x] as "[" | "]")];

    while (boxes_stack.length) {
      const current_box = boxes_stack.pop()!;

      for (const bracket of current_box) {
        const key = `${current_box[0].x},${current_box[0].y}`; // key is the first bracket as determined in get_box
        const { x: cx, y: cy, bracket_type } = bracket;
        console.log(`Current cell: ${cx}, ${cy}, ${bracket_type}`);
        if (Object.hasOwn(visited, key)) continue; // Skip if we have already visited this cell
        visited[key] = this.get_box({ x: cx, y: cy }, bracket_type);

        let nx, ny;
        // Width is the double of the original grid, but the height is the same
        if (move_symbol === "<" || move_symbol === ">") [nx, ny] = [cx + dx * 2, cy];
        else [nx, ny] = [cx, cy + dy];

        if (this.grid[ny][nx] === "#")
          return console.log("Box stack cannot be pushed: last box adjacent to a wall");
        if (this.grid[ny][nx] === "[" || this.grid[ny][nx] === "]") {
          boxes_stack.push(this.get_box({ x: nx, y: ny }, this.grid[ny][nx] as "[" | "]"));
        }
      }
    }

    console.log(`Visited: ${JSON.stringify(visited)}`);
    // Implement the actual box pushing (visited will be the next stack that need to be emptied)
    // 1. loop over visited
    // 2. move each box by direction
    // ? Note: we don't loop over visited[key] and update the position of one individual bracket at a time
    // ? because we need to move the entire box at once. Otherwise there would be a problem in horizontal movement
    // ? where there would be a bug
    for (const key in visited) {
      const [{x:x1, y:y1}, {x:x2, y:y2}] = visited[key];
      const [nx1, ny1, nx2, ny2] = [x1, y1 + dy, x2, y2 + dy];
      this.grid[y1][x1] = ".";
      this.grid[y2][x2] = ".";
      this.grid[ny1][nx1] = "[";
      this.grid[ny2][nx2] = "]";
      
      
      
    }
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

  push_boxv1(
    position: Coordinates, // box position
    movement: Direction, // direction to push the box
  ) {
    // console.log(`Pushing box at: ${position.x}, ${position.y}`);
    let { x, y } = position;
    const [dx, dy] = movement;
    const box_stack: Box[] = [{ x, y, symbol: this.grid[y][x] }];

    let nx = x + dx;
    let ny = y + dy;

    while (this.grid[ny][nx] === "O") {
      box_stack.push({ x: nx, y: ny, symbol: this.grid[ny][nx] });
      x = nx;
      y = ny;
      nx = x + dx;
      ny = y + dy;
    }
    // console.log(`Box stack: ${JSON.stringify(box_stack)}`);

    if (this.grid[ny][nx] === "#") {
      // nothing to push
      // console.log("Nothing to push");
      return;
    } // we have hit a wall

    while (box_stack.length) {
      const { x, y, symbol } = box_stack.pop()!;
      // console.log(`Moving box from: ${x}, ${y}`);
      nx = x + dx;
      ny = y + dy;
      this.grid[y][x] = ".";
      this.grid[ny][nx] = symbol;
    }
  }

  async draw(frame: string) {
    const output = this.grid.map((row) => row.join("")).join("\n");
    await writeFile(`src/day_15/frames/frame_${frame}.txt`, output);
  }

  get_result() {
    const boxes_positions = this.grid.reduce((acc, row, y) => {
      row.forEach((cell, x) => {
        if (cell === "O") acc.push({ x, y });
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
}

const roboto_start = example_grid_part2.reduce(
  (acc, row, y) => {
    const x = row.indexOf("@");
    if (x !== -1) acc = { x, y };
    return acc;
  },
  { x: 0, y: 0 },
);

const roboto = new Robot(roboto_start, example_robot_movements_part2, example_grid_part2);
roboto.move();
const result_part1 = roboto.get_result();

console.log(`Result part 1: ${result_part1}`);

// console.log(example_grid_part2_double.map((row) => row.join("")).join("\n"));
