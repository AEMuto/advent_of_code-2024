type Coordinates = { x: number; y: number };
type CardinalPoints = "north" | "east" | "south" | "west";
type Directions = Record<CardinalPoints, Coordinates>;

class Guard {
  private readonly arr_direction: Directions = {
    north: { x: -1, y: 0 },
    east: { x: 0, y: 1 },
    south: { x: 1, y: 0 },
    west: { x: 0, y: -1 },
  };

  start_pos: Coordinates;
  start_map: string[][];
  curr_map: string[][];
  curr_pos: Coordinates;
  curr_direction: CardinalPoints = "north";
  is_looping = false;
  is_out_of_bounds = false;
  visited_states: Set<string> = new Set();

  constructor(map_layout: string[][]) {
    this.start_map = structuredClone(map_layout);
    this.start_pos = this.find_start_position(this.start_map);
    this.curr_map = structuredClone(this.start_map);
    this.curr_pos = structuredClone(this.start_pos);
  }

  change_start_map(new_map: string[][]): void {
    this.start_map = structuredClone(new_map);
    this.reset();
  }

  reset(): void {
    this.curr_map = structuredClone(this.start_map);
    this.curr_pos = structuredClone(this.start_pos);
    this.curr_direction = "north";
    this.is_looping = false;
    this.visited_states.clear();
  }

  private find_start_position(map_layout: string[][]): Coordinates {
    for (let x = 0; x < map_layout.length; x++) {
      const y = map_layout[x].indexOf("^");
      if (y !== -1) return { x, y };
    }
    return { x: 0, y: 0 };
  }

  private next_pos_has_obstacle(): boolean | null {
    const { x, y } = this.get_new_position();
  
    const x_bound = this.curr_map.length;
    const y_bound = this.curr_map[0]?.length ?? 0;
  
    // Ensure x_ahead and y_ahead are within bounds before accessing the map
    if (
      x < 0 ||
      x >= x_bound ||
      y < 0 ||
      y >= y_bound ||
      this.curr_map[x][y] === undefined
    ) {
      return null; // Out of bounds; do nothing
    }
    return this.curr_map[x][y] === "#" || this.curr_map[x][y] === "O"
  }

  private turn_right(): void {
    const directions: CardinalPoints[] = ["north", "east", "south", "west"];
    const currentIndex = directions.indexOf(this.curr_direction);
    this.curr_direction = directions[(currentIndex + 1) % directions.length];
    // console.log("Turning right to: ", this.curr_direction);
  }

  private get_new_position(): Coordinates {
    const { x, y } = this.arr_direction[this.curr_direction];
    return {
      x: this.curr_pos.x + x,
      y: this.curr_pos.y + y,
    };
  }

  move(): void {
    const state = `${this.curr_pos.x},${this.curr_pos.y},${this.curr_direction}`;

    if (this.visited_states.has(state)) {
      this.is_looping = true;
      // console.log("Looping at: ", this.curr_pos);
      return;
    }

    this.visited_states.add(state);
    this.curr_map[this.curr_pos.x][this.curr_pos.y] = "X";

    while(this.next_pos_has_obstacle()) {
      // console.log("Obstacle at: ", this.get_new_position());
      this.turn_right();
    }
    this.curr_pos = this.get_new_position();

    const { x, y } = this.curr_pos;
    this.is_out_of_bounds =
      x < 0 || y < 0 || x >= this.curr_map.length || y >= this.curr_map[0].length;
    // if (this.is_out_of_bounds) console.log("Leaving map at: ", this.curr_pos);
  }
}

export default Guard;
