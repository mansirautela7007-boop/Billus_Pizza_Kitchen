/* BILLU'S PIZZA KITCHEN — design pass behaviours (visual only; no game logic changes).
   Loaded last on both pages, after assets/ui/design.css. */
(()=>{ "use strict";
const $=id=>document.getElementById(id), PAGE=/level2/.test(location.pathname)?"l2":"l1";
document.body.classList.add(PAGE==="l2"?"l2page":"l1page");
const root=document.documentElement, RM=matchMedia("(prefers-reduced-motion: reduce)");
const portrait=()=>root.classList.contains("portrait");
const setZ=()=>root.style.setProperty("--z",String(window.FITZ?FITZ():1)); setZ(); addEventListener("resize",setZ);
const EASE="cubic-bezier(.3,.7,.3,1)", T_SLOW=400;

/* ---------- wrong answers sound soft (a gentle "oops"), never a buzzer ---------- */
try{ if(typeof Sound==="object"&&Sound){ Sound.bad=()=>{ if(window.KSFX) KSFX.play("oops",{vol:.28}); }; } }catch(e){}

/* ---------- title: the PLAY art already carries its own label (review 4: no extra label on top) ---------- */
document.querySelectorAll("#mainPlay .dsPlay").forEach(e=>e.remove());

/* ---------- story: progress dots (step x / y) ---------- */
const storyTotal=(()=>{ try{
  if(PAGE==="l1"&&typeof storyContext1==="function") return (storyContext1.toString().match(/sLine\(/g)||[]).length;
  if(PAGE==="l2"&&typeof storyContext2==="function") return (storyContext2.toString().match(/await say\(/g)||[]).length; }catch(e){} return 0; })();
const dots=document.createElement("div"); dots.className="dsDots"; dots.hidden=true; dots.style.display="none";   // review 4: no progress bar in the story dots.setAttribute("role","status"); document.body.appendChild(dots);
function paintDots(i){ if(!storyTotal) return; const n=Math.min(storyTotal,Math.max(1,i+1));
  dots.innerHTML=[...Array(storyTotal)].map((_,k)=>`<span class="dot ${k<n-1?"dsPast":k===n-1?"dsNow":""}"></span>`).join("")+`<span class="lab">${n} / ${storyTotal}</span>`;
  dots.setAttribute("aria-label",`Story step ${n} of ${storyTotal}`); }
{ const s0=window.sLine; if(typeof s0==="function") window.sLine=function(...a){ const p=s0.apply(this,a); const rw=window.STORY_RW; paintDots(rw&&rw.cur>=0?rw.cur:0); return p; }; }

/* ---------- story: a subtle fade / slide between pictures (instant while BACK winds the story forward) ---------- */
if(typeof window.sceneBook==="function") window.sceneBook=function(oldEl,newEl){
  document.querySelectorAll("#sworld>.sbub").forEach(b=>b.classList.remove("on")); if(typeof sSpot==="function") sSpot(null);
  const sw=$("sworld"), im=newEl.querySelector("img"), ready=im&&im.decode?im.decode().catch(()=>{}):Promise.resolve();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  return Promise.race([ready,wait(1500)]).then(()=>{
    const ff=window.STORY_RW&&STORY_RW.ff;
    if(!oldEl||oldEl.parentNode!==sw||ff||RM.matches&&false){ if(oldEl&&oldEl.parentNode===sw){ sw.insertBefore(newEl,oldEl); oldEl.remove(); } else sw.appendChild(newEl); newEl.classList.add("in","now"); return; }
    sw.insertBefore(newEl,oldEl.nextSibling); newEl.classList.add("in","now");
    if(window.SFX&&SFX.whoosh) SFX.whoosh();
    const d=RM.matches?T_SLOW:T_SLOW, dx=RM.matches?0:28;
    const a=newEl.animate([{opacity:0,transform:`translateX(${dx}px)`},{opacity:1,transform:"none"}],{duration:d,easing:EASE});
    oldEl.animate([{opacity:1,transform:"none"},{opacity:0,transform:`translateX(${-dx}px)`}],{duration:d,easing:EASE,fill:"forwards"});
    return a.finished.catch(()=>{}).then(()=>{ oldEl.remove(); }); }); };

/* ---------- lesson: step indicator ("3 / 16") and a read-aloud button in the banner ---------- */
const LESSON=PAGE==="l1"
  ? ["Let’s practise","This is one whole","To make a half","Each part is","Two halves","For 4/5","For 3/8","What are","They are fractions","The bottom number","The top number","I get it","Yes! We read","5/8 means","I’m ready","So many customers"]
  : ["Let’s practise","First, both pizzas","Monty ate 1 slice","Who ate more? Tap",["Yes! The ant","Look closely"],"Monty’s pizza has 8","The ant is the winner","Same number of parts","Same denominator?","More matches"];
const step=document.createElement("div"); step.className="dsStep"; step.hidden=true; step.style.display="none";   // review 4: no step pill in the lesson step.setAttribute("role","status"); document.body.appendChild(step);
let lastLesson={who:"noori",text:""};
{ const t0=window.tutSay; if(typeof t0==="function") window.tutSay=function(who,text,...a){ const r=t0.call(this,who,text,...a);
    lastLesson={who,text}; const k=LESSON.findIndex(p=>(Array.isArray(p)?p:[p]).some(q=>String(text).startsWith(q)));
    if(k>=0){ step.textContent=`${k+1} / ${LESSON.length}`; step.setAttribute("aria-label",`Lesson step ${k+1} of ${LESSON.length}`); }
    const talk=document.querySelector(".tut .talk");
    if(talk&&!talk.querySelector(".dsSay")){ const b=document.createElement("button"); b.type="button"; b.className="dsSay"; b.setAttribute("aria-label","Read it again");
      b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6L8 10H4z" fill="currentColor"/><path d="M17 8.5a5 5 0 0 1 0 7"/></svg>';
      b.addEventListener("click",e=>{ e.stopPropagation(); if(typeof speak==="function") speak(lastLesson.text,lastLesson.who); });
      const p=$("tutLine"); if(p&&p.parentNode===talk) p.insertAdjacentElement("afterend",b); else talk.appendChild(b); }
    return r; }; }

/* ---------- Level 1 order screen: the star tracker in a row under the order card (top-left beside Pause while serving) ---------- */
const trail=$("trail");
function placeTrail(){ if(PAGE!=="l1"||!trail) return;
  const game=$("story").hidden&&$("tut").hidden&&$("start").hidden&&$("end").hidden, slip=$("slip");
  const put=(x,y)=>{ trail.style.setProperty("left",x+"px","important"); trail.style.setProperty("top",y+"px","important"); };   // an older rule pins the rail with !important
  if(!game||!slip){ trail.classList.remove("dsRow"); trail.style.removeProperty("left"); trail.style.removeProperty("top"); return; }
  trail.classList.add("dsRow");
  const serving=$("stage").classList.contains("serving"), pb=$("r3pause");
  if(serving&&pb&&!portrait()){ const r=pb.getBoundingClientRect(); put(r.right+12,r.top+r.height/2-trail.offsetHeight/2); return; }
  const cust=$("cust"); const kids=[...cust.children].filter(k=>k.getClientRects().length&&!k.hidden);
  if(portrait()){ trail.style.removeProperty("left"); trail.style.removeProperty("top"); return; }   // the top bar (design.css)
  const last=kids[kids.length-1]||slip, r=last.getBoundingClientRect(), s=slip.getBoundingClientRect();
  put(s.left+s.width/2-trail.offsetWidth/2,r.bottom+12); }
setInterval(placeTrail,250); addEventListener("resize",placeTrail);

/* ---------- topped slices lift and glow ---------- */
function paintTops(){ if(typeof PZ==="undefined"||typeof S!=="object") return;
  PZ.querySelectorAll(".part[data-i]").forEach(p=>p.classList.toggle("dsTop",S.phase==="top"&&S.covered instanceof Map&&S.covered.has(+p.dataset.i))); }
["setCount","cover","uncover"].forEach(n=>{ const f=window[n]; if(PAGE==="l1"&&typeof f==="function") window[n]=function(...a){ const r=f.apply(this,a); paintTops(); return r; }; });
{ const s0=window.serve; if(PAGE==="l1"&&typeof s0==="function") window.serve=function(...a){ PZ.querySelectorAll(".part.dsTop").forEach(p=>p.classList.remove("dsTop")); return s0.apply(this,a); }; }

/* ---------- lesson "serve" slides: "Left" sits under the board's pizza, "Served" under the plate, both on one line ---------- */
/* review 4: each label takes its final place the moment it appears (it used to pop in at its own height and then
   jump to line up with the other one). The pop-in only scales a label about its centre, so the centre gives the
   resting place even mid-animation; the shared line is the lowest of the labels seen so far on this slide. */
let serveLine={slide:null,y:-Infinity};
function alignServeLabels(){
  const ll=[...document.querySelectorAll(".tut .learn.serveplate .lleft")].filter(e=>e.getClientRects().length); if(!ll.length) return;
  const slide=ll[0].closest(".learn"); if(serveLine.slide!==slide||!slide.isConnected) serveLine={slide,y:-Infinity};
  const anchor=e=>e.closest(".lplw")?$("lPl"):(e.closest(".lsp")||e.parentNode).querySelector("svg")||e.parentNode;
  const nat=ll.map(e=>{ const old=e.style.getPropertyValue("translate"); e.style.removeProperty("translate");
    const r=e.getBoundingClientRect(), cy=r.top+r.height/2, h=e.offsetHeight||r.height;
    if(old) e.style.setProperty("translate",old,"important");
    return {top:cy-h/2,cx:r.left+r.width/2,w:e.offsetWidth||r.width}; });
  if(ll.length===2&&!(nat[0].cx+nat[0].w/2<=nat[1].cx-nat[1].w/2||nat[1].cx+nat[1].w/2<=nat[0].cx-nat[0].w/2)) return;   // stacked (narrow screens): leave them be
  nat.forEach(n=>{ if(n.top>serveLine.y) serveLine.y=n.top; });
  ll.forEach((e,k)=>{ const a=anchor(e).getBoundingClientRect(), dx=(a.left+a.width/2)-nat[k].cx, dy=serveLine.y-nat[k].top;
    const want=`calc(-50% + ${dx.toFixed(1)}px) ${dy.toFixed(1)}px`; if(e.style.getPropertyValue("translate")!==want) e.style.setProperty("translate",want,"important"); }); }
setInterval(alignServeLabels,60); addEventListener("resize",()=>{ serveLine.y=-Infinity; alignServeLabels(); });
new MutationObserver(()=>alignServeLabels()).observe(document.body,{subtree:true,childList:true});

/* ---------- instruction panel: the speaker's name tab, a slide-in for each new line, one gentle shake for "try again" ---------- */
const NICE={noori:"Noori",billu:"Billu",billu_idle:"Billu",chintu_face:"Chintu",chintu_full:"Chintu"};
const nameOf=k=>{ k=String(k||"").toLowerCase(); if(!k) return ""; if(NICE[k]) return NICE[k];
  try{ if(typeof NAMES==="object"&&NAMES[k]) return String(NAMES[k]).replace(/^the /i,""); }catch(e){} return k[0].toUpperCase()+k.slice(1); };
function paintPanel(){ return;   // review 4: no speaker name tab on the instruction panel
  const card=document.querySelector("#app>.card"), g=$("guide");
  if(card&&g){ const n=nameOf(g.dataset.spk||"noori"); if(card.dataset.name!==n) card.dataset.name=n; }
  const tk=document.querySelector(".tut .talk"); if(tk){ const n=nameOf(lastLesson.who||"noori"); if(tk.dataset.name!==n) tk.dataset.name=n; } }
const lineIn=(p,box)=>{ if(!p||!box) return; let last=p.textContent;
  new MutationObserver(()=>{ const t=p.textContent; if(t===last) return; last=t; paintPanel();
    p.classList.remove("dsIn"); box.classList.remove("dsNew"); void p.offsetWidth; p.classList.add("dsIn"); box.classList.add("dsNew");
    if(/\bbad\b/.test(p.className)){ box.classList.remove("dsShake"); void box.offsetWidth; box.classList.add("dsShake"); setTimeout(()=>box.classList.remove("dsShake"),450); }
    setTimeout(()=>box.classList.remove("dsNew"),450); }).observe(p,{childList:true,characterData:true,subtree:true}); };
lineIn($("say"),document.querySelector("#app>.card"));
{ const wait=setInterval(()=>{ const p=$("tutLine"), tk=document.querySelector(".tut .talk"); if(p&&tk){ clearInterval(wait); lineIn(p,tk); } },300); }
setInterval(paintPanel,250); paintPanel();

/* ---------- show / hide the story dots and the lesson step pill ---------- */
setInterval(()=>{ const st=$("story"), tu=$("tut");
  { const ss=$("ssub"); if(ss){ if(portrait()) ss.style.setProperty("translate","none","important"); else if(ss.style.getPropertyValue("translate")==="none") ss.style.removeProperty("translate"); } }
  { const tk=document.querySelector(".tut .talk");   // portrait: the lesson banner always spans the board (a text-fit pass used to narrow it)
    if(tk){ if(portrait()){ ["width","max-width","min-width","left","right","margin-left","translate"].forEach(k=>tk.style.removeProperty(k));
        const fixed=getComputedStyle(tk).position==="fixed";
        tk.dataset.cx="0"; tk.style.setProperty("width",fixed?(innerWidth-32)+"px":"100%","important"); tk.style.setProperty("max-width","none","important"); tk.style.setProperty("left",fixed?"16px":"0px","important"); tk.style.setProperty("height","auto","important"); tk.style.setProperty("max-height","none","important"); tk.style.setProperty("min-height","64px","important"); if(fixed){ tk.style.setProperty("top","88px","important"); tk.style.setProperty("bottom","auto","important"); tk.style.setProperty("translate","none","important"); } }
      else if(/^(16|0)px$/.test(tk.style.getPropertyValue("left"))){ ["width","max-width","left","top","bottom","translate","height","max-height","min-height"].forEach(k=>tk.style.removeProperty(k)); } } }
  { const cd=document.querySelector("#app>.card");   // portrait: the banner spans the screen (a centring pass used to shift it sideways)
    if(cd){ if(portrait()){ cd.dataset.cx="0"; cd.style.setProperty("translate","none","important"); cd.style.setProperty("width","100%","important"); cd.style.setProperty("max-width","none","important"); cd.style.setProperty("min-width","0px","important"); cd.style.setProperty("height","auto","important"); cd.style.setProperty("min-height","72px","important"); cd.style.setProperty("max-height","none","important"); cd.style.setProperty("box-sizing","border-box","important"); }
      else if(cd.style.getPropertyValue("translate")==="none"){ ["translate","width","height","min-height","max-height","box-sizing","max-width","min-width"].forEach(k=>cd.style.removeProperty(k)); } } }
  if(PAGE==="l1"&&trail) trail.style.visibility=(!$("end").hidden&&portrait())?"hidden":"";
  dots.hidden=!(st&&!st.hidden&&storyTotal);
  step.hidden=!(tu&&!tu.hidden&&tu.classList.contains("open")&&step.textContent); },200);
})();
