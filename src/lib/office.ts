export const COLS = 30;
export const ROWS = 20;
export const SPAWN = { x: 15, y: 15 };
export const COLORS = ["#b79bff", "#f9b881", "#79cdb8", "#f18ca9", "#87bdfa", "#e9d17e"] as const;
export type Player = { id: string; name: string; color: string; x: number; y: number; direction: "up" | "down" | "left" | "right"; lastSeen: number };
export type Furniture = { kind: "desk"|"sofa"|"plant"|"table"|"shelf"|"coffee"|"whiteboard"|"chair"; x:number;y:number;w:number;h:number };
export const furniture: Furniture[] = [
 {kind:"table",x:2,y:7,w:4,h:3}, {kind:"sofa",x:14,y:7,w:3,h:2},
 {kind:"desk",x:22,y:11,w:3,h:2}, {kind:"coffee",x:11,y:14,w:2,h:2},
 {kind:"plant",x:4,y:3,w:2,h:2}, {kind:"plant",x:20,y:3,w:2,h:2},
 {kind:"plant",x:25,y:5,w:2,h:3}, {kind:"plant",x:23,y:16,w:2,h:2},
 {kind:"shelf",x:26,y:14,w:2,h:3}
];
export function isWater(x:number,y:number):boolean {
 return ((x>=6 && x<=24 && y>=5 && y<=6) || (x>=6 && x<=7 && y>=5 && y<=15) || (x>=23 && x<=25 && y>=12 && y<=19));
}
export function isBridge(x:number,y:number):boolean {
 return (x>=13 && x<=15 && y>=5 && y<=6) || (x>=6 && x<=7 && y>=10 && y<=11) || (x>=23 && x<=25 && y>=14 && y<=15);
}
export function canMove(x:number,y:number):boolean {
 return Number.isInteger(x)&&Number.isInteger(y)&&x>=1&&x<COLS-1&&y>=1&&y<ROWS-1
 &&(!isWater(x,y)||isBridge(x,y))
 &&!furniture.some(f=>x>=f.x&&x<f.x+f.w&&y>=f.y&&y<f.y+f.h);
}
export function safeName(input:unknown):string{return typeof input==="string"?input.trim().replace(/[<>\\u0000-\\u001f]/g,"").slice(0,24)||"Guest":"Guest";}
export function safeColor(input:unknown):string{return typeof input==="string"&&(COLORS as readonly string[]).includes(input)?input:COLORS[0];}
export function safeId(input:unknown):string|null{return typeof input==="string"&&/^[0-9a-f-]{36}$/i.test(input)?input:null;}
export function safeDirection(input:unknown):Player["direction"]{return input==="up"||input==="down"||input==="left"||input==="right"?input:"down";}
export const TTL_MS=25000;
