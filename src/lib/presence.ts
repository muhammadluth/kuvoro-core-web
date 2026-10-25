import { Pool } from "pg";
import { canMove, safeName, safeColor, safeDirection, SPAWN, TTL_MS, type Player } from "./office";
type Store = { players: Map<string, Player>; pool?: Pool };
const globalStore = globalThis as typeof globalThis & { __kuvoroPresence?: Store };
const store = globalStore.__kuvoroPresence ??= { players: new Map<string, Player>() };
function pool(): Pool | undefined {
  if (!process.env.DATABASE_URL) return undefined;
  if (!store.pool) store.pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return store.pool;
}
export async function getPlayers(): Promise<Player[]> {
  const db = pool();
  if (db) {
    await db.query("DELETE FROM office_presence WHERE last_seen < NOW() - INTERVAL '25 seconds'");
    const result = await db.query("SELECT id,name,color,x,y,direction,extract(epoch from last_seen)*1000 AS \"lastSeen\" FROM office_presence ORDER BY last_seen DESC");
    return result.rows.map(r => ({ ...r, lastSeen: Number(r.lastSeen) })) as Player[];
  }
  const now = Date.now();
  for (const [id, player] of store.players) if(now-player.lastSeen > TTL_MS) store.players.delete(id);
  return [...store.players.values()];
}
export async function updatePlayer(id: string, name: unknown, color: unknown, x: unknown, y: unknown, direction: unknown): Promise<Player> {
  const validX = typeof x === "number" && canMove(x,y as number) ? x : SPAWN.x;
  const validY = typeof y === "number" && canMove(x as number,y) ? y : SPAWN.y;
  const player: Player = { id, name:safeName(name), color:safeColor(color), x:validX, y:validY, direction:safeDirection(direction), lastSeen:Date.now() };
  const db = pool();
  if (db) {
    await db.query(`INSERT INTO office_presence(id,name,color,x,y,direction,last_seen) VALUES($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT(id) DO UPDATE SET name=$2,color=$3,x=$4,y=$5,direction=$6,last_seen=NOW()`,[id,player.name,player.color,player.x,player.y,player.direction]);
  } else store.players.set(id,player);
  return player;
}
export async function removePlayer(id: string): Promise<void> {
  const db = pool();
  if (db) await db.query("DELETE FROM office_presence WHERE id=$1",[id]);
  else store.players.delete(id);
}
