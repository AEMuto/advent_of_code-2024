import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_06/input.txt";

if (!existsSync(PATH)) await downloadInput(6);
const input = await readFile(PATH, "utf-8");
const map_layout = input.split("\n").map((x) => x.split(""));

type Coordinates = { x: number; y: number };
type CardinalPoints = "north" | "east" | "south" | "west";
type Directions = Record<CardinalPoints, Coordinates>;

class Guard {
  map_layout: string[][];
  position: Coordinates;
  directions: Directions;
  direction: CardinalPoints;
  round: number;
  constructor(map_layout: string[][]) {
    this.map_layout = map_layout;
    this.position = this.get_start_pos(this.map_layout);
    this.directions = {
      north: { x: -1, y: 0 },
      east: { x: 0, y: 1 },
      south: { x: 1, y: 0 },
      west: { x: 0, y: -1 },
    };
    this.direction = "north";
    this.round = 0;
    console.log(`Start position is: `, this.position);
  }

  get_start_pos(map_layout: string[][]) {
    return (this.position = map_layout.reduce<{ x: number; y: number }>(
      (acc, curr, i) => {
        if (curr.includes("^")) {
          acc["y"] = curr.indexOf("^");
          acc["x"] = i;
        }
        return acc;
      },
      { x: 0, y: 0 },
    ));
  }

  look_ahead() {
    const x_ahead = this.position.x + this.directions[this.direction].x;
    const y_ahead = this.position.y + this.directions[this.direction].y;
    if (
      x_ahead > this.map_layout.length - 1 ||
      x_ahead < 0 ||
      y_ahead < 0 ||
      y_ahead > this.map_layout[0].length - 1
    )
      return;
    console.log("Map ahead char is: ", this.map_layout[x_ahead][y_ahead]);
    console.log("x_ahead is: ", x_ahead);
    console.log("y_ahead is: ", y_ahead);
    if (this.map_layout[x_ahead][y_ahead] === "#") {
      console.log("Obstacle ahead, turning right.");
      this.turn();
      console.log(`New direction: ${this.direction}`);
    } else console.log(this.position);
  }

  turn() {
    switch (this.direction) {
      case "north":
        this.direction = "east";
        break;
      case "east":
        this.direction = "south";
        break;
      case "south":
        this.direction = "west";
        break;
      case "west":
        this.direction = "north";
        break;
      default:
        throw new Error("Impossible Direction");
    }
  }

  move() {
    console.log(`Round N°${this.round}`);
    this.round++;
    // console.table(this.map_layout);
    this.map_layout[this.position.x][this.position.y] = "X";
    this.look_ahead();
    const new_position = {
      x: this.position.x + this.directions[this.direction].x,
      y: this.position.y + this.directions[this.direction].y,
    };
    this.position.x = new_position.x;
    this.position.y = new_position.y;
  }
}

const guard = new Guard(map_layout);

while (
  guard.position.x >= 0 &&
  guard.position.x <= map_layout.length - 1 &&
  guard.position.y >= 0 &&
  guard.position.y <= map_layout[0].length - 1
) {
  guard.move();
}

const result_part1 = guard.map_layout.reduce((acc,curr)=>{
  acc+= curr.filter(char => char === "X").length
  return acc
},0)

console.log(result_part1)
