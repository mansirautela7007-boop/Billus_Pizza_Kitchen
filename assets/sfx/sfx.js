/* KSFX — the game's sound effects (free clips from Mixkit, Mixkit Free Sound Effects License: free to use, no
   attribution needed), trimmed and levelled in assets/sfx/*.m4a. Played through Web Audio so they start at once
   and overlap cleanly; each clip is fetched once. While a story or lesson is being wound forward (BACK), or the
   game is paused or in another tab, nothing plays. */
window.KSFX=(()=>{
  const NAMES=["tap","pick","plop","unplop","cut","press","tick","correct","chimes","cheer","wrong","oops","whoosh","swish",
    "chomp","munch","nibble","drumroll","fanfare","levelup","bell","splat","star","sparkle","giggle","applause","bonus"];
  const VOL={tap:.45,pick:.5,plop:.55,unplop:.45,cut:.6,press:.6,tick:.45,correct:.55,chimes:.4,cheer:.42,wrong:.45,oops:.45,
    whoosh:.35,swish:.35,chomp:.6,munch:.6,nibble:.55,drumroll:.5,fanfare:.5,levelup:.5,bell:.5,splat:.5,star:.45,sparkle:.35,
    giggle:.45,applause:.4,bonus:.45};
  let ctx=null, out=null; const buf={}, loading={}, live=new Set(); let master=1;
  const AC=window.AudioContext||window.webkitAudioContext;
  function ac(){ if(!ctx&&AC){ try{ ctx=new AC(); out=ctx.createGain(); out.gain.value=1; out.connect(ctx.destination); }catch(e){ ctx=null; } } return ctx; }
  function load(n){ if(buf[n]||loading[n]||!ac()) return loading[n];
    loading[n]=fetch("assets/sfx/"+n+".m4a").then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>{ const p=ctx.decodeAudioData(b,ok,no); if(p&&p.then) p.then(ok,no); }))
      .then(b=>{ buf[n]=b; return b; }).catch(()=>{ loading[n]=null; });
    return loading[n]; }
  const quiet=()=>(window.STORY_RW&&STORY_RW.ff)||(window.TUT_RW&&(TUT_RW.ff||TUT_RW.abort))||(window.PAUSE&&PAUSE.on)||(window.GAME_AWAY&&GAME_AWAY());
  /* play a clip: {vol, rate, delay (s), loop}. Returns a handle with stop() */
  function play(n,o={}){ if(quiet()) return {stop(){}}; const c=ac(); if(!c) return {stop(){}};
    if(c.state==="suspended"&&!(window.GAME_AWAY&&GAME_AWAY())) c.resume().catch(()=>{});
    let src=null, stopped=false;
    const go=b=>{ if(stopped||!b) return; src=c.createBufferSource(); src.buffer=b; src.loop=!!o.loop; src.playbackRate.value=o.rate||1;
      const g=c.createGain(); g.gain.value=(o.vol!=null?o.vol:(VOL[n]||.5))*master; src.connect(g); g.connect(out);
      const h={src,g}; live.add(h); src.onended=()=>live.delete(h);
      try{ src.start(c.currentTime+(o.delay||0)); }catch(e){} };
    if(buf[n]) go(buf[n]); else { const p=load(n); if(p) p.then(go); }
    return {stop(fade=.12){ stopped=true; if(!src) return; try{ src.stop(c.currentTime+fade); }catch(e){} } }; }
  function stopAll(){ live.forEach(h=>{ try{ h.src.stop(); }catch(e){} }); live.clear(); }
  // fetched once the page is up, so the first tap is never silent
  const warm=()=>NAMES.forEach(load);
  if(document.readyState==="complete") setTimeout(warm,300); else addEventListener("load",()=>setTimeout(warm,300));
  ["pointerdown","keydown"].forEach(t=>addEventListener(t,()=>{ const c=ac(); if(c&&c.state==="suspended"&&!(window.GAME_AWAY&&GAME_AWAY())) c.resume().catch(()=>{}); warm(); },{capture:true,passive:true}));
  return {play,stopAll,load,set volume(v){ master=v; }};
})();
