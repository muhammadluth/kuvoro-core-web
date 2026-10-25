import Phaser from "phaser";
import { COLS, ROWS, canMove, furniture, type Player } from "@/lib/office";

const TILE = 40;
type Entry = { sprite: Phaser.GameObjects.Container; x: number; y: number; direction: Player["direction"]; color: string };
type Config = { onMove: (x: number, y: number, direction: Player["direction"]) => void; };
function box(g: Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,color:number,stroke=0){g.fillStyle(color);g.fillRect(x,y,w,h);if(stroke){g.lineStyle(2,stroke);g.strokeRect(x,y,w,h)}}
function text(scene:Phaser.Scene,x:number,y:number,label:string,size=12,color="#776b82"){return scene.add.text(x,y,label,{fontFamily:"monospace",fontSize:size+"px",color,fontStyle:"bold"}).setOrigin(.5).setDepth(4)}
function hex(color:string){return Number.parseInt(color.slice(1),16)}
export class OfficeScene extends Phaser.Scene {
  private configRef:Config;
  private people=new Map<string,Entry>();
  private avatarId="";
  private joined=false;
  private cursors!:Phaser.Types.Input.Keyboard.CursorKeys;
  private lastMove=0;
  private shade=0;
  constructor(configRef:Config){super("office");this.configRef=configRef;}
  preload(){this.load.spritesheet("indoor","/assets/roguelikeIndoor_transparent.png",{frameWidth:17,frameHeight:17,margin:0,spacing:0});}
  create(){
    this.cameras.main.setBackgroundColor("#d7c9bd");
    const g=this.add.graphics().setDepth(0);
    const width=COLS*TILE,height=ROWS*TILE;
    box(g,0,0,width,height,0xdbcbb9);
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const shade=(x+y)%2===0?0xf1e5d6:0xf4e9db;
      box(g,x*TILE,y*TILE,TILE,TILE,shade);
      g.lineStyle(1,0xe5d8c9,.28);g.strokeRect(x*TILE,y*TILE,TILE,TILE);
      if((x*7+y*13)%11===0){box(g,x*TILE+10,y*TILE+26,11,1,0xe5d2bd);}
    }
    // Walls with skirting and framed windows.
    box(g,0,0,width,TILE*2,0xcab3b0);
    box(g,0,0,width,12,0x99849f);box(g,0,TILE*2-12,width,12,0xa98c92);
    for(const x of [2,7,17]){
      box(g,x*TILE,18,TILE*3,47,0x9b879e);box(g,x*TILE+6,24,TILE*3-12,35,0xc8dfe1);
      box(g,x*TILE+12,30,TILE*3-24,23,0xb7d5dc);box(g,x*TILE+TILE*1.5-2,24,4,35,0x9b879e);
    }
    // Colorful mats create recognizable areas without breaking shared collision.
    box(g,TILE*2,TILE*3,TILE*17,TILE*10,0xe9e1dd);
    box(g,TILE*7,TILE*7,TILE*7,TILE*5,0xded0d8);
    box(g,TILE*19,TILE*3,TILE*4,TILE*9,0xdadbd2);
    for(let y=3;y<13;y++)for(let x=2;x<19;x++){g.lineStyle(1,0xffffff,.14);g.strokeRect(x*TILE,y*TILE,TILE,TILE);}
    text(this,TILE*4.5,TILE*2.62,"DESKS   ✦",12);
    text(this,TILE*11,TILE*6.5,"TEAM CORNER",11);
    text(this,TILE*20.8,TILE*2.6,"LOUNGE",11);
    // Furniture anchored to exactly the collision rectangles from office.ts.
    for(const f of furniture){
      const x=f.x*TILE,y=f.y*TILE,w=f.w*TILE,h=f.h*TILE;
      const fg=this.add.graphics().setDepth(y+h+8);
      if(f.kind==="desk"){
        box(fg,x+4,y+9,w-8,h-14,0x986f67);box(fg,x+4,y+5,w-8,h-20,0xc99479,0xa77974);
        box(fg,x+25,y+12,48,33,0x535c75,0xede5db);box(fg,x+29,y+16,40,24,0x7eabb7);
        box(fg,x+28,y+48,38,8,0xede6dc);box(fg,x+w-29,y+45,12,12,0xf5ebdb,0xbc8e93);
        box(fg,x+10,y+h-10,w-20,8,0x866e70);
      }else if(f.kind==="table"){
        box(fg,x+7,y+12,w-14,h-24,0x8b7588);box(fg,x+12,y+6,w-24,h-24,0xcba3a4,0xb58a92);
        box(fg,x+32,y+28,34,26,0x666b84,0xf1dbda);
        box(fg,x+w-46,y+h-48,19,19,0xece5cf,0xb98c91);
      }else if(f.kind==="sofa"){
        box(fg,x+7,y+3,w-14,h-6,0x8e829f);
        box(fg,x+15,y+13,w-30,h/2-18,0xbcaccb,0x9b8caf);
        box(fg,x+15,y+h/2+1,w-30,h/2-16,0xbcaccb,0x9b8caf);
      }else if(f.kind==="plant"){
        box(fg,x+12,y+20,18,17,0xb78c76);
        box(fg,x+9,y+8,22,22,0x638f78);box(fg,x+16,y+2,13,16,0x79aa86);box(fg,x+1,y+15,19,12,0x84ac8a);
      }else if(f.kind==="whiteboard"){
        box(fg,x+3,y+3,w-6,h-8,0x9e8e9b);box(fg,x+9,y+8,w-18,h-20,0xf7f1e5);
        box(fg,x+18,y+14,60,4,0xb5a7b5);box(fg,x+18,y+24,43,4,0xd6b9ad);box(fg,x+100,y+15,15,15,0xa6b8ad);
      }else if(f.kind==="shelf"){
        box(fg,x+3,y+3,w-6,h-8,0x8a798b);
        for(let i=0;i<9;i++)box(fg,x+11+i*11,y+8,7,24,[0xc9b7d4,0xddaa97,0xa1b9ad][i%3]);
      }else if(f.kind==="coffee"){
        box(fg,x+4,y+6,w-8,h-12,0x9d858b);box(fg,x+9,y+11,w-18,h-24,0xcba998);
        box(fg,x+18,y+15,26,28,0x535d67);box(fg,x+47,y+37,12,12,0xf7e8db);
      }
    }
    // Tiny ambient decor / guide markers.
    for(const [x,y] of [[7,13],[13,13],[19,14],[6,6]]){const gg=this.add.graphics().setDepth(3);gg.fillStyle(0xffffff,.48);gg.fillCircle(x*TILE+8,y*TILE+6,3);}
    const hint=this.add.text(width/2,height-38,"W A S D  /  ↑ ↓ ← →    ·    EXPLORE YOUR OFFICE",{fontFamily:"monospace",fontSize:"11px",fontStyle:"bold",color:"#9f898c"}).setOrigin(.5).setDepth(5);
    hint.setAlpha(.8);
    this.cursors=this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on("keydown", (e:KeyboardEvent)=>{
      if(e.repeat)return;const tag=(document.activeElement as HTMLElement | null)?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA")return;
      const map:Record<string,[number,number,Player["direction"]] >={
        ArrowUp:[0,-1,"up"],KeyW:[0,-1,"up"],ArrowDown:[0,1,"down"],KeyS:[0,1,"down"],
        ArrowLeft:[-1,0,"left"],KeyA:[-1,0,"left"],ArrowRight:[1,0,"right"],KeyD:[1,0,"right"],
      };
      const next=map[e.code];if(next){e.preventDefault();this.move(next[0],next[1],next[2]);}
    });
    // Display inviting scene even before guest entry.
    this.add.text(width/2,height-78,"WELCOME TO KUVORO",{fontFamily:"monospace",fontSize:"14px",color:"#977fa1",fontStyle:"bold"}).setOrigin(.5).setDepth(4);
  }
  private makeAvatar(p:Player):Entry{
    const c=this.add.container(p.x*TILE+TILE/2,p.y*TILE+TILE/2).setDepth(p.y*TILE+TILE+9);
    const s=this.add.graphics();
    box(s,-10,-4,20,15,hex(p.color),0x6c6276);
    box(s,-12,6,24,8,hex(p.color));
    box(s,-8,-21,16,16,0xe9bc9e);box(s,-10,-24,20,7,0x4a404f);
    box(s,-11,-18,4,13,0x4a404f);box(s,7,-18,4,13,0x4a404f);
    box(s,-5,-14,2,2,0x3a3340);box(s,4,-14,2,2,0x3a3340);
    box(s,-9,14,7,6,0x5f536c);box(s,2,14,7,6,0x5f536c);
    const label=this.add.text(0,-37,p.name,{fontFamily:"monospace",fontSize:"11px",fontStyle:"bold",color:"#494259",backgroundColor:"#fffaf1",padding:{left:6,right:6,top:3,bottom:3}}).setOrigin(.5);
    const shadow=this.add.ellipse(0,17,23,7,0x574d62,.22);
    c.add([shadow,s,label]);label.setDepth(2);this.people.set(p.id,{sprite:c,x:p.x,y:p.y,direction:p.direction,color:p.color});
    return this.people.get(p.id)!;
  }
  setSession(id:string){this.avatarId=id;this.joined=Boolean(id);}
  sync(p:Player[]){
    const existing=new Set<string>();
    for(const item of p){
      existing.add(item.id);
      let cur=this.people.get(item.id);
      if(!cur)cur=this.makeAvatar(item);
      const changed=cur.x!==item.x || cur.y!==item.y;
      if(changed){
        this.tweens.killTweensOf(cur.sprite);
        this.tweens.add({targets:cur.sprite,x:item.x*TILE+TILE/2,y:item.y*TILE+TILE/2,duration:180,ease:"Sine.Out",
          onUpdate:()=>{cur!.sprite.setDepth(cur!.sprite.y+TILE/2+9);}});
        cur.x=item.x;cur.y=item.y;
      }
    }
    for(const [id,p] of this.people){if(!existing.has(id)){p.sprite.destroy();this.people.delete(id);}}
  }
  local(id:string,name:string,color:string,x:number,y:number,direction:Player["direction"]){
    this.setSession(id);if(!id){this.sync([]);return;}
    const current=this.people.get(id);
    if(!current || current.color!==color) {
      if(current){current.sprite.destroy();this.people.delete(id);}
      this.makeAvatar({id,name,color,x,y,direction,lastSeen:Date.now()});
    }
    const avatar=this.people.get(id)!;
    if(avatar.x!==x||avatar.y!==y){
      this.tweens.killTweensOf(avatar.sprite);
      this.tweens.add({targets:avatar.sprite,x:x*TILE+TILE/2,y:y*TILE+TILE/2,duration:160,ease:"Sine.Out"});
      avatar.x=x;avatar.y=y;avatar.direction=direction;
    }
  }
  move(dx:number,dy:number,direction?:Player["direction"]){
    if(!this.joined)return;
    const current=this.people.get(this.avatarId);
    if(!current)return;
    const nextX=current.x+dx,nextY=current.y+dy;
    if(!canMove(nextX,nextY))return;
    const dir=direction??(dx>0?"right":dx<0?"left":dy<0?"up":"down");
    this.local(this.avatarId,"",current.color,nextX,nextY,dir);
    this.configRef.onMove(nextX,nextY,dir);
  }
}
export function mountOffice(element:HTMLElement,onMove:Config["onMove"]){
  const scene=new OfficeScene({onMove});
  const game=new Phaser.Game({type:Phaser.AUTO,parent:element,width:COLS*TILE,height:ROWS*TILE,backgroundColor:"#eee0d2",pixelArt:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:false},scene:[scene],fps:{target:60}});
  return {game,scene};
}
