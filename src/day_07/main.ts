import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_07/input.txt";

if (!existsSync(PATH)) await downloadInput(7);

const input = await readFile(PATH, "utf-8");
const equations = input.split("\n").map(line => line.split(": ").map(x => x.split(" ").flatMap(Number)));

const example = [
"190: 10 19",
"3267: 81 40 27",
"83: 17 5",
"156: 15 6",
"7290: 6 8 6 15",
"161011: 16 10 13",
"192: 17 8 14",
"21037: 9 7 18 13",
"292: 11 6 16 20",
].map(line => line.split(": ").map(x => x.split(" ").flatMap(Number)));

console.log("Position 0: ", equations[0]);

// const result_part1 = equations.reduce((acc, curr) => {
//   const [value, sequence] = curr;
//   const max_combinations = Math.pow(2, sequence.length - 1);
//   for (let i = 0; i < max_combinations; i++) {
//     const sum = sequence.reduce((acc, curr, index) => {
//       if (index === 0) return curr;
//       const is_addition = i & (1 << (index - 1));
//       return is_addition ? acc + curr : acc * curr;
//     }, 0);
//     if (sum === value[0]) {
//       acc+=value[0];
//       break;
//     }
//   }
//   return acc;
// }, 0);

// console.log("Result Part 1: ", result_part1);


function generateOperatorCombinations(length: number): string[][] {
  const combinations: string[][] = [];
  const totalCombinations = Math.pow(3, length);
  
  for (let i = 0; i < totalCombinations; i++) {
      const combination: string[] = [];
      let num = i;
      
      for (let j = 0; j < length; j++) {
          // Extract 2 bits at a time using bitwise
          const operatorCode = num % 3;  // Use modulo 3 instead of bits
          
          switch(operatorCode) {
              case 0: combination.push('+'); break;
              case 1: combination.push('*'); break;
              case 2: combination.push('||'); break;
          }
          
          num = Math.floor(num / 3);
      }
      combinations.push(combination);
  }
  
  return combinations;
}

const result_part1 = equations.reduce((acc, curr, i) => {
  const [value, sequence] = curr;
  const operatorCombinations = generateOperatorCombinations(sequence.length - 1);
  // if (i === 0) console.log("Operator Combinations: ", operatorCombinations);
  for (const operators of operatorCombinations) {
    const sum = sequence.reduce((acc, curr, index) => {
      if (index === 0) return curr;
      const operator = operators[index - 1];
      if (operator === '+') return acc + curr;
      if (operator === '*') return acc * curr;
      if (operator === '||') return +`${acc}${curr}`;
      return acc;
    }, 0);
    
    if (sum === value[0]) {
      acc += value[0];
      break;
    }
  }
  return acc;
}, 0);

console.log("Result Part 1: ", result_part1);