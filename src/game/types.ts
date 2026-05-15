export type Point = { x: number; y: number };
export type Pair = { a: Point; b: Point; id: number };
export type Level = { width: number; height: number; pairs: Pair[] };

export type Solution = Point[][];
