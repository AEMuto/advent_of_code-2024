export const isWithinBounds = (x: number, y: number, grid: any[][]) => {
  return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length;
};

const isPropValuesEqual = <T>(subject: T, target: T, propNames: (keyof T)[]): boolean =>
  propNames.every((propName) => subject[propName] === target[propName]);

export const getUniqueItemsByProperties = <T>(items: T[], propNames: (keyof T)[]): T[] =>
  items.filter(
    (item, index, array) =>
      index === array.findIndex((foundItem) => isPropValuesEqual(foundItem, item, propNames)),
  );
