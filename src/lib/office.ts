export const COLS = 24;
export const ROWS = 16;
export const SPAWN = { x: 11, y: 12 };
export const COLORS = ["#b79bff", "#f9b881", "#79cdb8", "#f18ca9", "#87bdfa", "#e9d17e"] as const;
export type Player = { id: string; name: string; color: string; x: number; y: number; direction: "up" | "down" | "left" | "right"; lastSeen: number };
export type Furniture = { kind: "desk" | "sofa" | "plant" | "table" | "shelf" | "coffee" | "whiteboard" | "chair"; x: number; y: number; w: number; h: number };
export const furniture: Furniture[] = [
  {kind:"desk",x:3,y:3,w:3,h:2},{kind:"desk",x:9,y:3,w:3,h:2},{kind:"desk",x:15,y:3,w:3,h:2},
  {kind:"desk",x:3,y:8,w:3,h:2},{kind:"desk",x:15,y:8,w:3,h:2},
  {kind:"table",x:9,y:8,w:4,h:3},{kind:"sofa",x:20,y:4,w:2,h:4},
  {kind:"shelf",x:1,y:1,w:3,h:1},{kind:"whiteboard",x:9,y:1,w:5,h:1},
  {kind:"coffee",x:19,y:12,w:2,h:2},
  {kind:"plant",x:1,y:4,w:1,h:1},{kind:"plant",x:22,y:2,w:1,h:1},
  {kind:"plant",x:1,y:13,w:1,h:1},{kind:"plant",x:22,y:13,w:1,h:1},
];
export function canMove(x: number, y: number): boolean {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 1 && x < COLS - 1 && y >= 2 && y < ROWS - 1 &&
    !furniture.some(f => x >= f.x && x < f.x+f.w && y >= f.y && y < f.y+f.h);
}
export function safeName(input: unknown): string {
  return typeof input === "string" ? input.trim().replace(/[<>\u0000-\u001f]/g,"").slice(0,24) || "Guest" : "Guest";
}
export function safeColor(input: unknown): string {
  return typeof input === "string" && (COLORS as readonly string[]).includes(input) ? input : COLORS[0];
}
export function safeId(input: unknown): string | null {
  return typeof input === "string" && /^[0-9a-f-]{36}$/i.test(input) ? input : null;
}
export function safeDirection(input: unknown): Player["direction"] {
  return input === "up" || input === "down" || input === "left" || input === "right" ? input : "down";
}
export const TTL_MS = 25000;
