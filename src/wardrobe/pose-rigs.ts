/** Local art coordinates, BEFORE the pose's existing transforms/animations.
 * Numeric art nodes are private to this adapter: accessories never know about them.
 * A surface is inserted after `after`; sleeves live inside each animated wing.
 */
export interface PoseRig {
  body: { shape: number; after: number; profile?: "side" | "lying" | "back"; hem?: number; followShape?: boolean; sideSleeve?: boolean; shoulder?: number; neck?: number; contour?: "fishing" };
  head: { parent: number | "view"; after: number; hair?: number; x: number; y: number; width: number; height: number; profile?: "side" | "back" };
  sleeves: { node: number; bottom?: boolean }[];
}
const front = (shape: number, after: number, head: number, hair: number, wings: number[], x = 81, y = 5, width = 98): PoseRig => ({
  body: { shape, after }, head: { parent: head, after: hair, hair, x, y, width, height: 32 },
  sleeves: wings.map((node) => ({ node })),
});
const side = (shape: number, after: number, head: number | "view", headAfter: number, fit: Partial<PoseRig["body"]> = {}): PoseRig => ({
  body: { shape, after, profile: "side", ...fit },
  head: { parent: head, after: headAfter, x: 226, y: 55, width: 155, height: 61, profile: "side" },
  sleeves: [],
});
export const poseRigs: Readonly<Record<string, PoseRig>> = {
  idle: front(4, 5, 8, 11, [6, 7], 83, 20, 94),
  default: front(5, 20, 6, 9, [21, 22]),
  running: side(8, 8, 6, 9, { sideSleeve: true }),
  runningCrouched: side(9, 9, 10, 13, { neck: 12 }),
  flying: front(6, 7, 8, 11, [24, 26]),
  dancing: front(10, 11, 14, 16, [28, 30]),
  sleeping: front(6, 7, 10, 13, [8, 9]),
  scared: front(6, 7, 10, 12, [23, 25]),
  crying: front(6, 7, 10, 13, [8, 9]),
  beaten: front(6, 7, 11, 14, [8, 10]),
  angry: front(6, 7, 12, 15, [9, 11]),
  scratching: front(6, 7, 11, 14, [8, 10]),
  waving: { ...front(5, 21, 8, 10, [22]), body: { shape: 5, after: 21, followShape: true }, sleeves: [{ node: 22 }, { node: 24, bottom: true }] },
  shy: front(5, 6, 11, 14, [8, 10]),
  peeking: front(5, 18, 6, 9, [19, 20], 106, 10),
  laughing: front(6, 7, 12, 15, [9, 11]),
  thinking: front(5, 6, 11, 14, [8, 10]),
  eating: front(6, 7, 13, 15, [8, 10]),
  full: front(6, 7, 17, 19, [12, 15], 81, 18),
  fishing: { ...side(11, 11, 13, 16, { shoulder: 25, contour: "fishing" }), sleeves: [{ node: 20 }] },
  turningBack: { body: { shape: 5, after: 5, profile: "back" }, head: { parent: "view", after: 11, hair: 11, x: 81, y: 19, width: 98, height: 38, profile: "back" }, sleeves: [{ node: 6 }, { node: 7 }] },
  deadLying: { body: { shape: 10, after: 11, profile: "lying", hem: 95 }, head: { parent: 12, after: 13, x: 123, y: 90, width: 70, height: 24 }, sleeves: [{ node: 7 }, { node: 9 }] },
  trace: side(3, 3, "view", 3, { sideSleeve: true }),
  cruzeiro: { ...front(4, 13, 15, 15, [14]), body: { shape: 4, after: 13, followShape: true }, head: { parent: 15, after: 20, x: 81, y: 5, width: 98, height: 32 }, sleeves: [{ node: 14 }, { node: 22, bottom: true }] },
  pondering: front(5, 6, 10, 13, [7, 9]),
  happyJump: front(6, 7, 10, 12, [23, 25]),
};
export const undecoratedPoses = ["umbrella", "snowman", "caveirinha"] as const;
