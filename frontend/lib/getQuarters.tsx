"use client";
export const getQuarters = (quarters: string[], indices: number[]) => {
  switch (indices.length) {
    case 0:
      return [];
    case 1:
      return [quarters[indices[0]]];
    default:
      return quarters.slice(indices[0], indices[1] + 1);
  }
};
