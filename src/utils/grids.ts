export const isWithinBounds = (x: number, y: number, grid: any[][]) => {
  return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length;
};