import { NextResponse } from "next/server";
import { getPlayers, removePlayer, updatePlayer } from "@/lib/presence";
import { safeId } from "@/lib/office";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET() {
 try { return NextResponse.json({ players:await getPlayers() },{ headers }); }
 catch { return NextResponse.json({ error:"Presence temporarily unavailable" },{ status:503,headers }); }
}
export async function POST(req: Request) {
 try {
  const body = await req.json();
  const id = safeId(body?.id);
  if(!id) return NextResponse.json({error:"Invalid session"},{status:400});
  if(body?.leave === true) { await removePlayer(id); return NextResponse.json({ok:true},{headers}); }
  const player = await updatePlayer(id,body.name,body.color,body.x,body.y,body.direction);
  return NextResponse.json({player},{headers});
 } catch { return NextResponse.json({error:"Unable to update presence"},{status:503}); }
}
