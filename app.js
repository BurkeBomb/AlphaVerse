const KEY_OFFICIAL_IMPORTED='alpha_official_imported_v1';
// placeholder app.js

async function importOfficialQuestions(){
  try{
    const res = await fetch('alphaverse_questions.json', {cache:'no-cache'});
    if(!res.ok){ alert('Could not load official set (HTTP '+res.status+').'); return; }
    const data = await res.json();
    if(typeof QUESTION_SETS === 'undefined'){ window.QUESTION_SETS = {}; }
    Object.entries(data).forEach(([cat, arr])=>{
      if(!Array.isArray(arr)) return;
      if(!QUESTION_SETS[cat]) QUESTION_SETS[cat]=[];
      const existing = QUESTION_SETS[cat];
      arr.forEach(item=>{
        const q = String(item.q||'').trim();
        const opts = Array.isArray(item.options) ? item.options.slice(0,3).map(String) : [];
        const correct = Math.max(0, Math.min(2, Number(item.correct||0)));
        if(!q || opts.length<3) return;
        if(existing.some(x => (x.q||'').trim().toLowerCase()===q.toLowerCase())) return;
        existing.push({ q, options: opts, correct });
      });
    });
    if (typeof buildMixed === 'function') buildMixed();
    if (typeof fillCategorySelects === 'function') fillCategorySelects();
    if (typeof buildTiles === 'function') buildTiles();
    alert('Official set imported. You can now play or export from the editor.');
  }catch(e){ console.error(e); alert('Import failed. See console.'); }
}

// wire button after DOM is ready
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'importOfficialBtn'){ importOfficialQuestions(); }
});


// Auto-import official questions on first run (no answers revealed in-game).
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const done = localStorage.getItem(KEY_OFFICIAL_IMPORTED);
    if(!done && typeof importOfficialQuestions === 'function'){
      importOfficialQuestions().finally(()=>{
        try{ localStorage.setItem(KEY_OFFICIAL_IMPORTED, '1'); }catch(e){}
      });
    }
  }catch(e){}
});
