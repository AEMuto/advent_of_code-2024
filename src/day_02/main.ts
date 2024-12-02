import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_02/input.txt";

if (!existsSync(PATH)) await downloadInput(2);

const input = await readFile(PATH, "utf-8");
const lines = input.trim().split("\n");
const reports = lines.map((line) => line.split(" ").map((x) => parseInt(x)));

const reportIsSafe = (report: number[]) => {
  const count = report.reduce<number[]>((acc, curr, i, arr) => {
    if (i < arr.length - 1) acc.push(curr - arr[i + 1]);
    return acc;
  }, [] as number[]);
  return (
    count.every((x) => x > 0 && x <= 3) || count.every((x) => x < 0 && x >= -3)
  );
};

// Part 1
let safe_reports = 0;
reports.forEach((report) => {
  if (reportIsSafe(report)) safe_reports++;
  // Part 2 - The problem dampener
  else {
    // The count is unsafe, but thx to the problem dampener we can remove one 'faulty' element and retry
    // But we don't know which one is faulty, so we need to remove one number of each report,
    // then check if it's safe
    for (let i = 0; i < report.length; i++) {
      const new_report = report.filter((_, index) => index !== i);
      if (reportIsSafe(new_report)) {
        safe_reports++;
        break;
      }
    }
  }
});

console.log("Safe Reports: ", safe_reports);
