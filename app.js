// app.js — Alphaverse with Supabase + themes + teams + share + editor
const $ = (s)=>document.querySelector(s);
const byId = (id)=>document.getElementById(id);

// Theme
const THEME_KEY="alpha_theme";
const mediaDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
function actualThemeFromAuto(){ return (mediaDark && mediaDark.matches) ? "neon" : "molten"; }
function applyTheme(t){ const v=(t==="auto")?actualThemeFromAuto():t; document.documentElement.setAttribute("data-theme", v); localStorage.setItem(THEME_KEY, t); }
function initTheme(){ const saved = localStorage.getItem(THEME_KEY) || "auto"; applyTheme(saved); mediaDark?.addEventListener("change", ()=>{ if((localStorage.getItem(THEME_KEY)||"auto")==="auto") applyTheme("auto"); }); }

syncThemeSelect();
// Supabase
let SUPA=null;
function initSupabase(){
  const cfg=window.SUPABASE_CONFIG||{};
  if(!cfg.url||!cfg.anonKey){ console.warn("Supabase not configured."); return null; }
  return supabase.createClient(cfg.url, cfg.anonKey);
}

// UI refs
const setupPanel=byId("setupPanel"), tilesPanel=byId("tilesPanel"), tilesGrid=byId("tilesGrid"), quizPanel=byId("quizPanel"), resultPanel=byId("resultPanel");
const leaderboardModal=byId("leaderboardModal"), aboutModal=byId("aboutModal");
const setupForm=byId("setupForm"), playerNameInput=byId("playerName"), teamNameInput=byId("teamName"), modeSelect=byId("modeSelect");
const singleCatWrap=byId("singleCatWrap"), categorySelect=byId("categorySelect"), mixWrap=byId("mixWrap"), mixChooser=byId("mixChooser");
const mixStrategy=byId("mixStrategy"), mixPresetSelect=byId("mixPresetSelect"), mixPresetName=byId("mixPresetName"), saveMixBtn=byId("saveMixBtn"), deleteMixBtn=byId("deleteMixBtn");
const countSelect=byId("countSelect"), orderSelect=byId("orderSelect");
const qText=byId("questionText"), answersForm=byId("answers"), nextBtn=byId("nextBtn"), qCounter=byId("qCounter"), timerEl=byId("timer"), progressBar=byId("progressBar"), progressEl=byId("progress");
const resultName=byId("resultName"), resultCategory=byId("resultCategory"), resultScore=byId("resultScore"), resultTotal=byId("resultTotal"), resultTime=byId("resultTime"), resultBadge=byId("resultBadge");
const viewLeaderboardBtn=byId("viewLeaderboardBtn"), openLeaderboardBtn=byId("openLeaderboardBtn"), resetBoardBtn=byId("resetBoardBtn"), aboutBtn=byId("aboutBtn"), themeBtn=byId("themeBtn");
const overallBody=byId("overallBody"), categoryBody=byId("categoryBody"), lbCategorySelect=byId("lbCategorySelect"); const tabs=document.querySelectorAll(".tab"); const overallTab=byId("overallTab"); const categoryTab=byId("categoryTab"); const teamTab=byId("teamTab"); const teamBody=byId("teamBody");
const shareBtn=byId("shareBtn"), shareCanvas=byId("shareCanvas"); const editorBtn=byId("editorBtn");

// Accents by category
const CAT_ACCENTS = {
  "Tools & Tinkering": ["#ffcc66","#ff8c2b"], "Style & Swagger": ["#8a5cf6","#6de5ff"], "Fire & Food": ["#ff8c2b","#ffd166"], "Grit & Growth": ["#7ee787","#8a5cf6"],
  "Legends & Lore": ["#ffd166","#8a5cf6"], "Medical & Body": ["#6de5ff","#8a5cf6"], "TV & Film": ["#8a5cf6","#ffd166"], "Sport & Strength": ["#7ee787","#ffd166"],
  "History & Warfare": ["#ffd166","#ff8c2b"], "Ladies & Love": ["#ff6b6b","#ffcc66"], "Psychology": ["#6de5ff","#8a5cf6"], "Language & Literature": ["#8a5cf6","#6de5ff"],
  "Geography": ["#6de5ff","#7ee787"], "Arts & Culture": ["#ffcc66","#8a5cf6"], "Science & Technology": ["#6de5ff","#7ee787"], "Religion & Belief": ["#ffd166","#6de5ff"],
  "Mythology": ["#ffcc66","#ff8c2b"], "Fantasy & Fiction": ["#8a5cf6","#6de5ff"], "Sex & Relationships": ["#ff6b6b","#ffcc66"], "Mixed (All)": ["var(--accent)","var(--accent-2)"]
};
function setAccentsForCategory(cat){ const p = CAT_ACCENTS[cat] || ["var(--accent)","var(--accent-2)"]; document.documentElement.style.setProperty("--accent", p[0]); document.documentElement.style.setProperty("--accent-2", p[1]); }

// Local cache
const KEY_OVERALL_CACHE="alpha_overall_cache_v1", KEY_CAT_CACHE="alpha_cat_cache_v1", KEY_MIXES="alpha_mix_presets_v1", KEY_CUSTOM_SETS="alpha_custom_sets_v1";
function saveLocal(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function loadLocal(k,f){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch{return f;} }

// Mix+tiles
function buildMixed(){ const all=[]; Object.entries(QUESTION_SETS).forEach(([cat,qs])=>{ if(cat!=="Mixed (All)") all.push(...qs); }); QUESTION_SETS["Mixed (All)"]=all; }
function fillCategorySelects(){ categorySelect.innerHTML=""; lbCategorySelect.innerHTML=""; mixChooser.innerHTML=""; Object.keys(QUESTION_SETS).forEach(cat=>{ const o=document.createElement("option"); o.value=cat; o.textContent=cat; categorySelect.appendChild(o.cloneNode(true)); lbCategorySelect.appendChild(o); if(cat==="Mixed (All)") return; const pill=document.createElement("label"); pill.className="pill"; pill.innerHTML=`<input type="checkbox" value="${cat}"/><span>${cat}</span>`; mixChooser.appendChild(pill); }); categorySelect.value="Mixed (All)"; lbCategorySelect.value="Mixed (All)"; }
function buildTiles(){ tilesGrid.innerHTML=""; Object.entries(QUESTION_SETS).forEach(([cat,qs])=>{ if(cat==="Mixed (All)") return; const div=document.createElement("div"); div.className="tile"; div.innerHTML=`<div class="title">${cat}</div><div class="desc">${qs.length} Qs</div>`; div.addEventListener("click", ()=>{ setAccentsForCategory(cat); applyThemeForCategory(cat); startQuiz({mode:"single", category:cat}); }); tilesGrid.appendChild(div); }); }

// Presets
function getMixes(){ return loadLocal(KEY_MIXES, []); } function saveMixes(list){ saveLocal(KEY_MIXES, list); }
function renderMixPresetSelect(){ const mixes=getMixes(); mixPresetSelect.innerHTML=`<option value="">— None —</option>`; mixes.forEach((m,i)=>{ const opt=document.createElement("option"); opt.value=String(i); opt.textContent=m.name; mixPresetSelect.appendChild(opt); }); }
function loadPreset(i){ const m=getMixes()[Number(i)]; if(!m) return; Array.from(mixChooser.querySelectorAll("input[type=checkbox]")).forEach(cb=> cb.checked=m.cats.includes(cb.value)); mixStrategy.value=m.strategy||"even"; mixPresetName.value=m.name||""; }

syncThemeSelect();
// Supabase
function initSupaClient(){ SUPA=initSupabase(); }
async function supaInsert(entry){ if(!SUPA) return null; const {data,error}=await SUPA.from("scores").insert(entry).select(); if(error){ console.warn("Insert error:", error.message); return null; } return data; }
async function supaFetchOverall(limit=200){ if(!SUPA) return loadLocal(KEY_OVERALL_CACHE, []); const {data,error}=await SUPA.from("scores").select("*").order("score",{ascending:false}).order("seconds",{ascending:true}).order("created_at",{ascending:true}).limit(limit); if(error){ console.warn("Fetch overall error:", error.message); return loadLocal(KEY_OVERALL_CACHE, []); } saveLocal(KEY_OVERALL_CACHE, data); return data; }
async function supaFetchByCategory(category, limit=200){ if(!SUPA){ const cats=loadLocal(KEY_CAT_CACHE, {}); return cats[category]||[]; } const {data,error}=await SUPA.from("scores").select("*").eq("category",category).order("score",{ascending:false}).order("seconds",{ascending:true}).order("created_at",{ascending:true}).limit(limit); if(error){ console.warn("Fetch cat error:", error.message); const cats=loadLocal(KEY_CAT_CACHE, {}); return cats[category]||[]; } const cats=loadLocal(KEY_CAT_CACHE, {}); cats[category]=data; saveLocal(KEY_CAT_CACHE, cats); return data; }

// Boards
async function renderOverall(){ const rows=await supaFetchOverall(); overallBody.innerHTML=""; if(!rows.length){ overallBody.innerHTML=`<tr><td colspan="7" class="muted">No scores yet.</td></tr>`; return; } rows.forEach((e,i)=>{ const tr=document.createElement("tr"); tr.innerHTML=`<td>${i+1}</td><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.team||"")}</td><td>${e.score}/${e.total}</td><td>${formatTime(e.seconds)}</td><td>${escapeHtml(e.category)}</td><td>${new Date(e.created_at).toLocaleString()}</td>`; overallBody.appendChild(tr); }); }
async function renderByCategory(cat){ const rows=await supaFetchByCategory(cat); categoryBody.innerHTML=""; if(!rows.length){ categoryBody.innerHTML=`<tr><td colspan="5" class="muted">No scores for '${escapeHtml(cat)}' yet.</td></tr>`; return; } rows.forEach((e,i)=>{ const tr=document.createElement("tr"); tr.innerHTML=`<td>${i+1}</td><td>${escapeHtml(e.name)}</td><td>${e.score}/${e.total}</td><td>${formatTime(e.seconds)}</td><td>${new Date(e.created_at).toLocaleString()}</td>`; categoryBody.appendChild(tr); }); }
async function renderTeamBoard(){ const rows = await supaFetchOverall(500); const teams = new Map(); rows.forEach(r=>{ const t=(r.team||"").trim(); if(!t) return; if(!teams.has(t)) teams.set(t,{plays:0,best:0,sum:0,cnt:0}); const obj=teams.get(t); const pct = r.total ? (r.score/r.total) : 0; obj.plays+=1; obj.best=Math.max(obj.best, r.score); obj.sum+=pct; obj.cnt+=1; }); const arr = Array.from(teams.entries()).map(([name,s])=>({name, best:s.best, avg:s.cnt?(s.sum/s.cnt):0, plays:s.plays})).sort((a,b)=> b.best-a.best || b.avg-a.avg || b.plays-a.plays); teamBody.innerHTML=""; if(!arr.length){ teamBody.innerHTML=`<tr><td colspan="5" class="muted">No team scores yet.</td></tr>`; return; } arr.forEach((e,i)=>{ const tr=document.createElement("tr"); tr.innerHTML=`<td>${i+1}</td><td>${escapeHtml(e.name)}</td><td>${e.best}</td><td>${(e.avg*100).toFixed(1)}%</td><td>${e.plays}</td>`; teamBody.appendChild(tr); }); }

// Helpers
function shuffle(arr){ return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
function formatTime(sec){ const m=String(Math.floor(sec/60)).padStart(2,"0"); const s=String(sec%60).padStart(2,"0"); return `${m}:${s}`; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
function badgeFor(score,total){ const pct=(score/total)*100; if(pct>=80)return"🛡️ Arena Elite."; if(pct>=50)return"🔥 Holding your own."; if(pct>=25)return"⛏️ Back to basics."; return"🌱 Start where you stand."; }

// Build question pool
function buildQuestions({ mode, category, selectedCats, strategy, limit, order }){
  let pool=[];
  if(mode==="single"){ pool=(QUESTION_SETS[category]||[]).slice(); setAccentsForCategory(category); }
  else if(mode==="mix"){
    const sets=selectedCats.map(c=>(QUESTION_SETS[c]||[]).slice());
    if(strategy==="pooled"){ pool=sets.flat(); }
    else {
      const k=sets.length; const base=Math.floor(limit/k); const rem=limit%k; let built=[];
      sets.forEach((arr,i)=>{ const take=base+(i<rem?1:0); const copy=arr.slice(); built=built.concat(copy.length<=take?copy:shuffle(copy).slice(0,take)); });
      if(order==="random") built=shuffle(built); return built.slice(0,limit);
    }
  }
  if(order==="random") pool=shuffle(pool); return pool.slice(0,limit);
}

// Quiz flow
let QUESTIONS=[], playerName="", mode="tiles", category="Mixed (All)", mixCats=[], strategy="even", qOrder="fixed", qLimit=20, qIndex=0, score=0, startedAt=0, elapsed=0, timerInterval=null;
function startTimer(){ startedAt=Date.now(); timerInterval=setInterval(()=>{ elapsed=Math.floor((Date.now()-startedAt)/1000); timerEl.textContent=formatTime(elapsed); }, 200); }
function stopTimer(){ clearInterval(timerInterval); timerInterval=null; }
function renderQuestion(){ const total=QUESTIONS.length; const q=QUESTIONS[qIndex]; qText.textContent=q.q; answersForm.innerHTML=""; q.options.forEach((opt,i)=>{ const id=`q${qIndex}_o${i}`; const label=document.createElement("label"); label.setAttribute("for",id); const input=document.createElement("input"); input.type="radio"; input.name="answer"; input.id=id; input.value=i; const span=document.createElement("span"); span.className="opt"; span.textContent=opt; label.appendChild(input); label.appendChild(span); answersForm.appendChild(label); }); qCounter.textContent=`Q ${qIndex+1}/${total}`; nextBtn.disabled=true; const pct=Math.floor((qIndex/total)*100); progressEl.setAttribute("aria-valuenow",pct); progressBar.style.width=`${pct}%`; }
answersForm.addEventListener("change", ()=> nextBtn.disabled=false);
nextBtn.addEventListener("click", ()=>{ const picked=answersForm.querySelector("input[name='answer']:checked"); if(!picked) return; const pickedIdx=Number(picked.value); const q=QUESTIONS[qIndex]; Array.from(answersForm.querySelectorAll("label")).forEach((lab,i)=>{ lab.classList.remove("correct","wrong"); if(i===q.correct) lab.classList.add("correct"); if(i===pickedIdx && i!==q.correct) lab.classList.add("wrong"); }); if(pickedIdx===q.correct) score+=1; setTimeout(()=>{ qIndex+=1; if(qIndex>=QUESTIONS.length) endQuiz(); else renderQuestion(); }, 300); });

async function endQuiz(){ stopTimer(); const total=QUESTIONS.length; resultPanel.classList.remove("hidden"); quizPanel.classList.add("hidden");
  resultName.textContent=playerName; const catLabel=(mode==="single")?category:`Mix: ${mixCats.join(" + ")}`;
  resultCategory.textContent=catLabel; resultScore.textContent=String(score); resultTotal.textContent=String(total); resultTime.textContent=formatTime(elapsed); resultBadge.textContent=badgeFor(score,total);
  await supaInsert({ name: playerName, team:(teamNameInput?.value||'').trim(), score, total, seconds: elapsed, category: catLabel });
}

// Start
function startQuiz(options){ playerName=playerNameInput.value.trim()||"Player"; mode=options.mode||modeSelect.value; category=options.category||categorySelect.value; qOrder=orderSelect.value; qLimit=Number(countSelect.value); strategy=mixStrategy.value; mixCats=Array.from(mixChooser.querySelectorAll("input[type=checkbox]:checked")).map(cb=>cb.value); applyThemeForCategory(category); const buildOpts={mode,category,selectedCats:mixCats,strategy,limit:qLimit,order:qOrder}; QUESTIONS=buildQuestions(buildOpts); if(!QUESTIONS.length){ alert("No questions for that selection."); return; } score=0; qIndex=0; elapsed=0; timerEl.textContent="00:00"; setupPanel.classList.add("hidden"); tilesPanel.classList.add("hidden"); resultPanel.classList.add("hidden"); quizPanel.classList.remove("hidden"); startTimer(); renderQuestion(); }

// Forms & tabs
setupForm.addEventListener("submit",(e)=>{ e.preventDefault(); const m=modeSelect.value; if(m==="tiles"){ setupPanel.classList.add("hidden"); resultPanel.classList.add("hidden"); tilesPanel.classList.remove("hidden"); return; } startQuiz({mode:m}); });
modeSelect.addEventListener("change", ()=>{ const m=modeSelect.value; singleCatWrap.classList.toggle("hidden", !(m==="single")); mixWrap.classList.toggle("hidden", !(m==="mix")); });
const tabsAll=document.querySelectorAll(".tab");
tabsAll.forEach(tab=> tab.addEventListener("click", async ()=>{ tabsAll.forEach(t=>t.classList.remove("active")); tab.classList.add("active"); if(tab.dataset.tab==="overall"){ overallTab.classList.remove("hidden"); categoryTab.classList.add("hidden"); teamTab.classList.add("hidden"); await renderOverall(); } else if(tab.dataset.tab==="category"){ overallTab.classList.add("hidden"); categoryTab.classList.remove("hidden"); teamTab.classList.add("hidden"); await renderByCategory(lbCategorySelect.value); } else { overallTab.classList.add("hidden"); categoryTab.classList.add("hidden"); teamTab.classList.remove("hidden"); await renderTeamBoard(); }}));
viewLeaderboardBtn.addEventListener("click", async ()=>{ await openLB(); });
openLeaderboardBtn.addEventListener("click", async ()=>{ await openLB(); });
async function openLB(){ await renderOverall(); lbCategorySelect.innerHTML=""; Object.keys(QUESTION_SETS).forEach(cat=>{ const opt=document.createElement("option"); opt.value=cat; opt.textContent=cat; lbCategorySelect.appendChild(opt); }); lbCategorySelect.value="Mixed (All)"; await renderByCategory(lbCategorySelect.value); teamTab.classList.add("hidden"); leaderboardModal.showModal(); }
lbCategorySelect.addEventListener("change", async ()=>{ await renderByCategory(lbCategorySelect.value); });
resetBoardBtn.addEventListener("click", ()=>{ localStorage.removeItem(KEY_OVERALL_CACHE); localStorage.removeItem(KEY_CAT_CACHE); alert("Local cache cleared. Cloud data remains."); });
aboutBtn.addEventListener("click", ()=> aboutModal.showModal());

// Theme button cycles molten->neon->auto
themeBtn?.addEventListener("click", ()=>{ const saved = localStorage.getItem(THEME_KEY) || "auto"; const order=["molten","neon","midnight","solar","auto"]; const i=Math.max(0, order.indexOf(saved)); const next=order[(i+1)%order.length]; applyTheme(next); });

// Share Card
shareBtn?.addEventListener("click", ()=>{ const c=shareCanvas; const ctx=c.getContext("2d"); const w=c.width,h=c.height; const style=getComputedStyle(document.documentElement); const a=style.getPropertyValue("--accent").trim()||"#ffcc66"; const b=style.getPropertyValue("--accent-2").trim()||"#ff8c2b"; const bg=ctx.createLinearGradient(0,0,w,h); bg.addColorStop(0,"#0b0d12"); bg.addColorStop(1,"#0f1422"); ctx.fillStyle=bg; ctx.fillRect(0,0,w,h); const grad=ctx.createLinearGradient(0,0,w,0); grad.addColorStop(0,a); grad.addColorStop(1,b); ctx.fillStyle=grad; ctx.fillRect(0,h-30,w,30); ctx.fillStyle="#e9edf5"; ctx.font="48px Inter, Arial"; ctx.fillText("ALPHAVERSE — The Knowledge Arena", 60, 120); ctx.font="28px Inter, Arial"; ctx.fillText("Conquer what you claim to know.", 60, 165); ctx.font="40px Inter, Arial"; ctx.fillText(`${resultName.textContent} · ${resultCategory.textContent}`, 60, 260); ctx.font="96px Inter, Arial"; ctx.fillText(`${resultScore.textContent}/${resultTotal.textContent}`, 60, 360); ctx.font="36px Inter, Arial"; ctx.fillText(`Time: ${resultTime.textContent}`, 60, 420); const url=c.toDataURL("image/png"); const aTag=document.createElement("a"); aTag.href=url; aTag.download="alphaverse_result.png"; document.body.appendChild(aTag); aTag.click(); aTag.remove(); });

// Editor (local custom sets)
function getCustomSets(){ try { return JSON.parse(localStorage.getItem(KEY_CUSTOM_SETS)||"{}"); } catch { return {}; } }
function saveCustomSets(obj){ localStorage.setItem(KEY_CUSTOM_SETS, JSON.stringify(obj)); }
function mergeCustomIntoQuestionSets(){ const custom=getCustomSets(); Object.entries(custom).forEach(([cat,arr])=>{ if(!QUESTION_SETS[cat]) QUESTION_SETS[cat]=[]; QUESTION_SETS[cat]=QUESTION_SETS[cat].concat(arr); }); }
editorBtn?.addEventListener("click", ()=>{
  const dlg=document.createElement("dialog"); dlg.className="modal"; dlg.innerHTML=`<form method="dialog" class="modal-inner">
  <header class="modal-header"><h3>🛠️ Question Editor</h3><button value="close" aria-label="Close">✕</button></header>
  <div class="editor-wrap">
    <div class="row"><label class="block half"><span class="lbl">Category</span><input id="edCategory" type="text"/></label><label class="block half"><span class="lbl">Question</span><input id="edQ" type="text"/></label></div>
    <div class="row"><label class="block half"><span class="lbl">Option A</span><input id="edA" type="text"/></label><label class="block half"><span class="lbl">Option B</span><input id="edB" type="text"/></label></div>
    <div class="row"><label class="block half"><span class="lbl">Option C</span><input id="edC" type="text"/></label><label class="block half"><span class="lbl">Correct (0=A,1=B,2=C)</span><input id="edCorrect" type="number" min="0" max="2" value="0"/></label></div>
    <div class="row"><button id="addQBtn" type="button" class="primary">Add</button><button id="exportQBtn" type="button" class="ghost">Export JSON</button><input type="file" id="importQInput" accept="application/json" class="hidden"/><button id="importQBtn" type="button" class="ghost">Import JSON</button><button id="clearCustomBtn" type="button" class="danger">Clear Custom</button></div>
    <p class="muted">Custom additions save locally and merge on load.</p>
  </div>
  <footer class="modal-footer"><button value="close" class="primary">Close</button></footer></form>`; document.body.appendChild(dlg);
  const edCategory=dlg.querySelector("#edCategory"), edQ=dlg.querySelector("#edQ"), edA=dlg.querySelector("#edA"), edB=dlg.querySelector("#edB"), edC=dlg.querySelector("#edC"), edCorrect=dlg.querySelector("#edCorrect");
  const addQBtn=dlg.querySelector("#addQBtn"), exportQBtn=dlg.querySelector("#exportQBtn"), importQBtn=dlg.querySelector("#importQBtn"), importQInput=dlg.querySelector("#importQInput"), clearCustomBtn=dlg.querySelector("#clearCustomBtn");
  addQBtn.addEventListener("click", ()=>{ const cat=(edCategory.value||"").trim(); const q=(edQ.value||"").trim(); const a=(edA.value||"").trim(); const b=(edB.value||"").trim(); const c=(edC.value||"").trim(); const correct=Number(edCorrect.value||"0"); if(!cat||!q||!a||!b||!c||!(correct in {0:1,1:1,2:1})) { alert("Fill all fields; correct is 0/1/2."); return; } const custom=getCustomSets(); if(!custom[cat]) custom[cat]=[]; custom[cat].push({q, options:[a,b,c], correct}); saveCustomSets(custom); alert("Added!"); });
  exportQBtn.addEventListener("click", ()=>{ const blob=new Blob([JSON.stringify(getCustomSets(),null,2)], {type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="alphaverse_custom_sets.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });
  importQBtn.addEventListener("click", ()=> importQInput.click()); importQInput.addEventListener("change", ()=>{ const file=importQInput.files[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ try{ const obj=JSON.parse(reader.result); const cur=getCustomSets(); Object.keys(obj).forEach(k=>{ cur[k]=(cur[k]||[]).concat(obj[k]||[]); }); saveCustomSets(cur); alert("Imported."); }catch(e){ alert("Invalid JSON."); }}; reader.readAsText(file); });
  clearCustomBtn.addEventListener("click", ()=>{ if(confirm("Clear ALL custom questions on this device?")){ localStorage.removeItem(KEY_CUSTOM_SETS); alert("Cleared."); }});
  dlg.showModal();
});

// Init
function init(){ initTheme(); syncThemeSelect(); SUPA=initSupabase(); mergeCustomIntoQuestionSets(); buildMixed(); fillCategorySelects(); buildTiles(); renderMixPresetSelect(); }
init();
