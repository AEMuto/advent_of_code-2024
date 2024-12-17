import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { downloadInput } from "../utils/download.js";

const PATH = "src/day_16/input.txt";

if (!existsSync(PATH)) await downloadInput(16);
const file = await readFile(PATH, "utf-8");