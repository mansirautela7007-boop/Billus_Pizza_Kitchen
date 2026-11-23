/* BILLU'S PIZZA KITCHEN — focus: a spotlight on what matters now, and no voice line repeated within a level.
   Loaded last on both pages (after design.js). Game logic is untouched: this only wraps the game's own cues. */
(()=>{ "use strict";
const $=id=>document.getElementById(id), PAGE=/level2/.test(location.pathname)?"l2":"l1";
const RM=matchMedia("(prefers-reduced-motion: reduce)");
const inGame=()=>{ const st=$("story"), tu=$("tut"), sp=$("start"); return (!st||st.hidden)&&(!tu||tu.hidden)&&(!sp||sp.hidden); };
const paused=()=>typeof PAUSE==="object"&&PAUSE&&(PAUSE.menu||PAUSE.on);

/* =====================================================================================
   1. SPOTLIGHT: a warm dim over the table with soft holes, and a glowing cheese-yellow ring
      (with two twinkles) round each thing to look at. It follows its target while it moves,
      never blocks a tap, and clears on the next tap or after its time is up.
   ===================================================================================== */
/* a group (the bowls) is ringed as one: the box round all its visible children */
const rectOf=el=>{ if(el.id==="slots"){ const rs=[...el.querySelectorAll(".katori")].map(k=>k.getBoundingClientRect()).filter(r=>r.width);
    if(rs.length){ const l=Math.min(...rs.map(r=>r.left)), t=Math.min(...rs.map(r=>r.top)), R=Math.max(...rs.map(r=>r.right)), B=Math.max(...rs.map(r=>r.bottom)); return {left:l,top:t,width:R-l,height:B-t}; } }
  return el.getBoundingClientRect(); };
const veil=document.createElement("div"); veil.className="dsVeil"; veil.setAttribute("aria-hidden","true"); document.body.appendChild(veil);
function makeSpot(dimByDefault,withHand){
  let els=[], rings=[], until=0, shown=0, dim=dimByDefault, raf=0, token=0;
  const ringFor=el=>{ const r=document.createElement("div"); r.className="dsRing"; r.setAttribute("aria-hidden","true"); document.body.appendChild(r); return r; };
  function place(){
    if(!els.length) return;
    if(until&&performance.now()>until||paused()||withHand&&!$("phand")&&performance.now()-shown>400){ hide(); return; }   // the hand's ring goes with the hand
    els=els.filter(e=>e&&e.isConnected&&e.getClientRects().length);
    if(!els.length){ hide(); return; }
    const holes=[];
    els.forEach((el,k)=>{ const r=rectOf(el), ring=rings[k]; if(!ring) return;
      const pad=Math.max(6,Math.min(14,Math.min(r.width,r.height)*.08)), cs=getComputedStyle(el), rad=parseFloat(cs.borderTopLeftRadius)||0;
      const round=el.id!=="slots"&&rad>=Math.min(r.width,r.height)*.4;
      ring.style.left=(r.left-pad)+"px"; ring.style.top=(r.top-pad)+"px"; ring.style.width=(r.width+2*pad)+"px"; ring.style.height=(r.height+2*pad)+"px";
      ring.classList.toggle("round",round); if(!round) ring.style.borderRadius=(Math.max(16,el.id==="slots"?24:rad+pad))+"px"; else ring.style.removeProperty("border-radius");
      if(dim){ const rx=r.width/2+pad+28, ry=r.height/2+pad+28;
        holes.push(`radial-gradient(${rx.toFixed(0)}px ${ry.toFixed(0)}px at ${(r.left+r.width/2).toFixed(0)}px ${(r.top+r.height/2).toFixed(0)}px,transparent 0 72%,#000 100%)`); } });
    if(dim){ const card=document.querySelector("#app>.card,.tut .talk");   // the instruction banner stays bright: it says what to look at
      // the whole banner stays evenly bright: the dim begins just below it and fades in (an oval hole looked like a second spotlight on the panel)
      if(card&&card.getClientRects().length){ const r=card.getBoundingClientRect(), y=Math.max(0,r.bottom+10);
        holes.push(`linear-gradient(to bottom,transparent 0 ${y.toFixed(0)}px,#000 ${(y+36).toFixed(0)}px)`); }
      veil.style.setProperty("--holes",holes.join(",")); veil.classList.add("on"); veil._owner=token; }
    raf=requestAnimationFrame(place); }
  function show(list,{ms=2200,dim:d=dimByDefault}={}){
    hide(true); els=(Array.isArray(list)?list:[list]).filter(Boolean); if(!els.length) return;
    token=Math.random(); shown=performance.now(); dim=d; until=ms?performance.now()+ms:0;
    rings=els.map(ringFor); requestAnimationFrame(()=>rings.forEach(r=>r.classList.add("on")));
    place(); }
  function hide(quick){ cancelAnimationFrame(raf); raf=0; els=[];
    const old=rings; rings=[]; old.forEach(r=>{ r.classList.remove("on"); setTimeout(()=>r.remove(),quick?0:400); });
    if(veil._owner===token){ veil.classList.remove("on"); veil._owner=null; } }
  /* show once the current spotlight is over (if `still()` says it is still worth showing) */
  function next(list,opts,still){ const t0=performance.now(); (function w(){ if(performance.now()-t0>6000) return; if(els.length){ setTimeout(w,150); return; } if(!still||still()) show(list,opts); })(); }
  return {show,hide,next,get on(){ return els.length>0; }};
}
const cue=makeSpot(true), hand=makeSpot(false,true);
window.DSSpot={cue,hand};
/* any tap clears the dim (the child has seen it); the hand's ring stays while the hand does */
document.addEventListener("pointerdown",()=>{ if(cue.on) cue.hide(); },true);

/* the pointing hand: whatever it points at gets the ring too */
{ const p0=window.pointAt; if(typeof p0==="function") window.pointAt=function(el,...a){ const r=p0.call(this,el,...a); if(el) hand.show([el],{ms:0}); else hand.hide(); return r; }; }
{ const u0=window.unpoint; if(typeof u0==="function") window.unpoint=function(...a){ hand.hide(); return u0.apply(this,a); }; }

const once=new Set();   // a cue that should only spotlight the first time it comes up for this question
const qkey=()=>typeof S==="object"&&S?(S.lv||"")+":"+S.i:"";

if(PAGE==="l1"){
  const tile=()=>document.querySelector("#slip .oc-fr");
  /* a new customer: their order's fraction is what to read first */
  { const f=window.showCustomer; if(typeof f==="function") window.showCustomer=function(...a){ const r=f.apply(this,a);
      setTimeout(()=>{ if(inGame()&&!(S.tut&&S.tut.guided)) cue.show([tile()],{ms:2600}); },450); return r; }; }
  /* a number on the order is being talked about */
  { const f=window.blinkNum; if(typeof f==="function") window.blinkNum=function(...a){ const r=f.apply(this,a); if(inGame()&&!cue.on) cue.show([tile()],{ms:1800,dim:false}); return r; }; }
  /* "Pick a topping first!": the bowls */
  { const f=window.showHint; if(typeof f==="function") window.showHint=function(...a){ const r=f.apply(this,a); if(inGame()) cue.next([$("slots")],{ms:2400},()=>inGame()&&S.phase==="top"&&!S.topping); return r; }; }
  /* the right number of parts topped: CHECK, once per order */
  setInterval(()=>{ const d=$("done"); if(!d||!inGame()||paused()||typeof S!=="object") return;
    if(S.phase==="top"&&d.classList.contains("r3pulse")&&!d.hidden&&d.getClientRects().length&&!once.has("chk"+qkey())){ once.add("chk"+qkey()); cue.next([d],{ms:1800,dim:false},()=>d.classList.contains("r3pulse")&&!d.hidden); } },200);
  /* a second wrong try: back to the order's top number */
  { const f=window.miss; if(typeof f==="function") window.miss=function(...a){ const r=f.apply(this,a); if(typeof S==="object"&&S.tw>=2) setTimeout(()=>cue.show([tile()],{ms:2600}),200); return r; }; }
}
if(PAGE==="l2"){
  const tileOf=x=>{ const s=$("side-"+x); return s&&(s.querySelector(".eat>span.ate")||s.querySelector(".eat")); };
  /* a wrong plate: the number to look at again (both sides' cues gather into one spotlight) */
  { const f=window.bump; let pend=[], tm=0;
    if(typeof f==="function") window.bump=function(el,cls,...a){ const r=f.call(this,el,cls,...a);
      if(cls==="blink"&&el&&inGame()){ pend.push(el.closest(".eat>span.ate")||el); clearTimeout(tm); tm=setTimeout(()=>{ cue.show([...new Set(pend)],{ms:2200}); pend=[]; },60); } return r; }; }
  /* the rule to compare by: both fractions */
  { const f=window.hiRule; if(typeof f==="function") window.hiRule=function(...a){ const r=f.apply(this,a); if(inGame()) cue.show([tileOf("a"),tileOf("b")],{ms:2600}); return r; }; }
  /* each new match opens with a look at the two fractions */
  setInterval(()=>{ if(typeof S!=="object"||!S||!inGame()||paused()) return; const st=typeof STEPS!=="undefined"&&STEPS[S.i];
    if(st&&st.kind==="match"&&S.phase==="build"&&!once.has("m"+S.i)){ once.add("m"+S.i); setTimeout(()=>{ if(S.phase==="build") cue.show([tileOf("a"),tileOf("b")],{ms:2400}); },700); } },250);
}
/* lessons (both levels): the fraction card being talked about */
{ const learn=()=>document.querySelector("#tutLearn,#t2learn");
  new MutationObserver(ms=>{ const tu=$("tut"); if(!tu||tu.hidden) return;
    for(const m of ms){ const el=m.target; if(!(el instanceof Element)||!el.classList.contains("hi")||m.oldValue&&/\bhi\b/.test(m.oldValue)) continue;
      if(el.closest("#tutLearn,#t2learn")&&el.matches(".lf,.l2f,.tag,.lleft")){ cue.show([el],{ms:1800}); break; } } })
    .observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"],attributeOldValue:true}); }

/* =====================================================================================
   2. VOICE: within one level, a line's voice plays only the first time it comes up.
      After that the words still appear in the banner, but they aren't spoken again.
      Lessons and the story are left as they are; tapping Noori (or the read-aloud key)
      always plays the line again.
   ===================================================================================== */
{ const s0=window.speak; if(typeof s0==="function"){
    const heard=new Set(); let replayUntil=0;
    document.addEventListener("pointerdown",e=>{ if(e.target instanceof Element&&e.target.closest("#guide,.dsSay,#say,#app>.card")) replayUntil=performance.now()+900; },true);
    const key=t=>String(t||"").replace(/<[^>]+>/g," ").toLowerCase().replace(/[^a-z0-9\/]+/g," ").trim();   // "⭐" and punctuation don't make a line new
    let q=null;   // lines said in the same instant: only the last one is voiced (no clipped half-line before it)
    window.speak=function(text,...a){
      const replay=performance.now()<=replayUntil, k=key(text);
      if(inGame()&&!replay&&k&&heard.has(k)){ q=null; try{ if(typeof VOICE==="object"&&VOICE.stop) VOICE.stop(); speechSynthesis.cancel(); }catch(e){} return; }
      const job={ctx:this,text,a,k,game:inGame()&&!replay}; q=job;
      Promise.resolve().then(()=>{ if(q!==job) return; q=null; if(job.game&&job.k) heard.add(job.k); s0.call(job.ctx,job.text,...job.a); }); }; } }
})();
