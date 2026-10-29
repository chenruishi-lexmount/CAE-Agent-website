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
  document.querySelector('.heatmap caption').textContent=`${description}. 197 selected task executions per model-agent cell.`;
  document.querySelectorAll('.heatmap td').forEach(td=>{
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
