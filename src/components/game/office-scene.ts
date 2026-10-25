import Phaser from "phaser";
import {COLS,ROWS,canMove,isWater,furniture,type Player} from "@/lib/office";
const TILE=40;
type Direction=Player["direction"];
type Entry={sprite:Phaser.GameObjects.Container;x:number;y:number;color:string;direction:Direction};
const tint=(s:string)=>Number.parseInt(s.slice(1),16);
const INDEX_COLS=56;
const frame=(x:number,y:number)=>y*INDEX_COLS+x;
export class OfficeScene extends Phaser.Scene{
 private people=new Map<string,Entry>();
 private avatarId="";
 private onWalk:(x:number,y:number,d:Direction)=>void;
 constructor(onWalk:(x:number,y:number,d:Direction)=>void){super("office");this.onWalk=onWalk;}
 preload(){
  this.load.spritesheet("outdoor","/assets/roguelikeOutdoor-original.png",{frameWidth:17,frameHeight:17});
  this.load.spritesheet("indoor","/assets/roguelikeIndoor-atlas.png",{frameWidth:16,frameHeight:16});
  this.load.spritesheet("chars","/assets/roguelikeChar-atlas.png",{frameWidth:16,frameHeight:16});
 }
 create(){
  const W=COLS*TILE,H=ROWS*TILE;
  this.cameras.main.setBackgroundColor("#588e3d");
  const ground=this.add.graphics().setDepth(0);
  const grass=[0x5a913c,0x609741,0x59913d,0x568b39,0x60913d];
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
   ground.fillStyle(grass[(x*7+y*3)%grass.length]);
   ground.fillRect(x*TILE,y*TILE,TILE,TILE);
   if((x*13+y*17)%9===0){ground.fillStyle(0x477b35,.8);ground.fillRect(x*TILE+8,y*TILE+29,5,2);ground.fillRect(x*TILE+12,y*TILE+26,2,3);}
  }
  // The water network forms two winding streams; only bridges are walkable.
  const water=this.add.graphics().setDepth(.5);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(isWater(x,y)){
   water.fillStyle(((x+y)%3===0)?0x699cf0:0x73a6f5);water.fillRect(x*TILE,y*TILE,TILE,TILE);
   water.fillStyle(0xa3c8ff,.6);
   if((x*5+y*3)%4===0)water.fillRect(x*TILE+9,y*TILE+15,16,2);
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    if(!isWater(x+dx,y+dy)){water.fillStyle(0x82b953);if(dx===1)water.fillRect(x*TILE+35,y*TILE,5,TILE);if(dx===-1)water.fillRect(x*TILE,y*TILE,5,TILE);if(dy===1)water.fillRect(x*TILE,y*TILE+35,TILE,5);if(dy===-1)water.fillRect(x*TILE,y*TILE,TILE,5);}
   }
  }
  // Outdoors vegetation from the reusable Kenney CC0 RPG atlas.
  const outdoor=(fx:number,fy:number,x:number,y:number,scale=2.5,depth?:number)=>{
   return this.add.image(x*TILE,y*TILE,"outdoor",frame(fx,fy)).setOrigin(0).setScale(scale).setDepth(depth??y*TILE+26);
  };
  const indoor=(id:number,x:number,y:number,depth?:number)=>this.add.image(x*TILE,y*TILE,"indoor",id).setOrigin(0).setScale(2.5).setDepth(depth??y*TILE+30);
  // Shoreline bridges, built of alternating hardwood planks.
  for(const [sx,sy,w,h] of [[13,5,3,2],[6,10,2,2],[23,14,3,2]]) {
   for(let x=0;x<w;x++)for(let y=0;y<h;y++){
    indoor((x+y)%2===0?104:105,sx+x,sy+y,390);
   }
   const rail=this.add.graphics().setDepth(393);
   rail.lineStyle(4,0x75472e,.95);
   rail.strokeRect(sx*TILE+2,sy*TILE+2,w*TILE-4,h*TILE-4);
  }
  // Trees, canopies, hedges and island vegetation.
  for(const [x,y] of [[2,2],[10,2],[19,2],[26,2],[3,13],[19,16],[27,17],[10,17],[22,9]]){
   outdoor(18,10,x,y,2.5,(y+2)*TILE+9);
   outdoor(18,9,x,y-1,2.5,(y+2)*TILE+10);
  }
  for(const [x,y] of [[0,3],[1,17],[8,3],[17,4],[27,10],[11,18],[21,18],[25,8]]){
   outdoor(21,10,x,y,2.5,y*TILE+40);
  }
  // Gather-inspired social garden zones rendered with real furniture tiles.
  for(const f of furniture){
   const depth=(f.y+f.h)*TILE+12;
   const stamp=(id:number,x:number,y:number)=>indoor(id,x,y,depth);
   if(f.kind==="table"){
    for(let x=0;x<f.w;x++)for(let y=0;y<f.h;y++)
      stamp(y===0? (x===0?243:x===f.w-1?245:244):(x===0?270:x===f.w-1?272:271),f.x+x,f.y+y);
    stamp(329,f.x+1,f.y+1);
   } else if(f.kind==="desk"){
    for(let x=0;x<f.w;x++)for(let y=0;y<f.h;y++)stamp(x===0?250:x===f.w-1?252:251,f.x+x,f.y+y);
   } else if(f.kind==="sofa"){
    for(let x=0;x<f.w;x++)for(let y=0;y<f.h;y++)stamp(x===0?313:x===f.w-1?315:314,f.x+x,f.y+y);
   } else if(f.kind==="plant"){
    outdoor(18,9,f.x,f.y,4,depth);
   } else if(f.kind==="coffee"){
    stamp(329,f.x,f.y);stamp(356,f.x+1,f.y+1);
   } else if(f.kind==="shelf"){
    for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)stamp(478+x,f.x+x,f.y+y);
   }
  }
  // Decorations populate the space without adding artificial collision.
  for(const [x,y] of [[4,16],[12,4],[18,11],[28,6],[2,5],[13,17],[25,3]])outdoor(25,9,x,y,1.8,y*TILE+12);
  for(const [x,y] of [[9,8],[17,15],[24,18],[3,4],[20,8],[28,12]])outdoor(2,6,x,y,2.2,y*TILE+7);
  const label=(x:number,y:number,value:string)=>{
   this.add.text(x*TILE,y*TILE,value,{fontFamily:"monospace",fontSize:"13px",fontStyle:"bold",color:"#fff7d8",backgroundColor:"#365f338c",padding:{left:7,right:7,top:4,bottom:4}}).setDepth(9000);
  };
  label(2,6,"PICNIC & FOCUS");
  label(13,10,"CAMPFIRE HUB");
  label(23,10,"WORK DECK");
  this.anims.create({key:"walking",frames:this.anims.generateFrameNumbers("chars",{frames:[0,1,2]}),frameRate:8,repeat:-1});
  this.input.keyboard?.on("keydown",(e:KeyboardEvent)=>{
   if(e.repeat)return;
   const tag=(document.activeElement as HTMLElement|null)?.tagName;
   if(tag==="INPUT"||tag==="TEXTAREA")return;
   const map:Record<string,[number,number,Direction]>={KeyW:[0,-1,"up"],ArrowUp:[0,-1,"up"],KeyS:[0,1,"down"],ArrowDown:[0,1,"down"],KeyA:[-1,0,"left"],ArrowLeft:[-1,0,"left"],KeyD:[1,0,"right"],ArrowRight:[1,0,"right"]};
   const direction=map[e.code];if(direction){e.preventDefault();this.move(...direction);}
  });
  this.cameras.main.setBounds(0,0,W,H);
 }
 private createPlayer(p:Player):Entry{
  const group=this.add.container((p.x+.5)*TILE,(p.y+.5)*TILE).setDepth((p.y+1)*TILE+20);
  const shadow=this.add.ellipse(0,13,24,6,0x293c26,.35);
  const character=this.add.sprite(0,-5,"chars",0).setScale(2.3).setTint(tint(p.color));
  const label=this.add.text(0,-36,p.name,{fontFamily:"monospace",fontSize:"11px",fontStyle:"bold",color:"#3f3551",backgroundColor:"#fff8eb",padding:{left:6,right:6,top:3,bottom:3}}).setOrigin(.5);
  group.add([shadow,character,label]);
  const entry={sprite:group,x:p.x,y:p.y,color:p.color,direction:p.direction};
  this.people.set(p.id,entry);return entry;
 }
 private animate(player:Entry,x:number,y:number,direction:Direction){
  if(player.x===x&&player.y===y){player.direction=direction;return;}
  const sprite=player.sprite.list.find(c=>c instanceof Phaser.GameObjects.Sprite) as Phaser.GameObjects.Sprite|undefined;
  this.tweens.killTweensOf(player.sprite);
  sprite?.play("walking");
  if(sprite)sprite.setFlipX(direction==="left");
  this.tweens.add({targets:player.sprite,x:(x+.5)*TILE,y:(y+.5)*TILE,duration:180,ease:"Sine.Out",
   onUpdate:()=>player.sprite.setDepth(player.sprite.y+TILE/2+20),onComplete:()=>{sprite?.stop();sprite?.setFrame(0);}});
  player.x=x;player.y=y;player.direction=direction;
 }
 setSession(id:string){this.avatarId=id;}
 sync(players:Player[]){
  const active=new Set(players.map(p=>p.id));
  for(const p of players){
   let current=this.people.get(p.id);
   if(!current)current=this.createPlayer(p);
   this.animate(current,p.x,p.y,p.direction);
  }
  for(const [id,p] of this.people)if(!active.has(id)&&id!==this.avatarId){p.sprite.destroy();this.people.delete(id);}
 }
 local(id:string,name:string,color:string,x:number,y:number,direction:Direction){
  this.avatarId=id;
  if(!id){for(const p of this.people.values())p.sprite.destroy();this.people.clear();return;}
  let current=this.people.get(id);
  if(!current||current.color!==color){if(current)current.sprite.destroy();current=this.createPlayer({id,name,color,x,y,direction,lastSeen:Date.now()});}
  this.animate(current,x,y,direction);
 }
 move(dx:number,dy:number,d?:Direction){
  if(!this.avatarId)return;
  const current=this.people.get(this.avatarId);if(!current)return;
  const x=current.x+dx,y=current.y+dy;
  if(!canMove(x,y))return;
  const direction=d??(dx>0?"right":dx<0?"left":dy<0?"up":"down");
  this.animate(current,x,y,direction);this.onWalk(x,y,direction);
 }
}
export function mountOffice(element:HTMLElement,onMove:(x:number,y:number,d:Direction)=>void){
 const scene=new OfficeScene(onMove);
 const game=new Phaser.Game({type:Phaser.AUTO,parent:element,width:COLS*TILE,height:ROWS*TILE,pixelArt:true,
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[scene],render:{antialias:false}});
 return {game,scene};
}
