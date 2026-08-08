/* ---------- DATA ---------- */
const FEATURES = [
  {t:'Image forgery detection',d:'Error-level analysis and clone-stamp detection surface pixel tampering invisible to the eye.',
   svg:'<rect x="4" y="5" width="16" height="13" rx="2"/><path d="M4 15l4-4 3 3 5-6 4 4" opacity=".5"/><circle cx="17" cy="17" r="3.4" fill="#F8FAFC"/><circle cx="17" cy="17" r="3.4"/><path d="M19.4 19.4l2 2"/>'},
  {t:'Duplicate complaint match',d:'Perceptual hashing flags near-identical images filed across unrelated complaints.',
   svg:'<rect x="3" y="6" width="12" height="12" rx="2"/><rect x="9" y="3" width="12" height="12" rx="2" fill="#F8FAFC"/><rect x="9" y="3" width="12" height="12" rx="2"/>'},
  {t:'NLP text credibility',d:'Language models score description specificity, consistency and duplication.',
   svg:'<path d="M4 7h16M4 12h11M4 17h13"/><path d="M17 15v5M15 18l2 2 4-4" opacity=".55"/>'},
  {t:'Fused AI risk score',d:'A single 0–100 fraud score combines every signal into one actionable number.',
   svg:'<path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 17 16 11"/><circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none"/>'},
  {t:'Evidence chain verification',d:'EXIF, geolocation and timestamp checks confirm evidence matches its claimed context.',
   svg:'<path d="M7 3h7l6 6v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v6h6"/><circle cx="10.5" cy="15" r="2.6" fill="#F8FAFC"/><circle cx="10.5" cy="15" r="2.6"/><path d="M10.5 13.7V15l1 .7"/>'},
  {t:'Tamper heatmaps',d:'Visual heatmaps localize exactly which region of an image was manipulated.',
   svg:'<rect x="4" y="4" width="5" height="5" rx="1"/><rect x="10.5" y="4" width="5" height="5" rx="1" fill="currentColor" opacity=".18"/><rect x="4" y="10.5" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/><rect x="10.5" y="10.5" width="5" height="5" rx="1"/><rect x="17" y="4" width="3.5" height="11.5" rx="1"/>'},
  {t:'Explainable verdicts',d:'Every score ships with plain-language reasons, not just a black-box number.',
   svg:'<rect x="4" y="4" width="10" height="14" rx="1.5"/><path d="M7 8h4M7 11h4" opacity=".55"/><path d="M15 13h5l2 2v4h-5l-2-2Z" fill="#F8FAFC"/><path d="M15 13h5l2 2v4h-5l-2-2Z"/>'},
  {t:'Government-grade integration',d:'Built to plug into existing municipal and district grievance infrastructure.',
   svg:'<path d="M4 20V10l8-6 8 6v10"/><path d="M8 20v-6h8v6"/><circle cx="18" cy="6" r="3" fill="#F8FAFC"/><circle cx="18" cy="6" r="3"/><path d="M16.6 6l1 1 1.8-2" stroke-width="1.4"/>'}
];
const STEPS = [
  {t:'Upload complaint',d:'A citizen submits a title, description, location and supporting image through the portal.',chip:'Portal intake'},
  {t:'Image forensics',d:'Computer vision inspects the evidence for tampering, duplication and metadata anomalies.',chip:'ELA · EXIF · hash'},
  {t:'NLP text analysis',d:'The written account is scored for credibility, specificity and overlap with prior filings.',chip:'Credibility score'},
  {t:'Cross-modal validation',d:'Image and text signals are checked against each other for contradictions.',chip:'Alignment check'},
  {t:'Fraud score generation',d:'All signals are fused into a single explainable AI risk score.',chip:'0–100 score'},
  {t:'Routing decision',d:'Complaints are auto-routed as genuine, suspicious, or flagged for investigator review.',chip:'Queue routed'}
];
const TESTIMONIALS = [
  {q:'The pre-triage alone cut our backlog review time by more than half — we open the file already knowing what to check.',n:'R. Aditya',r:'District Investigator, Bengaluru Urban',i:'RA'},
  {q:'What convinced our department wasn\\'t the score — it was that every score comes with reasons a human can actually verify.',n:'S. Mehta',r:'Municipal Grievance Commissioner',i:'SM'},
  {q:'Citizens stopped calling to ask "what happened to my complaint." The status page answers that before they need to ask.',n:'K. Fernandes',r:'Head, Public Grievance Cell',i:'KF'}
];
const FAQS = [
  {q:'Is complaint data secure once it\\'s uploaded?',a:'All evidence is encrypted end to end and processed within infrastructure aligned to ISO 27001 and MeitY data-handling guidelines. Nothing leaves the verification environment.'},
  {q:'How accurate is the detection model?',a:'SatyaDrishti currently verifies complaints at 97.2% accuracy against our labelled evaluation set, with an average verification time of 312 milliseconds per case.'},
  {q:'Does the AI replace human investigators?',a:'No — it triages. Every verdict is explainable and routed for human sign-off; SatyaDrishti narrows attention, it doesn\\'t make final decisions.'},
  {q:'What evidence formats are supported?',a:'JPG and PNG images up to 10MB alongside free-text descriptions. Additional formats can be scoped for departmental integrations on request.'},
  {q:'Can this integrate with our existing grievance portal?',a:'Yes. SatyaDrishti is built to sit behind existing municipal and district portals via a standard API, so citizens keep using the portal they already know.'}
];

/* ---------- BUILD FEATURES ---------- */
const featGrid=document.getElementById('featGrid');
FEATURES.forEach((f,i)=>{
  const el=document.createElement('div');
  el.className='feat-card';
  el.innerHTML=`<span class="feat-num">0${i+1}</span><div class="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${f.svg}</svg></div><h4>${f.t}</h4><p>${f.d}</p>`;
  featGrid.appendChild(el);
});

/* ---------- BUILD STEPPER ---------- */
const stepper=document.getElementById('stepper');
STEPS.forEach((s,i)=>{
  const el=document.createElement('div');
  el.className='step-row';
  el.innerHTML=`<div class="step-node">0${i+1}</div>
    <div class="step-body">
      <div class="step-text"><h4>${s.t}</h4><p>${s.d}</p></div>
      <span class="step-chip">${s.chip}</span>
    </div>`;
  stepper.appendChild(el);
});

/* ---------- BUILD TESTIMONIALS ---------- */
const tmnGrid=document.getElementById('tmnGrid');
TESTIMONIALS.forEach(t=>{
  const el=document.createElement('div');
  el.className='tmn-card';
  el.innerHTML=`<p class="tmn-quote">&ldquo;${t.q}&rdquo;</p><div class="tmn-foot"><div class="tmn-avatar">${t.i}</div><div><div class="tmn-name">${t.n}</div><div class="tmn-role">${t.r}</div></div></div>`;
  tmnGrid.appendChild(el);
});

/* ---------- BUILD FAQ ---------- */
const faqWrap=document.getElementById('faqWrap');
FAQS.forEach((f,i)=>{
  const el=document.createElement('div');
  el.className='faq-item';
  el.innerHTML=`<div class="faq-q"><h4>${f.q}</h4><span class="faq-plus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></div><div class="faq-a"><p>${f.a}</p></div>`;
  faqWrap.appendChild(el);
  const q=el.querySelector('.faq-q');
  const a=el.querySelector('.faq-a');
  q.addEventListener('click',()=>{
    const isOpen=el.classList.contains('open');
    faqWrap.querySelectorAll('.faq-item').forEach(o=>{o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;});
    if(!isOpen){el.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
  });
});

/* ---------- MOBILE NAV ---------- */
const hamburger=document.getElementById('hamburger');
const mobilePanel=document.getElementById('mobilePanel');
hamburger.addEventListener('click',()=>mobilePanel.classList.toggle('open'));
mobilePanel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobilePanel.classList.remove('open')));

/* ---------- SCROLL REVEAL ---------- */
document.querySelectorAll('.feat-card,.benefit-card,.tmn-card,.step-row').forEach(el=>el.classList.add('reveal'));
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in');revealObs.unobserve(entry.target);}
  });
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));
