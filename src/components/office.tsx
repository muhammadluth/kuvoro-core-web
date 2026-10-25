"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, CircleHelp, Copy, DoorOpen, LayoutGrid, MapPin, Sparkles, Users, X } from "lucide-react";
import { COLORS, SPAWN, type Player } from "@/lib/office";
import type { OfficeScene } from "./game/office-scene";

function Avatar({color,size=36}:{color:string;size?:number}) {
  return <span className="avatar" style={{"--av":color,width:size,height:size} as React.CSSProperties}><span className="avatar-hair"/><span className="avatar-face"><i/><i/></span><span className="avatar-shirt"/></span>;
}
const areas=[{icon:"💻",title:"The workspace",description:"A desk for every great idea"},{icon:"🪴",title:"The lounge",description:"A little room to recharge"},{icon:"✨",title:"Team corner",description:"Where ideas come together"}];
export default function Office(){
  const [entered,setEntered]=useState(false),[name,setName]=useState(""),[color,setColor]=useState<string>(COLORS[0]);
  const [id,setId]=useState(""),[position,setPosition]=useState({...SPAWN}),[direction,setDirection]=useState<Player["direction"]>("down");
  const [players,setPlayers]=useState<Player[]>([]),[error,setError]=useState(""),[help,setHelp]=useState(false),[showPeople,setShowPeople]=useState(true),[copied,setCopied]=useState(false);
  const container=useRef<HTMLDivElement>(null);
  const scene=useRef<OfficeScene|null>(null);
  const moveRef=useRef<(dx:number,dy:number)=>void>(()=>{});
  const latest=useRef({id,name,color,position,direction});
  useEffect(()=>{latest.current={id,name,color,position,direction};},[id,name,color,position,direction]);
  const onMove=useCallback((x:number,y:number,d:Player["direction"])=>{setPosition({x,y});setDirection(d);},[]);
  useEffect(()=>{
    if(!container.current)return;
    let closed=false;
    let game:import("phaser").Game|undefined;
    void import("./game/office-scene").then(({mountOffice})=>{
      if(closed||!container.current)return;
      const mount=mountOffice(container.current,onMove);
      game=mount.game;
      scene.current=mount.scene;
      game.events.once("ready",()=>{const c=latest.current;mount.scene.local(c.id,c.name,c.color,c.position.x,c.position.y,c.direction);});
    });
    return()=>{closed=true;scene.current=null;game?.destroy(true);};
  },[onMove]);
  useEffect(()=>{scene.current?.local(entered?id:"",name,color,position.x,position.y,direction);},[entered,id,name,color,position,direction]);
  useEffect(()=>{if(!entered){scene.current?.sync([]);return;}scene.current?.sync(players);},[players,entered]);
  useEffect(()=>{moveRef.current=(dx,dy)=>scene.current?.move(dx,dy);},[]);
  const join=()=>{
    let session="";try{session=sessionStorage.getItem("kuvoro:id")??"";}catch{}
    if(!/^[0-9a-f-]{36}$/i.test(session))session=crypto.randomUUID();
    try{sessionStorage.setItem("kuvoro:id",session);}catch{}
    setId(session);setName(name.trim().slice(0,24)||"Guest");setEntered(true);
  };
  const leave=()=>{
    const current=latest.current;
    if(current.id)void fetch("/api/presence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:current.id,leave:true})}).catch(()=>{});
    setEntered(false);setId("");setPlayers([]);setPosition({...SPAWN});setDirection("down");
  };
  useEffect(()=>{
    if(!entered||!id)return;
    let active=true;
    const sync=async()=>{
      const m=latest.current;
      try{
        const response=await fetch("/api/presence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:m.id,name:m.name,color:m.color,x:m.position.x,y:m.position.y,direction:m.direction}),cache:"no-store"});
        if(!response.ok)throw Error("presence write");
        const read=await fetch("/api/presence",{cache:"no-store"});
        if(!read.ok)throw Error("presence read");
        const data=await read.json() as {players:Player[]};
        if(active){setPlayers(data.players);setError("");}
      }catch{if(active)setError("Connection lost. Retrying…");}
    };
    void sync();const timer=window.setInterval(()=>void sync(),1500);
    return()=>{active=false;clearInterval(timer);};
  },[id,entered]);
  const others=players.filter(p=>p.id!==id);
  const share=async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);window.setTimeout(()=>setCopied(false),2000);}catch{setError("Copy the URL from the address bar to invite teammates.");}};
  return <div className="shell">
    <aside className="rail" aria-label="Navigation"><div className="brand-icon">k<span>.</span></div><div className="rail-nav"><button className="rail-active" title="Virtual office"><LayoutGrid size={20}/></button><button title="People" onClick={()=>setShowPeople(x=>!x)}><Users size={20}/></button></div><div className="rail-bottom"><button title="Help" onClick={()=>setHelp(true)}><CircleHelp size={20}/></button><Avatar color={color} size={34}/></div></aside>
    <div className="workarea"><header className="topbar"><div className="breadcrumb"><span className="crumb-k">K</span><span>Kuvoro HQ</span><ChevronDown size={14}/><span className="slash">/</span><span className="crumb-active">Virtual office</span></div><div className="header-actions"><span className="live-dot"/><span className="live-label">{entered?"Exploring your office":"Your office is ready"}</span><span className="header-divider"/><button className="icon-button" title="Help" onClick={()=>setHelp(true)}><CircleHelp size={18}/></button><Avatar color={color} size={30}/></div></header>
    <div className="workspace"><main className="main"><div className="pageheading"><div><div className="eyebrow"><Sparkles size={13}/> YOUR PLACE TO BELONG</div><h1>A little world for big ideas <span>✳</span></h1><p>A more playful way to share a workspace, wherever you are.</p></div><div className="heading-right"><span className="office-count"><span className="live-dot"/>{entered?Math.max(players.length,1):0} here</span><button className="outline-button" onClick={share}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?"Copied!":"Invite team"}</button></div></div>
    <div className="office-frame"><div className="office-toolbar"><div className="space-pill"><span className="space-icon">✳</span><div><strong>Studio · Main Office</strong><small>A cozy place to work</small></div></div><div className="room-status"><span className="room-status-dot"/> {entered?"WASD OR ARROWS TO MOVE":"STEP INSIDE & EXPLORE"}</div></div>
      <div className="game-viewport"><div ref={container} className="phaser-canvas" role="img" aria-label="Interactive pixel-art virtual office with desks, a meeting table, lounge and avatars. Use WASD or arrow keys to move."/>{!entered&&<div className="game-overlay"><div className="intro-eyebrow">✦ WELCOME TO YOUR WORLD ✦</div><h2>Work feels better<br/>together.</h2><p>Choose your character and explore a space made for your team.</p><button onClick={()=>document.getElementById("join-name")?.focus()}>Create your avatar <ArrowRightIcon/></button></div>}</div>
      <div className="map-bottom"><div className="map-bottom-left"><span className="map-indicator"><MapPin size={14}/> Studio · Main Office</span><span className="map-bottom-dot">·</span><span className="map-quiet">{entered?`Position ${position.x}, ${position.y}`:"Welcome to Kuvoro"}</span></div><span className="map-quiet">Original pixel world · CC0 assets <span className="purple-heart">♥</span></span></div>
    </div>
    <div className="bottom-grid"><div className="welcome-card"><div className="card-decoration">✦</div><div className="card-eyebrow">{entered?"WELCOME HOME":"GET STARTED"}</div><h3>{entered?"Your corner of the office is ready.":"Come on in. Make it yours."}</h3><p>{entered?"Walk around using WASD or arrow keys. Teammates appear automatically.":"Choose a name and a little character to join your office."}</p>{!entered?<div className="join-form"><input id="join-name" aria-label="Your display name" value={name} placeholder="Your name" maxLength={24} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")join();}}/><div className="avatar-picker">{COLORS.map(c=><button key={c} style={{background:c}} onClick={()=>setColor(c)} aria-label={`Choose color ${c}`} className={color===c?"color-selected":""}>{c===color?"✓":""}</button>)}</div><button className="join-button" onClick={join}>Enter office <ArrowRightIcon/></button></div>:<div className="entered-panel"><div className="player-chip"><Avatar color={color}/><div><strong>{name}</strong><small>Here in Studio</small></div></div><button className="leave-button" onClick={leave}><DoorOpen size={16}/> Leave office</button></div>}</div>
    <div className="quick-card"><div className="card-eyebrow">MAKE YOURSELF AT HOME</div><h3>Explore your world <span>✧</span></h3><div className="spots">{areas.map((area,i)=><div className="spot" key={area.title}><span className={`spot-icon spot-${i}`}>{area.icon}</span><div><strong>{area.title}</strong><small>{area.description}</small></div><span className="spot-arrow">✦</span></div>)}</div></div></div></main>
    {showPeople&&<aside className="sidepanel"><div className="sidepanel-header"><div className="sidepanel-title">People in the office <span className="side-star">✳</span></div><button className="panel-close" onClick={()=>setShowPeople(false)} aria-label="Close people panel"><X size={16}/></button></div><div className="panel-tabs"><button className="tab-active"><Users size={15}/> Team members</button></div><div className="people-pane"><div className="people-section-label"><span>IN THIS SPACE</span><span>{entered?Math.max(players.length,1):0}</span></div>{entered?<><div className="person"><Avatar color={color} size={39}/><div><strong>{name}</strong><small><span className="person-online"/>Exploring Studio</small></div><span className="you-pill">You</span></div>{others.map(p=><div className="person" key={p.id}><Avatar color={p.color} size={39}/><div><strong>{p.name}</strong><small><span className="person-online"/>Here with you</small></div></div>)}</>:<div className="nobody"><div className="nobody-icon">✳</div><strong>A world to explore</strong><p>Come inside and you will see teammates who are here.</p></div>}<div className="side-tip"><span>💡</span><div><strong>Better together</strong><p>Invite teammates with the office link. Everyone shares the same space.</p></div></div></div><div className="sidebar-bottom"><div className="focus-heading"><span className="focus-icon">✧</span><div><strong>A little place for your team</strong><p>Find your favorite spot.</p></div></div><div className="sidebar-illustration"><span className="illustration-star i-star-a">✦</span><span className="illustration-cup">☕</span><span className="illustration-star i-star-b">✳</span><span className="illustration-plant">🌿</span></div></div></aside>}</div>
    <footer className="footer"><span className="footer-brand">✳ <strong>Kuvoro</strong><span> · Better when we are together.</span></span><div className="footer-controls"><span className="footer-info"><span className="footer-info-dot"/>{entered?"In office":"Not in office"}</span><span className="footer-line"/><button title="Controls" onClick={()=>setHelp(true)}><CircleHelp size={18}/></button></div>{error&&<div className="error-toast">{error}</div>}</footer>
    {entered&&<div className="touch-controls"><button aria-label="Move up" onClick={()=>moveRef.current(0,-1)}><ArrowUp size={18}/></button><div><button aria-label="Move left" onClick={()=>moveRef.current(-1,0)}><ArrowLeft size={18}/></button><button aria-label="Move down" onClick={()=>moveRef.current(0,1)}><ArrowDown size={18}/></button><button aria-label="Move right" onClick={()=>moveRef.current(1,0)}><ArrowRight size={18}/></button></div></div>}
    {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><div className="help-modal" role="dialog" aria-modal="true" aria-label="Office controls" onClick={e=>e.stopPropagation()}><button className="modal-x" onClick={()=>setHelp(false)} aria-label="Close help"><X/></button><span className="modal-emoji">🕹️</span><h2>Move around your world</h2><p>Walk with WASD or arrow keys. On mobile, use the on-screen directional buttons. Furniture blocks your path, just like a real room.</p><div className="key-demo"><span>W</span><div><span>A</span><span>S</span><span>D</span></div></div><p className="help-secondary">Other teammates appear when they visit the same office. Chat, voice and video are intentionally not part of this version.</p><button className="join-button" onClick={()=>setHelp(false)}>Got it! <Check size={16}/></button></div></div>}
  </div></div>;
}
function ArrowRightIcon(){return <span aria-hidden="true">→</span>}
