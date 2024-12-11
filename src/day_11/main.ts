import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_11/input.txt";

if (!existsSync(PATH)) await downloadInput(11);
const file = await readFile(PATH, "utf-8");
const input = file.split(" ").map(x => +x)
// const input = [125, 17];

const process_num = (num: number) => {
  const str = `${num}`;
  if (num === 0) return [1];
  if (str.length % 2 === 0) {
    const middle = Math.floor(str.length / 2);
    const left = str.substring(0, middle);
    const right = str.substring(middle, str.length);
    return [parseInt(left, 10), parseInt(right, 10)];
  }
  return [num * 2024];
};

const blink_interative = (input: number[], depth: number) => {
  let result = structuredClone(input);
  for (let x = 0; x < depth; x++) {
    //console.log(`Iteration ${x}`);
    try {
      const new_arr = result.reduce<number[]>((acc, curr) => {
        acc.push(...process_num(curr));
        return acc;
      }, []);
      result = new_arr;
    } catch (e) {
      console.log(e);
      console.log(`Max x value: ${x}`);
      console.log(input.length);
      break;
    }
  }
  return result;
};

console.time("Part 1 (iterative)");
const result_part1 = blink_interative(input, 25).length;
console.log(`Part 1, Iterative result: ${result_part1}`);
console.timeEnd("Part 1 (iterative)");

const blink_recursive = (num: number, depth: number, elements = 1): number => {
  if (depth === 0) return elements;
  let result: number;

  const str = `${num}`;
  if (num === 0) {
    result = blink_recursive(1, depth - 1, elements);
  } else if (str.length % 2 === 0) {
    const middle = Math.floor(str.length / 2);
    const left = str.substring(0, middle);
    const right = str.substring(middle, str.length);

    elements = blink_recursive(parseInt(left, 10), depth - 1, elements + 1); // Increment before recursive call
    result = blink_recursive(parseInt(right, 10), depth - 1, elements); // Use updated elements
  } else {
    result = blink_recursive(num * 2024, depth - 1, elements);
  }
  return result;
};

console.time("Part 1 (recursive)");
const result_part1_alt = input.reduce((acc, curr) => acc + blink_recursive(curr, 25), 0);
console.log(`Part 1, Recursive result: ${result_part1_alt}`);
console.timeEnd("Part 1 (recursive)");

const blink_part2 = (input: number[], depth: number) => {
  const calc_num = (num: number, depth: number) => {
    // as {depth: {num: count}}
    const stack: Record<number, Record<number, number>> = {};
    for (let x = 0; x < depth; x++) {
      if (x === 0) {
        stack[x] = { [num]: 1 };
      }
      // get next depth
      stack[x + 1] = {};

      for (let key in stack[x]) {

        const count = stack[x][key];
        const curr = parseInt(key, 10);
        const str = `${curr}`;
        // console.log(`Depth: ${x} - Num: ${curr} - Count: ${count}`);

        if (curr === 0) { // 0 -> 1

          Object.hasOwn(stack[x + 1], 1) 
            ? (stack[x + 1][1] += count) 
            : (stack[x + 1][1] = count);

        } else if (str.length % 2 === 0) { // eg. 11 -> 1,1

          const middle = Math.floor(str.length / 2);
          const left = parseInt(str.substring(0, middle), 10);
          const right = parseInt(str.substring(middle, str.length), 10);

          Object.hasOwn(stack[x + 1], left)
            ? (stack[x + 1][left] += count)
            : (stack[x + 1][left] = count);

          Object.hasOwn(stack[x + 1], right)
            ? (stack[x + 1][right] += count)
            : (stack[x + 1][right] = count);

        } else { // eg. 1 -> 2024, 2 -> 4048 etc...
          // console.log(`Curr: ${curr} will be multiplied by 2024`);
          Object.hasOwn(stack[x + 1], curr * 2024)
            ? (stack[x + 1][curr * 2024] += count)
            : (stack[x + 1][curr * 2024] = count);
        }
      }
      // clean old stack to gain memory (probably not needed, but :shrug:)
      delete stack[x];
    }
    return stack;
  };

  return input.reduce((acc, curr) => {
    const result = calc_num(curr, depth);
    const sum = Object.values(result[depth]).reduce((acc, curr) => acc + curr, 0);
    return acc + sum;
  }, 0);
};

console.time("part2");
const result_part2 = blink_part2(input, 75);
console.log(`Part 2, Stack result: ${result_part2}`);
console.timeEnd("part2");
