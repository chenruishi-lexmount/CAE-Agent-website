'use strict';
const data = JSON.parse(document.getElementById('research-data').textContent);
const tabs = Array.from(document.querySelectorAll('[data-metric]'));
const palette = [[237,228,212],[244,200,81],[241,115,98]];
function color(value) {
  const v = Math.max(0, Math.min(1,value))*2;
  const i = Math.min(1,Math.floor(v)); const t=v-i;
  return `rgb(${palette[i].map((c,j)=>Math.round(c*(1-t)+palette[i+1][j]*t)).join(',')})`;
}
function setMetric(metric, focus=false) {
  const success = metric === 'success';
  tabs.forEach(tab=>{const selected=tab.dataset.metric===metric;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  const panel=document.getElementById('metric-panel');
  panel.setAttribute('aria-labelledby',success?'tab-success':'tab-cost');
  const description=success?'Success rate (%) · higher is better':'Mean API cost per task (USD) · lower is better';
  document.getElementById('metric-description').textContent=description;
  document.querySelector('#results .heatmap caption').textContent=`${description}. 197 selected task executions per model-agent cell.`;
  document.querySelectorAll('#results .heatmap td').forEach(td=>{
    const cell=data.cells.find(c=>c.agent===td.dataset.agent&&c.model===td.dataset.model);
    const value=success?cell.successPercent:cell.costUSD;
    td.style.background=color(success?value/100:(Math.log10(value)+3)/4);
    td.textContent=success?`${value.toFixed(1)}%`:`$${value.toFixed(value<.01?4:3)}`;
    const agent=data.agents.find(a=>a.id===cell.agent).label;
    const model=data.models.find(m=>m.id===cell.model).label;
    td.title=`${agent} · ${model}: ${success?`${cell.successful}/${cell.tasks} successful tasks`:`$${value.toFixed(6)} mean API cost per task`}`;
  });
  document.getElementById('legend-low').textContent=success?'0%':'$0.001';
  document.getElementById('legend-high').textContent=success?'100%':'$10';
  document.getElementById('legend-note').textContent=success?'Linear scale':'Log scale';
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>setMetric(tab.dataset.metric));
  tab.addEventListener('keydown',event=>{
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();setMetric(tabs[next].dataset.metric,true);
  });
});
setMetric('success');
const toggle=document.querySelector('.nav-toggle');
const navigation=document.getElementById('nav-links');
toggle.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')!=='true';
  toggle.setAttribute('aria-expanded',String(open));navigation.dataset.open=String(open);
});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  toggle.setAttribute('aria-expanded','false');navigation.dataset.open='false';
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){
    toggle.setAttribute('aria-expanded','false');navigation.dataset.open='false';toggle.focus();
  }
});
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const code=document.getElementById(button.dataset.copy);
  try{await navigator.clipboard.writeText(code.textContent);button.textContent='Copied';}
  catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);button.textContent='Selected';}
  setTimeout(()=>button.textContent='Copy',1600);
}));

// Keep the two metric selectors independent while sharing the original palette.
const ablationData=JSON.parse(document.getElementById('ablation-data').textContent);
const ablationTabs=Array.from(document.querySelectorAll('[data-ablation-metric]'));
function setAblationMetric(metric,focus=false){
  const success=metric==='success';
  ablationTabs.forEach(tab=>{const selected=tab.dataset.ablationMetric===metric;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  document.getElementById('ablation-metric-panel').setAttribute('aria-labelledby',success?'ablation-tab-success':'ablation-tab-cost');
  const description=success?'Success rate (%) · higher is better':'Mean API cost per task (USD) · lower is better';
  document.getElementById('ablation-metric-description').textContent=description;
  document.querySelector('#ablation .heatmap caption').textContent=`${description}. Separate interface ablation with 197 tasks per configuration.`;
  document.querySelectorAll('#ablation .heatmap td').forEach(td=>{
    const cell=ablationData.cells.find(c=>c.agent===td.dataset.ablationAgent&&c.model===td.dataset.ablationModel);
    const value=success?cell.successPercent:cell.costUSD;
    td.style.background=color(success?value/100:(Math.log10(value)+3)/4);
    td.textContent=success?`${value.toFixed(1)}%`:`$${value.toFixed(value<.01?4:3)}`;
    td.title=success?`${cell.successful}/${cell.tasks} successful tasks`:`$${value.toFixed(6)} mean comparison API cost per task`;
  });
  document.getElementById('ablation-legend-low').textContent=success?'0%':'$0.001';
  document.getElementById('ablation-legend-high').textContent=success?'100%':'$10';
  document.getElementById('ablation-legend-note').textContent=success?'Linear scale':'Log scale';
}
ablationTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>setAblationMetric(tab.dataset.ablationMetric));
  tab.addEventListener('keydown',event=>{
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%ablationTabs.length;
    else if(event.key==='ArrowLeft')next=(index-1+ablationTabs.length)%ablationTabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=ablationTabs.length-1;
    else return;
    event.preventDefault();setAblationMetric(ablationTabs[next].dataset.ablationMetric,true);
  });
});
setAblationMetric('success');

// Curated static captures only. No browser session, model or extraction requests.
(() => {
  const payload=document.getElementById('representation-data');
  if(!payload)return;
  const examples=JSON.parse(payload.textContent).examples;
  const root=document.querySelector('.rep-showcase');
  const byId=id=>document.getElementById(id);
  const dots=Array.from(root.querySelectorAll('[data-rep-index]'));
  const viewTabs=Array.from(root.querySelectorAll('[data-rep-view]'));
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog=byId('rep-dialog');
  let index=0,paused=motion.matches,hovered=false,focused=false,inView=false,timer=null;
  function clock(){
    clearInterval(timer);timer=null;
    const running=!paused&&!hovered&&!focused&&inView&&!document.hidden&&!dialog.open;
    byId('rep-play-label').textContent=paused?'Play':'Pause';
    byId('rep-play-icon').textContent=paused?'▷':'Ⅱ';
    byId('rep-play').setAttribute('aria-label',paused?'Start automatic slideshow':'Pause automatic slideshow');
    byId('rep-play').setAttribute('aria-pressed',String(paused));
    if(running)timer=setInterval(()=>show(index+1,false),9000);
  }
  function renderCode(target,text,cae){
    const frag=document.createDocumentFragment();
    const token=cae?/(\[\d+\|[^|]*\|)([^\]]*)(\])/g:/(\[\d+\])|(<[^>]+>)/g;
    let last=0;
    for(const m of text.matchAll(token)){
      frag.append(document.createTextNode(text.slice(last,m.index)));
      if(cae){
        const node=document.createElement('span');node.className='rep-node';node.textContent=m[1];frag.append(node);
        const action=document.createElement('span');action.className='rep-action';action.textContent=m[2];frag.append(action);
        const end=document.createElement('span');end.className='rep-node';end.textContent=m[3];frag.append(end);
      }else{const span=document.createElement('span');span.className=m[1]?'rep-node':'rep-tag';span.textContent=m[0];frag.append(span);}
      last=m.index+m[0].length;
    }
    frag.append(document.createTextNode(text.slice(last)));target.replaceChildren(frag);
  }
  function show(next,announce=true){
    index=(next+examples.length)%examples.length;
    const sample=examples[index];root.dataset.example=sample.id;
    byId('rep-title').textContent=sample.title;
    byId('rep-category').textContent=sample.category;
    byId('rep-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(examples.length).padStart(2,'0')}`;
    const link=byId('rep-source-link');link.href=sample.url;link.textContent=new URL(sample.url).hostname+' ↗';
    const img=byId('rep-image');img.src=sample.screenshot;img.alt=`Saved screenshot of ${sample.title}`;
    byId('rep-description').textContent=sample.description;
    renderCode(byId('rep-dom'),sample.dom,false);renderCode(byId('rep-cae'),sample.cae,true);
    root.querySelectorAll('.rep-code').forEach(pre=>{pre.scrollTop=0;pre.scrollLeft=0;});
    dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
    root.querySelectorAll('[data-rep-copy]').forEach(b=>b.textContent='Copy');
    if(announce)byId('rep-status').textContent=`${index+1} of ${examples.length}. ${sample.title}. Screenshot, DOM and CAE updated.`;
    clock();
  }
  function manual(next){paused=true;show(next);}
  byId('rep-prev').addEventListener('click',()=>manual(index-1));
  byId('rep-next').addEventListener('click',()=>manual(index+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>manual(i)));
  byId('rep-play').addEventListener('click',()=>{paused=!paused;clock();});
  root.addEventListener('mouseenter',()=>{hovered=true;clock();});
  root.addEventListener('mouseleave',()=>{hovered=false;clock();});
  root.addEventListener('focusin',()=>{focused=true;clock();});
  root.addEventListener('focusout',()=>{setTimeout(()=>{focused=root.contains(document.activeElement);clock();},0);});
  document.addEventListener('visibilitychange',clock);
  motion.addEventListener('change',event=>{if(event.matches)paused=true;clock();});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;clock();},{threshold:.25}).observe(root);
  // Arrow navigation applies only to the carousel controls, preserving code scrolling.
  root.querySelectorAll('.rep-controls,.rep-dots').forEach(controls=>controls.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();manual(index-1);}
    if(event.key==='ArrowRight'){event.preventDefault();manual(index+1);}
    if(event.key==='Home'){event.preventDefault();manual(0);}
    if(event.key==='End'){event.preventDefault();manual(examples.length-1);}
  }));
  function setView(name,focus=false){
    root.dataset.view=name;
    viewTabs.forEach(tab=>{const selected=tab.dataset.repView===name;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  }
  viewTabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>setView(tab.dataset.repView));
    tab.addEventListener('keydown',event=>{
      const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
      if(delta){event.preventDefault();setView(viewTabs[(i+delta+3)%3].dataset.repView,true);}
    });
  });
  root.querySelectorAll('[data-rep-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const capturedIndex=index,kind=button.dataset.repCopy,text=examples[index][kind];
    try{await navigator.clipboard.writeText(text);if(index===capturedIndex)button.textContent='Copied';}
    catch{const range=document.createRange();range.selectNodeContents(byId('rep-'+kind));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);if(index===capturedIndex)button.textContent='Selected';}
    setTimeout(()=>{if(index===capturedIndex)button.textContent='Copy';},1600);
  }));
  function expand(){
    const sample=examples[index];byId('rep-dialog-title').textContent=sample.title+' · Saved screenshot';
    const img=byId('rep-dialog-image');img.src=sample.screenshot;img.alt=`Saved screenshot of ${sample.title}`;
    dialog.showModal();clock();
  }
  byId('rep-zoom').addEventListener('click',expand);byId('rep-screen-button').addEventListener('click',expand);
  byId('rep-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',clock);
  // All text is already stored in the HTML; preload the six local screenshots.
  examples.forEach(sample=>{const image=new Image();image.src=sample.screenshot;});
  show(0,false);
})();
