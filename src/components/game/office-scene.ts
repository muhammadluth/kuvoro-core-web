import Phaser from "phaser";
import {COLS,ROWS,canMove,furniture,type Player} from "@/lib/office";
const TILE=40;
type Entry={sprite:Phaser.GameObjects.Container;x:number;y:number;color:string};
type Direction=Player["direction"];
const tint=(s:string)=>parseInt(s.slice(1),16);
export class OfficeScene extends Phaser.Scene{
  private people=new Map<string,Entry>();
  private avatarId="";
  private onWalk:(x:number,y:number,d:Direction)=>void;
  constructor(onWalk:(x:number,y:number,d:Direction)=>void){super("office");this.onWalk=onWalk;}
  preload(){
    this.load.spritesheet("indoor","/assets/roguelikeIndoor-atlas.png",{frameWidth:16,frameHeight:16});
    this.load.spritesheet("chars","/assets/roguelikeChar-atlas.png",{frameWidth:16,frameHeight:16});
  }
  create(){
    const W=COLS*TILE,H=ROWS*TILE;
    this.cameras.main.setBackgroundColor("#d1b9a0");
    const tile=(frame:number,x:number,y:number,depth=0)=>this.add.image(x*TILE,y*TILE,"indoor",frame).setOrigin(0).setScale(2.5).setDepth(depth);
    const graphics=this.add.graphics().setDepth(-1);
    graphics.fillStyle(0xf0e3d5);graphics.fillRect(0,0,W,H);
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)
      tile(y<2? (x%2?294:293):((x+y)%6===0?296:293),x,y,0);
    for(let x=0;x<COLS;x++)tile(334,x,0,1);
    for(const [x,y,title] of [[5,2,"WORK ZONE"],[11,6,"TEAM CORNER"],[20,2,"LOUNGE"]] as const)
      this.add.text(x*TILE,y*TILE,title,{fontSize:"12px",fontFamily:"monospace",fontStyle:"bold",color:"#755c60"}).setDepth(3);
    const mat=this.add.graphics().setDepth(.4);
    mat.fillStyle(0xc5b4c2,.6);mat.fillRect(8*TILE,7*TILE,6*TILE,5*TILE);
    mat.fillStyle(0xb4c2a9,.5);mat.fillRect(19*TILE,3*TILE,4*TILE,9*TILE);
    for(const f of furniture){
      const depth=(f.y+f.h)*TILE+1;
      const stamp=(id:number,x:number,y:number)=>tile(id,x,y,depth);
      if(f.kind==="desk"||f.kind==="table"){
        const ids=f.kind==="desk"?[243,244,245,270,271,272]:[250,251,252,277,278,279];
        for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)stamp(ids[(y%2)*3+(x===0?0:x===f.w-1?2:1)],f.x+x,f.y+y);
        if(f.kind==="desk")stamp(299,f.x+1,f.y);
      }else if(f.kind==="sofa"){
        for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)stamp(x===0?313:314,f.x+x,f.y+y);
      }else if(f.kind==="plant")stamp(16,f.x,f.y);
      else if(f.kind==="shelf")for(let x=0;x<f.w;x++)stamp([478,479,480][x%3],f.x+x,f.y);
      else if(f.kind==="whiteboard")for(let x=0;x<f.w;x++)stamp(x===0?343:x===f.w-1?345:344,f.x+x,f.y);
      else if(f.kind==="coffee")for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)stamp(y===0?329:356,f.x+x,f.y+y);
    }
    this.anims.create({key:"walking",frames:this.anims.generateFrameNumbers("chars",{frames:[0,1,2]}),frameRate:7,repeat:-1});
    this.add.text(W/2,H-32,"W A S D  /  ↑ ↓ ← →  ·  EXPLORE",{fontSize:"11px",fontFamily:"monospace",color:"#927785"}).setOrigin(.5).setDepth(5);
    this.input.keyboard?.on("keydown",(e:KeyboardEvent)=>{
      if(e.repeat)return;
      const tag=(document.activeElement as HTMLElement|null)?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA")return;
      const m:Record<string,[number,number,Direction]>={KeyW:[0,-1,"up"],ArrowUp:[0,-1,"up"],KeyS:[0,1,"down"],ArrowDown:[0,1,"down"],KeyA:[-1,0,"left"],ArrowLeft:[-1,0,"left"],KeyD:[1,0,"right"],ArrowRight:[1,0,"right"]};
      const dir=m[e.code];if(dir){e.preventDefault();this.move(...dir);}
    });
    this.cameras.main.setBounds(0,0,W,H);
  }
  private createPlayer(p:Player):Entry{
    const group=this.add.container((p.x+.5)*TILE,(p.y+.5)*TILE).setDepth((p.y+1)*TILE+10);
    const shadow=this.add.ellipse(0,13,24,6,0x2e263d,.24);
    const sprite=this.add.sprite(0,-5,"chars",0).setScale(2.35).setTint(tint(p.color));
    const label=this.add.text(0,-36,p.name,{fontSize:"11px",fontFamily:"monospace",fontStyle:"bold",color:"#433c56",backgroundColor:"#fff8ee",padding:{x:6,y:3}}).setOrigin(.5);
    group.add([shadow,sprite,label]);
    const player={sprite:group,x:p.x,y:p.y,color:p.color};
    this.people.set(p.id,player);return player;
  }
  private animate(p:Entry,x:number,y:number){
    if(p.x===x&&p.y===y)return;
    const sprite=p.sprite.list.find(c=>c instanceof Phaser.GameObjects.Sprite) as Phaser.GameObjects.Sprite|undefined;
    this.tweens.killTweensOf(p.sprite);
    sprite?.play("walking");
    this.tweens.add({targets:p.sprite,x:(x+.5)*TILE,y:(y+.5)*TILE,duration:190,ease:"Sine.Out",
      onUpdate:()=>p.sprite.setDepth(p.sprite.y+TILE/2+10),onComplete:()=>{sprite?.stop();sprite?.setFrame(0);}});
    p.x=x;p.y=y;
  }
  setSession(id:string){this.avatarId=id;}
  sync(people:Player[]){
    const active=new Set(people.map(x=>x.id));
    for(const p of people){
      const existing=this.people.get(p.id)??this.createPlayer(p);
      this.animate(existing,p.x,p.y);
    }
    for(const [id,p] of this.people)if(!active.has(id)&&id!==this.avatarId){p.sprite.destroy();this.people.delete(id);}
  }
  local(id:string,name:string,color:string,x:number,y:number,direction:Direction){
    this.avatarId=id;
    if(!id){for(const p of this.people.values())p.sprite.destroy();this.people.clear();return;}
    let p=this.people.get(id);
    if(!p||p.color!==color){if(p)p.sprite.destroy();p=this.createPlayer({id,name,color,x,y,direction,lastSeen:Date.now()});}
    this.animate(p,x,y);
  }
  move(dx:number,dy:number,d?:Direction){
    if(!this.avatarId)return;
    const p=this.people.get(this.avatarId);if(!p)return;
    const x=p.x+dx,y=p.y+dy;if(!canMove(x,y))return;
    const direction=d??(dx>0?"right":dx<0?"left":dy<0?"up":"down");
    this.animate(p,x,y);
    this.onWalk(x,y,direction);
  }
}
export function mountOffice(element:HTMLElement,onMove:(x:number,y:number,d:Direction)=>void){
  const scene=new OfficeScene(onMove);
  const game=new Phaser.Game({type:Phaser.AUTO,parent:element,width:COLS*TILE,height:ROWS*TILE,pixelArt:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[scene],render:{antialias:false}});
  return {game,scene};
}
