import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_13/input.txt";
const COST_BUTTON_A = 3;
const COST_BUTTON_B = 1;

if (!existsSync(PATH)) await downloadInput(13);
const file = await readFile(PATH, "utf-8");
const example = "Button A: X+17, Y+86\nButton B: X+84, Y+37\nPrize: X=7870, Y=6450";

function get_input(file: string, correction = 0) {
  return file.split("\n\n").map((line) => {
    const numbers = line.match(/\d+/g)!; // will have 6 numbers trust me bro
    //if (!numbers) return null;
    return {
      button_a: { x: parseInt(numbers[0]), y: parseInt(numbers[1]) },
      button_b: { x: parseInt(numbers[2]), y: parseInt(numbers[3]) },
      prize: { x: parseInt(numbers[4]) + correction, y: parseInt(numbers[5]) + correction },
    };
  });
}

const input_1 = get_input(file);
const input_2 = get_input(file, 10000000000000);
// const input_example = get_input(example);

type Equation = {
  // ax + by = c
  a: number;
  b: number;
  c: number;
};

/**
 * Cramer's rule to solve a linear equations system.
 * This function will return the values of x and y that satisfy the equations system.
 *
 * det = ad - bc
 *
 * det_x = ed - bf
 *
 * det_y = af - ec
 *
 * x = det_x / det
 *
 * y = det_y / det
 *
 * @param equation_a ax + by = e
 * @param equation_b cx + dy = f
 * @returns
 */
function calculate_intersection(
  equation_a: Equation,
  equation_b: Equation,
): { x: number; y: number } | null {
  const det = equation_a.a * equation_b.b - equation_a.b * equation_b.a;
  // console.log(`equation_a: ${JSON.stringify(equation_a)}, equation_b: ${JSON.stringify(equation_b)}`);
  // console.log(`${equation_a.a} * ${equation_b.b} - ${equation_a.b} * ${equation_b.a} = ${det}`);
  if (det === 0) return null;

  const det_x = equation_a.c * equation_b.b - equation_a.b * equation_b.c;
  // console.log(`det_x: ${det_x}`);
  // console.log(`${equation_a.c} * ${equation_b.b} - ${equation_a.b} * ${equation_b.c} = ${det_x}`);
  const det_y = equation_a.a * equation_b.c - equation_a.c * equation_b.a;
  // console.log(`det_y: ${det_y}`);
  // console.log(`${equation_a.a} * ${equation_b.c} - ${equation_a.c} * ${equation_b.a} = ${det_y}`);

  if (det_x % det !== 0 || det_y % det !== 0) return null;

  const x = det_x / det;
  const y = det_y / det;

  return { x, y };
}

function compute_spent_tokens(input: ReturnType<typeof get_input>) {
  return input
    .map(({ button_a, button_b, prize }) => {
      const equation_a: Equation = { a: button_a.x, b: button_b.x, c: prize.x };
      const equation_b: Equation = { a: button_a.y, b: button_b.y, c: prize.y };
      const result = calculate_intersection(equation_a, equation_b);
      if (!result) return null;
      const { x, y } = result; // x is how many times we pressed button_a, y is how many times we pressed button_b
      const cost = x * COST_BUTTON_A + y * COST_BUTTON_B;
      return cost;
    })
    .filter((cost) => cost !== null)
    .reduce((acc, cost) => acc + cost, 0);
}

// const spent_tokens_example = compute_spent_tokens(input_example);

console.time("Time Part 1");
const spent_tokens_1 = compute_spent_tokens(input_1);
console.log(spent_tokens_1);
console.timeEnd("Time Part 1");

console.time("Time Part 2");
const spent_tokens_2 = compute_spent_tokens(input_2);
console.log(spent_tokens_2);
console.timeEnd("Time Part 2");
