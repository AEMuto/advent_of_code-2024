import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_10/input.txt";

if (!existsSync(PATH)) await downloadInput(10);
const file = await readFile(PATH, "utf-8");