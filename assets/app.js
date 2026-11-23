(() => {
"use strict";
const DATA = window.DATA;
const LET = "ABCDEFGH";
const BADGE = {"ccao-f":"New","ccdv-f":"New","gh-300":"New","ccar-p":"Updated"};
const VCOL = {Anthropic:"#FF7A3D", GitHub:"#A78BFA", Microsoft:"#38BDF8"};

/* ---------- copy ---------- */
const STR = {
  eyebrow:"Certification practice lab",
  h1a:"Practice.", h1b:"Fail.", h1c:"Fix it.",
  lead:"Seven exam banks in one place. Split any bank into tests of your size, take them part by part, then retake only what you got wrong until it sticks.",
  sQ:"questions", sExams:"exam banks", sMis:"mistakes to fix", sDone:"answered",
  pick:"Pick an exam", pickSub:"Progress is saved in this browser and comes back next time.",
  cont:"Continue where you left off", contSub:"Parts you started but haven't finished.",
  answered:"answered", acc:"accuracy", mis:"mistakes", qs:"questions", min:"min", pass:"pass",
  back:"All exams", overview:"Overview", exams:"Exams",
  partsT:"Test in parts", partsD:"Split the {n}-question bank into smaller tests. Take them one at a time, then retake only the ones you got wrong.",
  perPart:"Questions per part", feedback:"Feedback", fbEnd:"Score at end", fbNow:"Instant", mix:"Mix question order",
  partN:"Part {n}", partRange:"Q{a}–{b}", partQs:"{n} Qs",
  start:"Start", resume:"Resume {a}/{n}", retake:"Retake", fixN:"Fix {n} wrong", allFixed:"All fixed",
  best:"Best {p}%", last:"Last {p}%", notStarted:"Not started", inProgress:"In progress",
  resizeQ:"Change part size?", resizeD:"Part scores and unfinished parts for this exam will be reset. Your answer history and Mistakes deck stay.",
  remixQ:"Reshuffle the parts?", remixD:"Questions will be redistributed across parts, so part scores and unfinished parts will be reset.",
  change:"Change", partsNote:"Parts use the whole bank. Topic filters below apply to the other modes.",
  otherModes:"More ways to practice",
  mStudy:"Study mode", mStudyD:"Every question in order with instant answers.",
  mPractice:"Practice set", mPracticeD:"A random set of {n} with instant feedback.",
  mMock:"Mock exam", mMockD:"Real exam timing. Answers only at the end.",
  mMis:"Mistakes deck", mMisD:"Only questions you got wrong. Get each right twice to clear it.",
  mFlag:"Flagged", mFlagD:"Questions you marked to look at again.",
  mCards:"Trick flashcards", mCardsD:"Flip cards with the answer and memory trick.",
  domains:"Topics", allDomains:"All topics", settings:"Practice settings",
  size:"Practice set size", all:"All", shuffle:"Shuffle options", newFirst:"New questions first",
  history:"Recent attempts", noHist:"No attempts yet. Start with Part 1.",
  reset:"Reset progress for this exam", resetQ:"Reset all progress for this exam?", resetD:"Answers, mistakes, flags, part scores and history for this exam will be cleared.",
  cancel:"Cancel", confirm:"Yes, reset",
  check:"Check", next:"Next", prev:"Previous", finish:"Finish", submit:"Submit", exit:"Exit",
  selectN:"Select {n}", selected:"{a}/{n} selected",
  correct:"Correct!", wrong:"Not quite", correctSub:"Nice. Keep going.", wrongSub:"Added to your Mistakes deck.",
  clearedSub:"Cleared from Mistakes.", streakSub:"One more correct answer clears it.", fixedSub:"Fixed — removed from this part's wrong list.",
  why:"Why this answer", trick:"Memory trick", flag:"Flag", flagged:"Flagged",
  caseStudy:"Case study / scenario (tap to read)",
  question:"Question",
  exitQ:"Leave this session?", exitD:"Answers already checked are saved. A mock exam that is not submitted is not scored.",
  stay:"Stay", leave:"Leave", close:"Close",
  savedPart:"Saved. Resume this part any time.",
  submitQ:"Submit now?", submitD:"{u} questions are unanswered. They will count as wrong.",
  resTitlePass:"Passed", resTitleFail:"Keep practicing", resTitle:"Session complete", resPart:"Part {n} complete", resFix:"Fix round complete",
  resLine:"{c} of {t} correct · pass mark {p}%", resLine2:"{c} of {t} correct",
  retryWrong:"Retake wrong ({n})", again:"New set", toExam:"Back to exam", nextPart:"Next part", allParts:"All parts",
  byDomain:"Score by topic", review:"Review wrong answers", yourAns:"Your answer", rightAns:"Correct answer", noAns:"Not answered",
  perfect:"No mistakes in this session.", fixLeft:"{n} still wrong in this part.", fixDone:"Every question in this part is now fixed.",
  misEmpty:"No mistakes right now.", flagEmpty:"Nothing flagged yet.",
  cardFront:"Think of the answer, then tap to flip", cardBack:"Answer",
  gotIt:"Got it", againBtn:"Review again",
  cardsDone:"Deck finished", cardsLine:"{g} known · {a} sent to Mistakes",
  mastered:"Mastered! Removed from Mistakes.",
  nav:"Jump to question", navOpen:"Jump",
  themeAuto:"System theme", themeLight:"Light theme", themeDark:"Dark theme",
  kb:"1–6 select · Enter check/next · F flag",
  unseen:"new",
  footer:"Explanations and memory tricks are study aids — check official docs for edge cases. Progress lives in this browser only."
};
const t = (k, vars) => { let s = STR[k] ?? k; if(vars) for(const [a,b] of Object.entries(vars)) s = s.replaceAll("{"+a+"}", b); return s; };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`([^`\n]+)`/g,"<code>$1</code>");
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const mobile = () => matchMedia("(max-width: 959px)").matches;
const app = $("#app");

/* ---------- data ---------- */
const EX = {};
for(const e of DATA.exams){ EX[e.id]=e; e.byId={}; for(const q of e.qs) e.byId[q.id]=q; e.col = VCOL[e.vendor] || "#FF7A3D"; }

/* ---------- state ---------- */
const KEY = "certdojo.v1";
const DEF = () => ({v:1, ts:0, theme:"auto", size:20, shuffle:false, newFirst:true, partFb:"end", rail:false, ex:{}});
let S = DEF();
try{ const raw = localStorage.getItem(KEY); if(raw){ const p = JSON.parse(raw); if(p && p.v===1) S = Object.assign(S,p); } }catch(e){}
let saveT = null;
function save(now){ S.ts = Date.now(); clearTimeout(saveT); const w=()=>{ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }; if(now) w(); else saveT=setTimeout(w,120); }
addEventListener("pagehide", ()=>save(true));
const exS = id => { const s = (S.ex[id] ||= {att:{}, mis:{}, flag:{}, hist:[]}); s.att ||= {}; s.mis ||= {}; s.flag ||= {}; s.hist ||= []; return s; };
const partS = id => { const s = exS(id); const p = (s.parts ||= {size:0, mix:false, seed:1, res:{}, live:{}}); p.res ||= {}; p.live ||= {}; return p; };
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
function seeded(a, seed){ let s = seed>>>0 || 1; const r = () => { s = (s + 0x6D2B79F5)>>>0; let x = s; x = Math.imul(x ^ x>>>15, x | 1); x ^= x + Math.imul(x ^ x>>>7, x | 61); return ((x ^ x>>>14)>>>0) / 4294967296; }; a=[...a]; for(let i=a.length-1;i>0;i--){ const j=r()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }

function stats(id){
  const e=EX[id], st=exS(id); let seen=0, c=0, w=0;
  for(const q of e.qs){ const a=st.att[q.id]; if(a){ seen++; c+=a[0]; w+=a[1]; } }
  const mis = Object.keys(st.mis).filter(k=>e.byId[k]).length;
  const flag = Object.keys(st.flag).filter(k=>e.byId[k]).length;
  return {seen, total:e.qs.length, acc:(c+w)?Math.round(100*c/(c+w)):null, mis, flag};
}
function partSize(id){ const e=EX[id], p=partS(id); return clamp(p.size || Math.min(50, e.qs.length), 1, e.qs.length); }
function partsOf(id){
  const e=EX[id], p=partS(id), n=partSize(id);
  let ids = e.qs.map(q=>q.id); if(p.mix) ids = seeded(ids, p.seed);
  const out=[]; for(let i=0;i<ids.length;i+=n) out.push(ids.slice(i,i+n));
  return out;
}

/* ---------- small UI helpers ---------- */
const IC = {
  study:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 7h6"/></svg>',
  practice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  mock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
  mis:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
  cards:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 6V4h14v14h-4"/></svg>',
  parts:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  auto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
  light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  dark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'
};
function ring(pct, label, size=58, cls="ring"){
  const r=(size-8)/2, C=2*Math.PI*r, off=C*(1-pct/100);
  return `<svg class="${cls}" viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px" aria-hidden="true"><circle class="bg" cx="${size/2}" cy="${size/2}" r="${r}"/><circle class="fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${off}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${label}</text></svg>`;
}
const animateRings = (root=document) => requestAnimationFrame(()=>requestAnimationFrame(()=>$$("circle[data-off]",root).forEach(c=>c.style.strokeDashoffset=c.dataset.off)));
function toast(msg){ $$(".toast").forEach(x=>x.remove()); const d=document.createElement("div"); d.className="toast"; d.setAttribute("role","status"); d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),2900); }
function modal(title, body, actions){
  const sc=document.createElement("div"); sc.className="scrim";
  sc.innerHTML=`<div class="modal glass" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3>${body?`<div>${body}</div>`:""}<div class="acts"></div></div>`;
  const acts=$(".acts",sc);
  actions.forEach(a=>{ const b=document.createElement("button"); b.className="btn "+(a.cls||""); b.textContent=a.label; b.onclick=()=>{ sc.remove(); a.fn&&a.fn(); }; acts.appendChild(b); });
  sc.addEventListener("click",e=>{ if(e.target===sc){ sc.remove(); actions.find(a=>a.dismiss)?.fn?.(); } });
  document.body.appendChild(sc); $(".acts .btn:last-child",sc)?.focus();
  return sc;
}
function countUp(el, to, ms=1100){ if(reduced){ el.textContent=to; return; } const st=performance.now(); const f=n=>{ const p=Math.min(1,(n-st)/ms); el.textContent=Math.round(to*(1-Math.pow(1-p,3))).toLocaleString("en-US"); if(p<1) requestAnimationFrame(f); }; requestAnimationFrame(f); }

/* ---------- theme ---------- */
function applyTheme(){
  const r=document.documentElement;
  if(S.theme==="auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme",S.theme);
  $("#themeSeg").innerHTML = ["auto","light","dark"].map(m=>`<button data-th="${m}" aria-pressed="${S.theme===m}" title="${esc(t(m==="auto"?"themeAuto":m==="light"?"themeLight":"themeDark"))}" aria-label="${esc(t(m==="auto"?"themeAuto":m==="light"?"themeLight":"themeDark"))}">${IC[m]}</button>`).join("");
  // in the collapsed rail only the active theme shows, so a click cycles
  $$("#themeSeg button").forEach(b=>b.onclick=()=>{ S.theme = (document.body.classList.contains("rail") && !mobile()) ? {auto:"light",light:"dark",dark:"auto"}[S.theme] : b.dataset.th; save(); applyTheme(); });
}

/* ---------- sidebar ---------- */
function activeKey(){ if(VIEW.name==="home") return "home"; return VIEW.name==="exam" ? VIEW.arg : SESSION?.id || VIEW.arg?.id || "home"; }
function renderSide(){
  const act = activeKey();
  const items = DATA.exams.map(e=>{ const s=stats(e.id); const pct=Math.round(100*s.seen/s.total);
    return `<button class="nav-item ${act===e.id?"active":""}" data-ex="${e.id}" style="--v:${e.col}" title="${esc(e.code+" · "+e.title)}">
      <span class="nav-ic">${esc(e.code)}</span>
      <span class="nav-t"><b>${esc(e.title.replace(/^Claude Certified /,""))}</b><span class="nav-bar"><i style="width:${pct}%"></i></span></span>
      ${s.mis?`<span class="nav-badge" title="${s.mis} ${esc(t("mis"))}">${s.mis}</span>`:BADGE[e.id]?`<span class="nav-badge new">${esc(BADGE[e.id].toUpperCase())}</span>`:""}
    </button>`; }).join("");
  const ind = k => { const p=LASTIND[k]; return p ? `<span class="nav-ind" style="transform:translateY(${p.y}px);height:${p.h}px;opacity:${p.o}"></span>` : `<span class="nav-ind"></span>`; };
  $("#sideNav").innerHTML = `
    <div class="nav" id="navA">${ind("navA")}
      <button class="nav-item ${act==="home"?"active":""}" data-home><span class="nav-ic">${IC.home}</span><span class="nav-t"><b>${esc(t("overview"))}</b><small>${DATA.exams.reduce((n,e)=>n+e.qs.length,0).toLocaleString("en-US")} ${esc(t("qs"))}</small></span></button>
    </div>
    <div class="side-sec">${esc(t("exams"))}</div>
    <div class="nav" id="navB">${ind("navB")}${items}</div>`;
  $$("#sideNav [data-ex]").forEach(b=>b.onclick=()=>leaveGuard(()=>go("exam",b.dataset.ex)));
  $("#sideNav [data-home]").onclick=()=>leaveGuard(()=>go("home"));
  requestAnimationFrame(placeInd);
}
// the sliding indicator remembers where it was so it glides between items across re-renders
const LASTIND={};
function placeInd(){
  for(const nav of $$("#sideNav .nav")){
    const ind=$(".nav-ind",nav), a=$(".nav-item.active",nav), last=LASTIND[nav.id]||{y:0,h:0,o:0};
    const p = a ? {y:a.offsetTop, h:a.offsetHeight, o:1} : {y:last.y, h:last.h, o:0};
    ind.style.opacity=p.o; ind.style.height=p.h+"px"; ind.style.transform=`translateY(${p.y}px)`;
    LASTIND[nav.id]=p;
  }
}
function openSide(on){ document.body.classList.toggle("side-open",on); $("#burger").setAttribute("aria-expanded",on); }
$("#burger").onclick=()=>openSide(!document.body.classList.contains("side-open"));
$("#sideScrim").onclick=()=>openSide(false);
$("#railBtn").onclick=()=>{ if(mobile()){ openSide(false); return; } S.rail=!S.rail; save(); document.body.classList.toggle("rail",S.rail); $("#railBtn").setAttribute("aria-label",S.rail?"Expand sidebar":"Collapse sidebar"); setTimeout(placeInd,460); };
$("#homeBtn").onclick=()=>leaveGuard(()=>go("home"));

/* pointer glow + card spotlight / tilt */
if(fine && !reduced){
  const g=$("#glow"); let gx=0, gy=0, tx=0, ty=0, raf=0;
  const loop=()=>{ gx+=(tx-gx)*.12; gy+=(ty-gy)*.12; g.style.transform=`translate3d(${gx}px,${gy}px,0)`; raf = (Math.abs(tx-gx)+Math.abs(ty-gy) > .5) ? requestAnimationFrame(loop) : 0; };
  addEventListener("pointermove", e=>{ tx=e.clientX; ty=e.clientY; document.body.classList.add("pointer"); if(!raf) raf=requestAnimationFrame(loop);
    const c=e.target.closest?.(".sheet"); if(c){ const r=c.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height; c.style.setProperty("--mx",x*100+"%"); c.style.setProperty("--my",y*100+"%"); c.style.transform=`perspective(900px) rotateX(${(.5-y)*5}deg) rotateY(${(x-.5)*6}deg) translateY(-4px)`; } }, {passive:true});
  addEventListener("pointerout", e=>{ const c=e.target.closest?.(".sheet"); if(c && !c.contains(e.relatedTarget)) c.style.transform=""; }, {passive:true});
  document.addEventListener("mouseleave", ()=>document.body.classList.remove("pointer"));
}

/* ---------- confetti ---------- */
const fx=$("#fx"), fctx=fx.getContext("2d"); let parts=[], fxRun=false;
function burst(x,y,n=46){
  if(reduced) return;
  const dpr=devicePixelRatio||1; fx.width=innerWidth*dpr; fx.height=innerHeight*dpr; fctx.setTransform(dpr,0,0,dpr,0,0);
  const cs=getComputedStyle(document.documentElement); const cols=["--accent","--accent-2","--ok","--accent-3"].map(v=>cs.getPropertyValue(v).trim());
  for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=3+Math.random()*6; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,r:Math.random()*360,vr:(Math.random()-.5)*16,s:4+Math.random()*5,c:cols[i%cols.length],l:1}); }
  if(!fxRun){ fxRun=true; requestAnimationFrame(fxLoop); }
}
function fxLoop(){
  fctx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.l>0);
  for(const p of parts){ p.vy+=.22; p.vx*=.985; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.l-=.012;
    fctx.save(); fctx.globalAlpha=Math.max(0,p.l); fctx.translate(p.x,p.y); fctx.rotate(p.r*Math.PI/180); fctx.fillStyle=p.c; fctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); fctx.restore(); }
  if(parts.length) requestAnimationFrame(fxLoop); else { fxRun=false; fctx.clearRect(0,0,innerWidth,innerHeight); }
}

/* ---------- hero demo: a live "Practice → Fail → Fix it" loop on real questions ---------- */
let heroStop=null;
function demoPool(){
  const out=[];
  for(const e of DATA.exams) for(const q of e.qs){
    if(q.a.length!==1 || q.o.length<3 || q.o.length>4) continue;
    const x=q.x.trim(); if(x.length<40 || x.length>150 || /\n|CASE STUDY|HOTSPOT/.test(x)) continue;
    if(q.o.some(o=>o.length<3 || o.length>64)) continue;
    out.push({e,q});
  }
  return shuffle(out);
}
const DEMO_HTML = `<div class="demo" role="img" aria-label="Animated preview: answer a question, get it wrong, then fix it">
  <div class="demo-stage">
    <div class="dcard b2"></div><div class="dcard b1"></div>
    <div class="dcard front" id="dFront"></div>
    <div class="dcursor"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5 19.5 12l-6.6 1.6 3.6 7-2.9 1.4-3.5-7.1L5 19.6z"/></svg></div>
    <div class="dtoast"></div>
  </div>
  <div class="dsteps"><span data-s="practice">1 · Practice</span><i></i><span data-s="fail">2 · Fail</span><i></i><span data-s="fix">3 · Fix it</span></div>
</div>`;
function heroDemo(root){
  if(!root) return ()=>{};
  const stage=$(".demo-stage",root), front=$("#dFront",root), cur=$(".dcursor",root), tst=$(".dtoast",root), steps=$$(".dsteps [data-s]",root);
  const pool=demoPool(); let alive=true, timer=0, n=0;
  const wait=ms=>new Promise(r=>{ timer=setTimeout(r,ms); });
  const visible=()=>new Promise(r=>{ if(!document.hidden) return r(); const f=()=>{ if(!document.hidden){ document.removeEventListener("visibilitychange",f); r(); } }; document.addEventListener("visibilitychange",f); });
  const step=s=>steps.forEach(x=>x.classList.toggle("on",x.dataset.s===s));
  const say=(msg,cls)=>{ tst.className="dtoast "+cls; tst.textContent=msg; void tst.offsetWidth; tst.classList.add("show"); };
  // local (untransformed) offset so the cursor lands right even while the stage is tilted
  const local=el=>{ let x=0,y=0; while(el && el!==stage){ x+=el.offsetLeft; y+=el.offsetTop; el=el.offsetParent; } return {x,y}; };
  const point=el=>{ const o=local(el); cur.style.opacity=1; cur.style.transform=`translate(${o.x+el.offsetWidth*.7}px,${o.y+el.offsetHeight*.55}px)`; };
  const click=()=>{ cur.classList.remove("click"); void cur.offsetWidth; cur.classList.add("click"); };
  const mis=(v,cls)=>{ const m=$(".dmis",front); m.className="dmis "+cls; $("b",m).textContent=v; };
  function fill({e,q}){
    front.style.setProperty("--v",e.col);
    front.innerHTML=`<div class="dhead"><span class="code">${esc(e.code)}</span><span class="dq tab">Question ${n}</span><span class="dmis">Mistakes <b>0</b></span></div>
      <p class="dstem">${md(q.x)}</p>
      <div class="dopts">${q.o.map((o,i)=>`<div class="dopt" style="--i:${i}" data-oi="${i}"><b>${LET[i]}</b><span>${md(o)}</span></div>`).join("")}</div>`;
  }
  async function run(){
    let i=0;
    while(alive){
      await visible(); if(!alive) return;
      const item=pool[i++ % pool.length]; n++;
      front.style.transition="none"; front.classList.remove("out","shake","retry","enter"); void front.offsetWidth; front.style.transition="";
      fill(item); front.classList.add("enter");
      cur.style.opacity=0; tst.classList.remove("show"); step("practice");
      await wait(1700); if(!alive) return;
      // drop the entrance class once it has played, otherwise removing .shake later re-triggers it
      front.classList.remove("enter");
      const opts=$$(".dopt",front), right=opts.find(o=>item.q.a.includes(+o.dataset.oi)), wrongs=opts.filter(o=>o!==right), wrong=wrongs[Math.random()*wrongs.length|0];
      point(wrong); await wait(900); if(!alive) return;
      click(); wrong.classList.add("wrong"); front.classList.add("shake"); mis(1,"bad"); step("fail"); say("✕  Wrong — added to Mistakes","bad");
      await wait(1900); if(!alive) return;
      tst.classList.remove("show"); front.classList.remove("shake"); front.classList.add("retry"); wrong.classList.replace("wrong","was");
      $(".dq",front).textContent="↺ Retry"; cur.style.opacity=0;
      await wait(1000); if(!alive) return;
      step("fix"); point(right); await wait(900); if(!alive) return;
      click(); right.classList.add("right"); mis(0,"ok"); say("✓  Fixed — cleared from Mistakes","ok");
      const r=right.getBoundingClientRect(); burst(r.left+r.width*.7, r.top+r.height/2, 20);
      await wait(2000); if(!alive) return;
      cur.style.opacity=0; tst.classList.remove("show"); front.classList.add("out");
      await wait(650);
    }
  }
  if(!pool.length) return ()=>{};
  if(reduced){ n=1; fill(pool[0]); const r=$$(".dopt",front).find(o=>pool[0].q.a.includes(+o.dataset.oi)); r&&r.classList.add("right"); steps.forEach(x=>x.classList.add("on")); }
  else run();
  const hero=root.closest(".hero");
  const tilt=ev=>{ const r=stage.getBoundingClientRect(); const x=clamp((ev.clientX-(r.left+r.width/2))/r.width,-1,1), y=clamp((ev.clientY-(r.top+r.height/2))/r.height,-1,1); stage.style.transform=`rotateY(${x*9}deg) rotateX(${-y*7}deg)`; };
  const untilt=()=>{ stage.style.transform=""; };
  if(fine && !reduced && hero){ hero.addEventListener("pointermove",tilt); hero.addEventListener("pointerleave",untilt); }
  return ()=>{ alive=false; clearTimeout(timer); if(hero){ hero.removeEventListener("pointermove",tilt); hero.removeEventListener("pointerleave",untilt); } };
}

/* ---------- routing ---------- */
let VIEW={name:"home"}, SESSION=null, hashLock=false;
function hashFor(name,arg){ if(name==="home") return "#/"; if(name==="exam") return "#/exam/"+arg; return "#/exam/"+(SESSION?.id||arg?.id||"")+"/"+name; }
function setHash(h){ if(location.hash!==h){ hashLock=true; location.hash=h; } }
function parseHash(){ const h=location.hash.replace(/^#\/?/,"").split("/"); if(h[0]==="exam" && EX[h[1]]) return {name:"exam",arg:h[1]}; return {name:"home"}; }
addEventListener("hashchange",()=>{
  if(hashLock){ hashLock=false; return; }
  const r=parseHash(), cur=hashFor(VIEW.name,VIEW.arg);
  if(live()){ leaveGuard(()=>go(r.name,r.arg), ()=>setHash(cur)); return; }
  go(r.name,r.arg);
});
function viewAnim(){ if(reduced) return; app.classList.remove("vt"); void app.offsetWidth; app.classList.add("vt"); }
function go(name, arg){
  if(heroStop){ heroStop(); heroStop=null; }
  if(!["run","cards","results"].includes(name)) SESSION=null;
  VIEW={name,arg}; setHash(hashFor(name,arg)); openSide(false);
  window.scrollTo({top:0}); viewAnim(); route();
}
function route(){
  if(VIEW.name==="home") renderHome(); else if(VIEW.name==="exam") renderExam(VIEW.arg); else if(VIEW.name==="run") renderRun(); else if(VIEW.name==="results") renderResults(VIEW.arg); else if(VIEW.name==="cards") renderCards();
  renderSide();
}
const live = () => SESSION && (VIEW.name==="run"||VIEW.name==="cards") && !SESSION.done;
function leaveGuard(fn, onStay){
  if(!live()){ fn(); return; }
  if(SESSION.mode==="part"){ persistLive(); stopTimer(); toast(t("savedPart")); fn(); return; }
  modal(t("exitQ"), `<p>${esc(t("exitD"))}</p>`, [{label:t("stay"),cls:"ghost",fn:onStay,dismiss:true},{label:t("leave"),cls:"primary",fn:()=>{ stopTimer(); fn(); }}]);
}

/* ---------- home ---------- */
function renderHome(){
  let tq=0, tm=0, tseen=0; for(const e of DATA.exams){ const s=stats(e.id); tq+=s.total; tm+=s.mis; tseen+=s.seen; }
  const conts=[]; for(const e of DATA.exams){ const p=partS(e.id); const ps=partsOf(e.id); for(const [k,l] of Object.entries(p.live)){ const ids=ps[+k]; if(!ids) continue; const n=ids.length, a=Object.keys(l.ans||{}).length; conts.push({e,k:+k,n,a,at:l.at||0}); } }
  conts.sort((a,b)=>b.at-a.at);
  app.innerHTML = `<div class="wrap">
  <section class="hero glass reveal"><div class="hero-in"><div class="hero-copy">
    <div class="eyebrow"><i></i>${esc(t("eyebrow"))}</div>
    <h1><span class="w">${esc(t("h1a"))}</span> <span class="w grad">${esc(t("h1b"))}</span> <span class="w">${esc(t("h1c"))}</span></h1>
    <p class="lead">${esc(t("lead"))}</p>
    <div class="statstrip">
      <div class="stat glass-2 reveal" style="--i:2"><b class="tab" data-cu="${tq}">${tq}</b><span>${esc(t("sQ"))}</span></div>
      <div class="stat glass-2 reveal" style="--i:3"><b class="tab">${DATA.exams.length}</b><span>${esc(t("sExams"))}</span></div>
      <div class="stat glass-2 reveal" style="--i:4"><b class="tab" data-cu="${tseen}">${tseen}</b><span>${esc(t("sDone"))}</span></div>
      <div class="stat glass-2 reveal ${tm?"hot":""}" style="--i:5"><b class="tab" data-cu="${tm}">${tm}</b><span>${esc(t("sMis"))}</span></div>
    </div>
  </div>${DEMO_HTML}</div></section>
  ${conts.length?`<section class="section"><div class="sh"><div><h2>${esc(t("cont"))}</h2><p>${esc(t("contSub"))}</p></div></div>
    <div class="cont">${conts.slice(0,6).map((c,i)=>`<button class="glass reveal" style="--i:${i};--v:${c.e.col}" data-cx="${c.e.id}" data-ck="${c.k}">${ring(Math.round(100*c.a/c.n), c.a, 44, "ring mini")}<span><b>${esc(c.e.code)} · ${esc(t("partN",{n:c.k+1}))}</b><small class="tab">${c.a}/${c.n} ${esc(t("answered"))}</small></span><span class="pill acc">${IC.play.replace('<svg','<svg width="12" height="12"')} Resume</span></button>`).join("")}</div></section>`:""}
  <section class="section"><div class="sh"><div><h2>${esc(t("pick"))}</h2><p>${esc(t("pickSub"))}</p></div></div>
    <div class="grid">${DATA.exams.map((e,i)=>{ const s=stats(e.id); const pct=Math.round(100*s.seen/s.total);
      return `<button class="sheet glass reveal" data-ex="${e.id}" style="--i:${i};--v:${e.col}">
        <div class="sheet-top"><span class="code">${esc(e.code)}</span><span class="vendor">${esc(e.vendor)}</span>${BADGE[e.id]?`<span class="badge">${esc(BADGE[e.id])}</span>`:""}</div>
        <h3>${esc(e.title)}</h3>
        ${e.desc?`<p class="desc">${esc(e.desc)}</p>`:""}
        <div class="row">${ring(pct, pct+"%")}
          <div class="meta"><span><b class="tab">${s.total}</b> ${esc(t("qs"))} · ${e.exam.minutes} ${esc(t("min"))}</span><span><b class="tab">${s.seen}</b> ${esc(t("answered"))}${s.acc!=null?` · <b class="tab">${s.acc}%</b> ${esc(t("acc"))}`:""}</span>
          ${s.mis?`<span><span class="pill bad">${s.mis} ${esc(t("mis"))}</span></span>`:""}</div>
        </div><span class="go">${IC.arrow}</span></button>`; }).join("")}</div>
  </section>
  <footer class="credit">${esc(t("footer"))}</footer></div>`;
  $$(".sheet").forEach(b=>b.onclick=()=>go("exam", b.dataset.ex));
  $$("[data-cx]").forEach(b=>b.onclick=()=>startMode(b.dataset.cx,"part",{part:+b.dataset.ck}));
  $$("[data-cu]").forEach(el=>countUp(el, +el.dataset.cu));
  animateRings(app);
  heroStop = heroDemo($(".demo"));
}

/* ---------- exam view ---------- */
let DOMSEL={};
function filtered(id){ const e=EX[id]; const sel=DOMSEL[id]||[]; return sel.length ? e.qs.filter(q=>sel.includes(q.d)) : e.qs; }
function modeBtn(m, title, desc, disabled=false, hot=false, i=0){ return `<button class="mode glass reveal ${hot?"hot":""}" style="--i:${i}" data-mode="${m}" ${disabled?"disabled":""}><span class="ic">${IC[m]}</span><b>${esc(title)}</b><span>${esc(desc)}</span></button>`; }
function modeName(h){ const m = typeof h==="string" ? h : h.m; if(m==="part") return t("partN",{n:(h.p??0)+1}); if(m==="fix") return t("partN",{n:(h.p??0)+1})+" · fix"; return {study:t("mStudy"),practice:t("mPractice"),mock:t("mMock"),mis:t("mMis"),flag:t("mFlag"),cards:t("mCards"),retry:"Retake wrong"}[m]||m; }

function partsHTML(id){
  const e=EX[id], p=partS(id), ps=partsOf(id), n=partSize(id);
  const presets=[25,50,60,100].filter(x=>x<e.qs.length);
  const cards = ps.map((ids,k)=>{
    const r=p.res[k], l=p.live[k]; const a=l?Object.keys(l.ans||{}).length:0;
    const wrong=r?r.wrong.filter(x=>e.byId[x]).length:0;
    const cls = l ? "is-live" : r && !wrong ? "is-clean" : "";
    const start = k*n+1, end = k*n+ids.length;
    let stat = l ? `<span class="pill acc">${esc(t("inProgress"))}</span>` : r ? `<span class="pill ${r.best>=e.exam.passPercent?"ok":""}">${esc(t("best",{p:r.best}))}</span><span class="pill">${esc(t("last",{p:r.last}))}</span>` : `<span class="pill">${esc(t("notStarted"))}</span>`;
    const pct = l ? Math.round(100*a/ids.length) : r ? r.last : 0;
    return `<div class="part glass-2 reveal ${cls}" style="--i:${k}">
      <div class="ptop">${ring(pct, r&&!l?r.last+"%":l?a:"–", 50, "ring mini")}<div><div class="pno">${esc(t("partN",{n:k+1}))}</div><div class="prange tab">${esc(t("partRange",{a:start,b:end}))} · ${esc(t("partQs",{n:ids.length}))}</div></div></div>
      <div class="pstat">${stat}</div>
      <div class="pact">
        <button class="btn sm ${l||!r?"primary":""}" data-part="${k}">${IC.play} ${esc(l?t("resume",{a,n:ids.length}):r?t("retake"):t("start"))}</button>
        ${r&&!l?(wrong?`<button class="btn sm fix" data-fix="${k}">${IC.mis} ${esc(t("fixN",{n:wrong}))}</button>`:`<span class="pill ok">✓ ${esc(t("allFixed"))}</span>`):""}
      </div></div>`;
  }).join("");
  const segs = ps.map((ids,k)=>{ const r=p.res[k], l=p.live[k]; const w=r?r.wrong.filter(x=>e.byId[x]).length:0; return `<i style="--i:${k};flex:${ids.length}" class="${l?"live":r?(w?"done":"clean"):""}" title="${esc(t("partN",{n:k+1}))}"></i>`; }).join("");
  return `<section class="panel glass reveal" style="--i:1" id="partsPanel">
    <div class="ph"><span class="ic">${IC.parts}</span><div><h3>${esc(t("partsT"))}</h3><p>${esc(t("partsD",{n:e.qs.length}))}</p></div></div>
    <div class="pctl">
      <div class="field">${esc(t("perPart"))}<div class="stepper"><button data-step="-5" aria-label="Minus 5">−</button><input id="psz" type="number" inputmode="numeric" min="5" max="${e.qs.length}" value="${n}" aria-label="${esc(t("perPart"))}"><button data-step="5" aria-label="Plus 5">+</button></div></div>
      <div class="field">&nbsp;<div class="chips">${presets.map(x=>`<button class="chip" data-psz="${x}" aria-pressed="${n===x}">${x}</button>`).join("")}<button class="chip" data-psz="${e.qs.length}" aria-pressed="${n===e.qs.length}">${esc(t("all"))}<small>${e.qs.length}</small></button></div></div>
      <div class="field">${esc(t("feedback"))}<div class="seg" id="pfb"><button data-fb="end" aria-pressed="${S.partFb!=="instant"}">${esc(t("fbEnd"))}</button><button data-fb="instant" aria-pressed="${S.partFb==="instant"}">${esc(t("fbNow"))}</button></div></div>
      <label class="tgl"><input type="checkbox" class="toggle" id="pmix" ${p.mix?"checked":""}> ${esc(t("mix"))}</label>
    </div>
    <div class="splitbar" aria-hidden="true">${segs}</div>
    <div class="splitlegend"><span>${ps.length} parts</span><span class="tab">${e.qs.length} ${esc(t("qs"))}</span></div>
    <div class="pgrid">${cards}</div>
  </section>`;
}
function renderExam(id){
  const e=EX[id], s=stats(id), st=exS(id); DOMSEL[id] ||= [];
  const doms = Object.entries(e.domains).map(([k,v])=>[k,v,e.qs.filter(q=>q.d===k).length]).filter(x=>x[2]>0);
  const pool = filtered(id);
  const unseen = pool.filter(q=>!st.att[q.id]).length;
  const psize = S.size ? Math.min(S.size,pool.length) : pool.length;
  app.innerHTML = `<div class="wrap" style="--v:${e.col}">
    <div class="ehead glass reveal">
      <button class="back" id="bk">← ${esc(t("back"))}</button>
      <span class="code" style="justify-self:start">${esc(e.code)} · ${esc(e.vendor)}</span>
      <h1>${esc(e.title)}</h1>
      ${e.desc?`<p class="desc">${esc(e.desc)}</p>`:""}
      <div class="facts">
        <span class="pill tab">${s.total} ${esc(t("qs"))}</span>
        <span class="pill tab">Exam: ${e.exam.count} ${esc(t("qs"))} · ${e.exam.minutes} ${esc(t("min"))} · ${esc(t("pass"))} ${e.exam.passPercent}%</span>
        <span class="pill tab">${s.seen}/${s.total} ${esc(t("answered"))}</span>
        ${s.acc!=null?`<span class="pill ok tab">${s.acc}% ${esc(t("acc"))}</span>`:""}
        ${s.mis?`<span class="pill bad tab">${s.mis} ${esc(t("mis"))}</span>`:""}
      </div>
    </div>
    ${partsHTML(id)}
    <section class="section" style="padding-top:26px"><div class="sh"><div><h2>${esc(t("otherModes"))}</h2></div></div>
    <div class="modes">
      ${modeBtn("practice", t("mPractice"), t("mPracticeD",{n:psize})+(unseen?` · ${unseen} ${t("unseen")}`:""),false,false,0)}
      ${modeBtn("mock", t("mMock"), `${t("mMockD")} (${Math.min(e.exam.count,e.qs.length)} ${t("qs")}, ${e.exam.minutes} ${t("min")})`,false,false,1)}
      ${modeBtn("mis", t("mMis")+(s.mis?` (${s.mis})`:""), s.mis?t("mMisD"):t("misEmpty"), !s.mis, s.mis>0,2)}
      ${modeBtn("study", t("mStudy"), t("mStudyD"),false,false,3)}
      ${modeBtn("cards", t("mCards"), t("mCardsD"),false,false,4)}
      ${modeBtn("flag", t("mFlag")+(s.flag?` (${s.flag})`:""), s.flag?t("mFlagD"):t("flagEmpty"), !s.flag,false,5)}
    </div></section>
    ${doms.length>1?`<div class="panel glass reveal" style="--i:2"><h4>${esc(t("domains"))}</h4><div class="chips">
      <button class="chip" data-dom="" aria-pressed="${!DOMSEL[id].length}">${esc(t("allDomains"))}<small>${e.qs.length}</small></button>
      ${doms.map(([k,v,n])=>`<button class="chip" data-dom="${esc(k)}" aria-pressed="${DOMSEL[id].includes(k)}">${esc(v)}<small>${n}</small></button>`).join("")}
    </div><p class="note">${esc(t("partsNote"))}</p></div>`:""}
    <div class="panel glass reveal" style="--i:3"><h4>${esc(t("settings"))}</h4><div class="opts">
      <div class="field">${esc(t("size"))}<div class="stepper"><button data-sstep="-5" aria-label="Minus 5">−</button><input id="sz" type="number" inputmode="numeric" min="1" max="${pool.length}" value="${psize}" aria-label="${esc(t("size"))}"><button data-sstep="5" aria-label="Plus 5">+</button></div></div>
      <label class="tgl"><input type="checkbox" class="toggle" id="nf" ${S.newFirst?"checked":""}> ${esc(t("newFirst"))}</label>
      <label class="tgl"><input type="checkbox" class="toggle" id="sh" ${S.shuffle?"checked":""}> ${esc(t("shuffle"))}</label>
    </div></div>
    <div class="panel glass reveal" style="--i:4"><h4>${esc(t("history"))}</h4>${st.hist.length?`<div class="hist">${st.hist.slice(0,10).map(h=>`<div><span>${esc(modeName(h))} · ${new Date(h.at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span><b class="tab">${h.c}/${h.n}</b><span class="pill ${h.n&&h.c/h.n*100>=e.exam.passPercent?"ok":"bad"} tab">${h.n?Math.round(100*h.c/h.n):0}%</span></div>`).join("")}</div>`:`<p class="empty">${esc(t("noHist"))}</p>`}
      <div style="margin-top:16px"><button class="btn sm danger" id="rst">${esc(t("reset"))}</button></div></div>
    <div style="height:70px"></div>
  </div>`;
  $("#bk").onclick=()=>go("home");
  $$(".mode").forEach(b=>b.onclick=()=>startMode(id,b.dataset.mode));
  $$(".chip[data-dom]").forEach(c=>c.onclick=()=>{ const d=c.dataset.dom; if(!d) DOMSEL[id]=[]; else { const a=DOMSEL[id]; DOMSEL[id]=a.includes(d)?a.filter(x=>x!==d):[...a,d]; } keepScroll(()=>renderExam(id)); });
  // practice size
  const sz=$("#sz"); const setSize=v=>{ v=clamp(Math.round(+v||1),1,pool.length); S.size = v>=pool.length?0:v; save(); keepScroll(()=>renderExam(id)); };
  sz.onchange=()=>setSize(sz.value); sz.onkeydown=ev=>{ if(ev.key==="Enter") sz.blur(); };
  $$("[data-sstep]").forEach(b=>b.onclick=()=>setSize((+sz.value||0)+(+b.dataset.sstep)));
  $("#nf").onchange=ev=>{ S.newFirst=ev.target.checked; save(); };
  $("#sh").onchange=ev=>{ S.shuffle=ev.target.checked; save(); };
  $("#rst").onclick=()=>modal(t("resetQ"), `<p>${esc(t("resetD"))}</p>`, [{label:t("cancel"),cls:"ghost"},{label:t("confirm"),cls:"danger",fn:()=>{ S.ex[id]={att:{},mis:{},flag:{},hist:[]}; save(); renderExam(id); renderSide(); }}]);
  bindParts(id);
  animateRings(app);
}
function keepScroll(fn){ const y=scrollY; fn(); scrollTo({top:y}); $$(".reveal",app).forEach(x=>x.style.animation="none"); }
function bindParts(id){
  const e=EX[id], p=partS(id);
  const hasProgress = () => Object.keys(p.res).length || Object.keys(p.live).length;
  const apply = (fn, q, d) => { if(hasProgress()) modal(q, `<p>${esc(d)}</p>`, [{label:t("cancel"),cls:"ghost",fn:()=>keepScroll(()=>renderExam(id)),dismiss:true},{label:t("change"),cls:"primary",fn:()=>{ fn(); p.res={}; p.live={}; save(); keepScroll(()=>renderExam(id)); renderSide(); }}]); else { fn(); save(); keepScroll(()=>renderExam(id)); } };
  const setPS = v => { v=clamp(Math.round(+v||0),5,e.qs.length); if(v===partSize(id)){ $("#psz").value=v; return; } apply(()=>{ p.size=v; }, t("resizeQ"), t("resizeD")); };
  const inp=$("#psz");
  inp.onchange=()=>setPS(inp.value); inp.onkeydown=ev=>{ if(ev.key==="Enter") inp.blur(); };
  $$("[data-step]").forEach(b=>b.onclick=()=>setPS((+inp.value||0)+(+b.dataset.step)));
  $$("[data-psz]").forEach(b=>b.onclick=()=>setPS(+b.dataset.psz));
  $$("#pfb button").forEach(b=>b.onclick=()=>{ S.partFb=b.dataset.fb; save(); $$("#pfb button").forEach(x=>x.setAttribute("aria-pressed",x===b)); });
  $("#pmix").onchange=ev=>{ const on=ev.target.checked; apply(()=>{ p.mix=on; p.seed=(Math.random()*1e9)|0; }, t("remixQ"), t("remixD")); };
  $$("[data-part]").forEach(b=>b.onclick=()=>startMode(id,"part",{part:+b.dataset.part}));
  $$("[data-fix]").forEach(b=>b.onclick=()=>startMode(id,"fix",{part:+b.dataset.fix}));
}

/* ---------- sessions ---------- */
function permFor(q){ return (S.shuffle && !q.ns && !/\b(both|all of the|none of the|[A-F] and [A-F])\b/i.test(q.o.join(" "))) ? shuffle(q.o.map((_,i)=>i)) : q.o.map((_,i)=>i); }
function startMode(id, mode, opt={}){
  const e=EX[id], st=exS(id); let qs, resume=null, part=opt.part??null;
  if(opt.list) qs=opt.list;
  else if(mode==="study") qs=filtered(id);
  else if(mode==="practice"){ const pool=filtered(id); const ord = S.newFirst ? [...shuffle(pool.filter(q=>!st.att[q.id])), ...shuffle(pool.filter(q=>st.att[q.id]))] : shuffle(pool); qs = S.size ? ord.slice(0,S.size) : ord; }
  else if(mode==="mock") qs=shuffle(e.qs).slice(0,Math.min(e.exam.count,e.qs.length));
  else if(mode==="mis") qs=shuffle(e.qs.filter(q=>q.id in st.mis));
  else if(mode==="flag") qs=e.qs.filter(q=>st.flag[q.id]);
  else if(mode==="cards") qs=shuffle(filtered(id));
  else if(mode==="part"){ const ids=partsOf(id)[part]; if(!ids) return; qs=ids.map(x=>e.byId[x]).filter(Boolean); resume=partS(id).live[part]||null; }
  else if(mode==="fix"){ const r=partS(id).res[part]; if(!r) return; qs=shuffle(r.wrong.map(x=>e.byId[x]).filter(Boolean)); }
  if(!qs || !qs.length) return;
  const perm={}; for(const q of qs) perm[q.id]=permFor(q);
  SESSION={id, mode, qs, i:0, ans:{}, checked:{}, perm, done:false, dir:1, results:{}, cards:{g:0,a:0}, part,
    endReveal: mode==="mock" || (mode==="part" && (resume ? resume.fb==="end" : S.partFb!=="instant"))};
  if(resume){ SESSION.i=clamp(resume.i||0,0,qs.length-1); SESSION.ans=resume.ans||{}; SESSION.checked=resume.checked||{}; }
  if(mode==="mock") SESSION.deadline=Date.now()+e.exam.minutes*60000;
  if(mode==="part") persistLive();
  if(heroStop){ heroStop(); heroStop=null; }
  openSide(false);
  if(mode==="cards"){ VIEW={name:"cards"}; setHash(hashFor("cards")); scrollTo({top:0}); viewAnim(); renderCards(); renderSide(); return; }
  VIEW={name:"run"}; setHash(hashFor("run")); scrollTo({top:0}); viewAnim(); renderRun(); renderSide();
  if(mode==="mock") startTimer();
}
function persistLive(){ const se=SESSION; if(!se || se.mode!=="part" || se.done) return; partS(se.id).live[se.part]={i:se.i, ans:se.ans, checked:se.checked, fb:se.endReveal?"end":"instant", at:Date.now()}; save(); }
let timerI=null;
function tick(){ const el=$("#timer"); if(!SESSION||!SESSION.deadline){ stopTimer(); return; } const ms=SESSION.deadline-Date.now(); if(ms<=0){ stopTimer(); finishSession(); return; } if(el){ el.textContent=`${String(Math.floor(ms/60000)).padStart(2,"0")}:${String(Math.floor(ms%60000/1000)).padStart(2,"0")}`; el.classList.toggle("low", ms<5*60000); } }
function startTimer(){ stopTimer(); timerI=setInterval(tick,500); }
function stopTimer(){ clearInterval(timerI); timerI=null; }
function record(id, q, ok){
  const st=exS(id); const a=st.att[q.id] ||= [0,0]; a[ok?0:1]++;
  let note=null;
  if(!ok) st.mis[q.id]=0;
  else if(q.id in st.mis){ st.mis[q.id]++; if(st.mis[q.id]>=2){ delete st.mis[q.id]; note="cleared"; } else note="streak"; }
  return note;
}
const sameSet = (a,b) => a.length===b.length && a.every(x=>b.includes(x));
function splitQ(text){
  const s=text.trim(); if(s.length<1300) return {ctx:null,q:s};
  const tail=s.slice(-1100); const re=/(You need to|You plan to|Which |What should|How should|What is |Does this|Solution:)/g;
  let m, first=-1; while((m=re.exec(tail))){ if(first<0) first=m.index; }
  let cut;
  if(first>=0){ cut=s.length-1100+first; const b=Math.max(s.lastIndexOf(". ",cut), s.lastIndexOf("\n",cut)); if(b>cut-260 && b>0) cut=b+1; }
  else { cut=s.length-520; const b=s.indexOf(". ",cut); if(b>0) cut=b+2; }
  return {ctx:s.slice(0,cut).trim(), q:s.slice(cut).trim()};
}
const sessLabel = se => se.mode==="part"||se.mode==="fix" ? modeName({m:se.mode,p:se.part}) : modeName(se.mode);

function renderRun(){
  const se=SESSION, e=EX[se.id], q=se.qs[se.i], st=exS(se.id);
  const end=se.endReveal, checked=!!se.checked[q.id] && !end;
  const sel=se.ans[q.id]||[], need=q.a.length;
  const {ctx, q:qt}=splitQ(q.x);
  const order=se.perm[q.id] ||= permFor(q);
  const answeredN=se.qs.filter(x=>se.ans[x.id]?.length).length;
  const pct = end ? 100*answeredN/se.qs.length : 100*(se.i+(checked?1:0))/se.qs.length;
  const optsHTML = order.map((oi,pos)=>{
    const isSel=sel.includes(oi), isRight=q.a.includes(oi);
    let cls="opt"+(need>1?" multi":""), tag="";
    if(checked){ if(isRight){ cls+=" right"; tag="✓"; } else if(isSel){ cls+=" wrong"; tag="✕"; } else cls+=" dim"; }
    else if(isSel) cls+=" sel";
    const why = checked && q.w && q.w[oi] ? `<div class="why">${md(q.w[oi])}</div>` : "";
    return `<button class="${cls}" style="--i:${pos}" data-oi="${oi}" ${checked?"disabled":""} aria-pressed="${isSel}"><span class="lt">${LET[pos]}</span><span class="ot">${md(q.o[oi])}</span>${tag?`<span class="tag">${tag}</span>`:""}${why}</button>`;
  }).join("");
  let fb="";
  if(checked){
    const ok=sameSet(sel,q.a), r=se.results[q.id];
    fb = `<div class="verdict ${ok?"ok":"bad"}"><span class="vi">${ok?"✓":"✕"}</span><div>${esc(ok?t("correct"):t("wrong"))}<small>${esc(r==="fixed"?t("fixedSub"):r==="cleared"?t("clearedSub"):r==="streak"?t("streakSub"):ok?t("correctSub"):t("wrongSub"))}</small></div></div>
    <div class="explain">
      ${q.e?`<div class="exp"><h5>${esc(t("why"))}</h5><p>${md(q.e)}</p></div>`:""}
      ${q.t?`<div class="trick"><h5>${esc(t("trick"))}</h5><p>${md(q.t)}</p>${q.k&&q.k.length?`<div class="kw">${q.k.map(k=>`<span>#${esc(k)}</span>`).join("")}</div>`:""}</div>`:""}
    </div>`;
  }
  const flagged=!!st.flag[q.id];
  app.innerHTML = `
  <div class="runbar wrap"><div class="runbar-in glass">
    <div class="lbl"><b>${esc(e.code)}</b><span class="mname">${esc(sessLabel(se))}</span><span class="tab">${se.i+1}/${se.qs.length}</span></div>
    ${se.deadline?`<span class="timer tab" id="timer">--:--</span>`:""}
    <button class="btn sm ghost" id="navBtn">${esc(t("navOpen"))}</button>
    <button class="btn sm ghost" id="exitBtn">${esc(t("exit"))}</button>
    <div class="prog"><i style="width:${pct}%"></i></div>
  </div></div>
  <div class="wrap stage">
    <article class="qcard glass enter ${se.dir<0?"rev":""}" id="qc">
      <div class="qmeta"><span class="qnum">${esc(t("question"))} ${se.i+1}</span><span class="pill">${esc(e.domains[q.d]||q.d)}</span>${need>1?`<span class="pill acc">${esc(t("selectN",{n:need}))}</span>`:""}
        <button class="flag" id="flagBtn" aria-pressed="${flagged}">${IC.flag.replace('<svg','<svg width="14" height="14"')}<span>${esc(flagged?t("flagged"):t("flag"))}</span></button></div>
      ${ctx?`<details class="case"><summary>${esc(t("caseStudy"))}</summary><div class="ctext">${esc(ctx)}</div></details>`:""}
      <p class="qtext">${md(qt)}</p>
      ${need>1&&!checked?`<div class="need tab">${esc(t("selected",{a:sel.length,n:need}))}</div>`:""}
      <div class="olist">${optsHTML}</div>
      ${fb}
    </article>
  </div>
  <div class="foot glass"><div class="in">
    <button class="btn" id="prevBtn" ${se.i===0||(!end&&se.mode!=="study")?"hidden":""}>← ${esc(t("prev"))}</button>
    <span class="hint grow">${esc(t("kb"))}</span>
    ${actionBtn()}
  </div></div>`;
  if(se.deadline) tick();
  bindRun();
}
function actionBtn(){
  const se=SESSION, q=se.qs[se.i], last=se.i===se.qs.length-1, sel=se.ans[q.id]||[];
  if(se.endReveal) return last ? `<button class="btn primary" id="actBtn" data-act="submit">${esc(t("submit"))}</button>` : `<button class="btn primary" id="actBtn" data-act="next">${esc(t("next"))} →</button>`;
  if(!se.checked[q.id]) return `<button class="btn primary" id="actBtn" data-act="check" ${sel.length!==q.a.length?"disabled":""}>${esc(t("check"))}</button>`;
  return last ? `<button class="btn primary" id="actBtn" data-act="finish">${esc(t("finish"))}</button>` : `<button class="btn primary" id="actBtn" data-act="next">${esc(t("next"))} →</button>`;
}
function bindRun(){
  const se=SESSION, q=se.qs[se.i];
  $$(".opt").forEach(b=>b.addEventListener("click",ev=>{
    if(se.checked[q.id] && !se.endReveal) return;
    const oi=+b.dataset.oi; let sel=[...(se.ans[q.id]||[])];
    if(q.a.length>1) sel = sel.includes(oi) ? sel.filter(x=>x!==oi) : (sel.length<q.a.length ? [...sel,oi] : [...sel.slice(1),oi]);
    else sel=[oi];
    se.ans[q.id]=sel;
    if(!reduced){ const r=b.getBoundingClientRect(); const d=Math.max(r.width,r.height)*2.2; const sp=document.createElement("span"); sp.className="rip"; sp.style.cssText=`width:${d}px;height:${d}px;left:${(ev.clientX||r.left+r.width/2)-r.left-d/2}px;top:${(ev.clientY||r.top+r.height/2)-r.top-d/2}px`; b.appendChild(sp); setTimeout(()=>sp.remove(),650); }
    $$(".opt").forEach(o=>{ const on=sel.includes(+o.dataset.oi); o.classList.toggle("sel",on); o.setAttribute("aria-pressed",on); });
    const nd=$(".need"); if(nd) nd.textContent=t("selected",{a:sel.length,n:q.a.length});
    $("#actBtn").outerHTML=actionBtn(); bindAct();
    if(se.endReveal){ const n=se.qs.filter(x=>se.ans[x.id]?.length).length; $(".prog i").style.width=(100*n/se.qs.length)+"%"; }
    persistLive();
  }));
  $("#flagBtn").onclick=()=>{ const st=exS(se.id); if(st.flag[q.id]) delete st.flag[q.id]; else st.flag[q.id]=1; save(); const on=!!st.flag[q.id]; const fb=$("#flagBtn"); fb.setAttribute("aria-pressed",on); $("span",fb).textContent=on?t("flagged"):t("flag"); };
  $("#exitBtn").onclick=()=>leaveGuard(()=>go("exam",se.id));
  $("#navBtn").onclick=openNav;
  $("#prevBtn").onclick=()=>move(-1);
  bindAct();
}
function bindAct(){ const b=$("#actBtn"); if(!b) return; b.onclick=()=>{ const a=b.dataset.act; if(a==="check") doCheck(); else if(a==="next") move(1); else if(a==="finish") finishSession(); else if(a==="submit") confirmSubmit(); }; }
function doCheck(){
  const se=SESSION, q=se.qs[se.i], sel=se.ans[q.id]||[]; if(sel.length!==q.a.length) return;
  const ok=sameSet(sel,q.a); se.checked[q.id]=true; let note=record(se.id,q,ok);
  if(se.mode==="fix" && ok){ const r=partS(se.id).res[se.part]; if(r){ r.wrong=r.wrong.filter(x=>x!==q.id); note="fixed"; } }
  se.results[q.id]=note; persistLive(); save();
  const r=$("#actBtn").getBoundingClientRect();
  renderRun(); renderSide();
  const card=$("#qc"); card.classList.remove("enter"); $$(".opt",card).forEach(o=>o.style.animation="none");
  if(ok){ burst(r.left+r.width/2, r.top, note==="cleared"?90:46); if(note==="cleared") toast(t("mastered")); }
  else card.classList.add("shake");
  const v=$(".verdict"); if(v) setTimeout(()=>v.scrollIntoView({behavior:reduced?"auto":"smooth",block:"nearest"}),140);
}
function move(d){ const se=SESSION; const n=se.i+d; if(n<0||n>=se.qs.length) return; se.i=n; se.dir=d; persistLive(); renderRun(); scrollTo({top:0}); }
function openNav(){
  const se=SESSION, st=exS(se.id);
  const sc=modal(t("nav"), `<div class="navgrid">${se.qs.map((q,i)=>{ let c=""; if(!se.endReveal&&se.checked[q.id]) c=sameSet(se.ans[q.id]||[],q.a)?"ok":"bad"; else if(se.ans[q.id]?.length) c="ans"; if(i===se.i) c+=" cur"; if(st.flag[q.id]) c+=" fl"; return `<button class="${c}" data-i="${i}">${i+1}</button>`; }).join("")}</div>`, [{label:t("close"),cls:"ghost"}]);
  $$(".navgrid button",sc).forEach(b=>b.onclick=()=>{ sc.remove(); const i=+b.dataset.i; se.dir=i>=se.i?1:-1; se.i=i; persistLive(); renderRun(); scrollTo({top:0}); });
}
function confirmSubmit(){ const se=SESSION; const u=se.qs.filter(q=>!(se.ans[q.id]?.length)).length; if(!u){ finishSession(); return; } modal(t("submitQ"), `<p>${esc(t("submitD",{u}))}</p>`, [{label:t("stay"),cls:"ghost"},{label:t("submit"),cls:"primary",fn:finishSession}]); }
function finishSession(){
  const se=SESSION; if(!se||se.done) return; stopTimer(); se.done=true;
  const st=exS(se.id); let c=0; const wrong=[]; const dom={};
  const scored = se.mode==="study" ? se.qs.filter(q=>se.checked[q.id]) : se.qs;
  for(const q of scored){ const sel=se.ans[q.id]||[]; const ok=sameSet(sel,q.a);
    if(se.endReveal) record(se.id,q,ok);
    if(ok) c++; else wrong.push(q);
    const d=dom[q.d] ||= [0,0]; d[ok?0:1]++; }
  const n=scored.length, pct=n?Math.round(100*c/n):0;
  if(se.mode==="part"){
    const p=partS(se.id); delete p.live[se.part]; const prev=p.res[se.part];
    p.res[se.part]={best:Math.max(prev?.best||0,pct), last:pct, c, n, wrong:wrong.map(q=>q.id), at:Date.now()};
  }
  st.hist.unshift({m:se.mode, p:se.part??undefined, c, n, at:Date.now()}); st.hist=st.hist.slice(0,30); save(true);
  const res={id:se.id, mode:se.mode, part:se.part, c, n, wrong, dom, ans:se.ans};
  VIEW={name:"results", arg:res}; setHash(hashFor("results",res)); scrollTo({top:0}); viewAnim(); renderResults(res); renderSide();
}

/* ---------- results ---------- */
function renderResults(r){
  const e=EX[r.id]; const pct=r.n?Math.round(100*r.c/r.n):0; const pass=pct>=e.exam.passPercent;
  const scoredExam = r.mode==="mock" || r.mode==="part";
  const size=156, rad=(size-14)/2, C=2*Math.PI*rad, off=C*(1-pct/100);
  const col = pct>=e.exam.passPercent ? "var(--ok)" : pct>=e.exam.passPercent-15 ? "var(--accent)" : "var(--bad)";
  const isPart = r.mode==="part" || r.mode==="fix";
  const pr = isPart ? partS(r.id).res[r.part] : null;
  const left = pr ? pr.wrong.filter(x=>e.byId[x]).length : 0;
  const nParts = partsOf(r.id).length;
  const title = r.mode==="part" ? t("resPart",{n:r.part+1}) : r.mode==="fix" ? t("resFix") : r.mode==="mock" ? (pass?t("resTitlePass"):t("resTitleFail")) : t("resTitle");
  const retryN = isPart ? left : r.wrong.length;
  app.innerHTML = `<div class="wrap res">
    <div class="score glass reveal" style="--rc:${col}">
      <svg class="bigring" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="bg" cx="${size/2}" cy="${size/2}" r="${rad}"/><circle class="fg" cx="${size/2}" cy="${size/2}" r="${rad}" stroke="${col}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${off}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="34"><tspan id="pctN">0</tspan>%</text></svg>
      <div style="position:relative;z-index:1"><span class="code" style="--v:${e.col}">${esc(e.code)} · ${esc(sessLabel(r))}</span>
        <h2 style="margin-top:12px">${esc(title)}</h2>
        <p class="tab">${esc(scoredExam?t("resLine",{c:r.c,t:r.n,p:e.exam.passPercent}):t("resLine2",{c:r.c,t:r.n}))}</p>
        ${isPart?`<p style="margin-top:6px">${esc(left?t("fixLeft",{n:left}):t("fixDone"))}</p>`:""}
        <div class="acts">
          ${retryN?`<button class="btn primary" id="rw">${IC.mis} ${esc(isPart?t("fixN",{n:retryN}):t("retryWrong",{n:retryN}))}</button>`:""}
          ${isPart && r.part+1<nParts?`<button class="btn ${retryN?"":"primary"}" id="np">${esc(t("nextPart"))} →</button>`:""}
          ${isPart?"":`<button class="btn" id="ag">${esc(t("again"))}</button>`}
          <button class="btn ghost" id="te">${esc(isPart?t("allParts"):t("toExam"))}</button>
        </div></div>
    </div>
    ${Object.keys(r.dom).length>1?`<div class="panel glass reveal" style="--i:1"><h4>${esc(t("byDomain"))}</h4><div class="dbars">${Object.entries(r.dom).sort((a,b)=>(a[1][0]/(a[1][0]+a[1][1]))-(b[1][0]/(b[1][0]+b[1][1]))).map(([d,[c,w]])=>{ const p=Math.round(100*c/(c+w)); return `<div class="dbar"><span>${esc(e.domains[d]||d)}</span><b class="tab">${c}/${c+w} · ${p}%</b><div class="tr"><i style="width:0;background:${p>=e.exam.passPercent?"var(--ok)":p>=50?"var(--accent)":"var(--bad)"}" data-w="${p}"></i></div></div>`; }).join("")}</div></div>`:""}
    <div class="panel glass reveal" style="--i:2"><h4>${esc(t("review"))}</h4>
      ${r.wrong.length? r.wrong.map(q=>{ const sel=r.ans[q.id]||[]; const {q:qt}=splitQ(q.x);
        return `<details class="rev"><summary><span class="x">✕</span><span>${esc(qt)}</span></summary><div class="body">
          <div class="ans"><div class="y"><b>${esc(t("yourAns"))}:</b> ${sel.length?sel.map(i=>md(q.o[i])).join(" · "):esc(t("noAns"))}</div><div class="c"><b>${esc(t("rightAns"))}:</b> ${q.a.map(i=>md(q.o[i])).join(" · ")}</div></div>
          ${q.e?`<div class="exp"><h5>${esc(t("why"))}</h5><p>${md(q.e)}</p></div>`:""}
          ${q.t?`<div class="trick"><h5>${esc(t("trick"))}</h5><p>${md(q.t)}</p>${q.k?.length?`<div class="kw">${q.k.map(k=>`<span>#${esc(k)}</span>`).join("")}</div>`:""}</div>`:""}
        </div></details>`; }).join("") : `<p class="empty">${esc(t("perfect"))}</p>`}
    </div></div>`;
  animateRings(app);
  countUp($("#pctN"), pct, 1300);
  requestAnimationFrame(()=>requestAnimationFrame(()=>$$(".dbar i").forEach(i=>i.style.width=i.dataset.w+"%")));
  if((scoredExam && pass) || (r.n && r.c===r.n)) setTimeout(()=>{ const b=$(".bigring")?.getBoundingClientRect(); if(b) burst(b.left+b.width/2,b.top+b.height/2,120); },900);
  $("#rw")&&($("#rw").onclick=()=> isPart ? startMode(r.id,"fix",{part:r.part}) : startMode(r.id,"retry",{list:shuffle(r.wrong)}));
  $("#np")&&($("#np").onclick=()=>startMode(r.id,"part",{part:r.part+1}));
  $("#ag")&&($("#ag").onclick=()=>startMode(r.id, ["retry","mis","flag"].includes(r.mode)?"practice":r.mode));
  $("#te").onclick=()=>{ go("exam",r.id); if(isPart) setTimeout(()=>$("#partsPanel")?.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"}),80); };
}

/* ---------- flashcards ---------- */
function renderCards(){
  const se=SESSION, e=EX[se.id];
  if(se.i>=se.qs.length){
    se.done=true; const st=exS(se.id); st.hist.unshift({m:"cards",c:se.cards.g,n:se.qs.length,at:Date.now()}); st.hist=st.hist.slice(0,30); save(true);
    app.innerHTML=`<div class="wrap res"><div class="score glass reveal" style="--rc:var(--accent-2)"><div style="font-size:64px;line-height:1">🃏</div><div><h2>${esc(t("cardsDone"))}</h2><p class="tab">${esc(t("cardsLine",{g:se.cards.g,a:se.cards.a}))}</p><div class="acts">${se.cards.a?`<button class="btn primary" id="cm">${esc(t("mMis"))}</button>`:""}<button class="btn" id="ca">${esc(t("again"))}</button><button class="btn ghost" id="ce">${esc(t("toExam"))}</button></div></div></div></div>`;
    $("#cm")&&($("#cm").onclick=()=>startMode(se.id,"mis")); $("#ca").onclick=()=>startMode(se.id,"cards"); $("#ce").onclick=()=>go("exam",se.id);
    burst(innerWidth/2, innerHeight/3, 70); renderSide(); return;
  }
  const q=se.qs[se.i]; const {q:qt}=splitQ(q.x);
  const front = qt.length>520 ? "…"+qt.slice(-520) : qt;
  app.innerHTML=`
  <div class="runbar wrap"><div class="runbar-in glass"><div class="lbl"><b>${esc(e.code)}</b><span class="mname">${esc(t("mCards"))}</span><span class="tab">${se.i+1}/${se.qs.length}</span></div>
    <button class="btn sm ghost" id="exitBtn">${esc(t("exit"))}</button><div class="prog"><i style="width:${100*se.i/se.qs.length}%"></i></div></div></div>
  <div class="wrap stage">
    <div class="fc reveal" id="fc"><div class="fc-inner" id="fci">
      <div class="fc-face" role="button" tabindex="0" id="fcf"><span class="pill" style="align-self:flex-start">${esc(e.domains[q.d]||q.d)}</span><p class="qtext" style="font-size:16px">${md(front)}</p>
        <div class="kw">${(q.k||[]).slice(0,1).map(k=>`<span class="pill acc mono">hint: #${esc(k)}</span>`).join("")}</div><span class="tapnote">${esc(t("cardFront"))}</span></div>
      <div class="fc-face fc-back"><h5 class="mono" style="margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)">${esc(t("cardBack"))}</h5>
        <div class="fc-ans">${q.a.map(i=>`<div>${md(q.o[i])}</div>`).join("")}</div>
        ${q.t?`<div class="trick"><h5>${esc(t("trick"))}</h5><p>${md(q.t)}</p>${q.k?.length?`<div class="kw">${q.k.map(k=>`<span>#${esc(k)}</span>`).join("")}</div>`:""}</div>`:""}
        ${q.e?`<div class="exp"><h5>${esc(t("why"))}</h5><p>${md(q.e)}</p></div>`:""}
      </div></div></div>
  </div>
  <div class="foot glass"><div class="in"><span class="hint grow">Space: flip · ← ${esc(t("againBtn"))} · → ${esc(t("gotIt"))}</span>
    <button class="btn danger" id="cAgain">${esc(t("againBtn"))}</button><button class="btn primary" id="cGot">${esc(t("gotIt"))}</button></div></div>`;
  const fc=$("#fc"), fci=$("#fci");
  const fit=()=>{ const f=$$(".fc-face",fc); fci.style.minHeight=Math.max(360,...f.map(x=>x.scrollHeight))+"px"; };
  fit();
  const flip=()=>fc.classList.toggle("flip");
  $("#fcf").onclick=flip; $(".fc-back").onclick=flip; $("#fcf").onkeydown=ev=>{ if(ev.key==="Enter") flip(); };
  $("#exitBtn").onclick=()=>leaveGuard(()=>go("exam",se.id));
  $("#cGot").onclick=()=>cardNext(true); $("#cAgain").onclick=()=>cardNext(false);
}
function cardNext(ok){ const se=SESSION, q=se.qs[se.i]; const st=exS(se.id);
  if(ok){ se.cards.g++; if(q.id in st.mis) record(se.id,q,true); }
  else { se.cards.a++; st.mis[q.id]=0; }
  save(); se.i++; renderCards(); scrollTo({top:0}); }

/* ---------- keyboard ---------- */
document.addEventListener("keydown",ev=>{
  if($(".scrim")){ if(ev.key==="Escape") $(".scrim").remove(); return; }
  if(ev.key==="Escape" && document.body.classList.contains("side-open")){ openSide(false); return; }
  if(ev.target.matches("input,select,textarea")) return;
  if(VIEW.name==="cards" && SESSION && !SESSION.done){ if(ev.key===" "){ ev.preventDefault(); $("#fc")?.classList.toggle("flip"); } else if(ev.key==="ArrowRight") cardNext(true); else if(ev.key==="ArrowLeft") cardNext(false); return; }
  if(VIEW.name!=="run" || !SESSION) return;
  const k=ev.key.toLowerCase();
  const idx = "123456".indexOf(k)>=0 ? "123456".indexOf(k) : "abcdef".indexOf(k);
  if(idx>=0 && k.length===1 && !ev.metaKey && !ev.ctrlKey && !ev.altKey){ const b=$$(".opt")[idx]; if(b && !b.disabled) b.click(); return; }
  if(k==="enter"){ const b=$("#actBtn"); if(b && !b.disabled){ ev.preventDefault(); b.click(); } }
  else if(k==="f" && !ev.metaKey && !ev.ctrlKey){ $("#flagBtn")?.click(); }
  else if(k==="arrowright" && SESSION.endReveal) move(1);
  else if(k==="arrowleft" && (SESSION.endReveal||SESSION.mode==="study")) move(-1);
});
addEventListener("resize", ()=>placeInd(), {passive:true});

/* ---------- boot ---------- */
document.body.classList.toggle("rail", !!S.rail);
applyTheme();
const r0=parseHash(); VIEW={name:r0.name,arg:r0.arg}; setHash(hashFor(VIEW.name,VIEW.arg));
viewAnim(); route();
})();
