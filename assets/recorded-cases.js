'use strict';
// Replay only saved frames and their recorded text. No browser task is rerun here.
(() => {
  const root=document.getElementById('cae-cases');if(!root)return;
  const data=JSON.parse(document.getElementById('recorded-cases-data').textContent),cases=data.cases;
  const byId=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const strings={
    en:{nav:'Cases',heading:'Explore more cases with CAE Agent',lede:'Replays from real saved runs: original screenshots, recorded CAE Content or deltas, actions, and browser Effect receipts. Playback timing is shortened.',task:'Original task',play:'Play',pause:'Pause',prev:'Previous frame',next:'Next frame',screenshot:'Original screenshot',open:'Open frame ↗',content:'Recorded Content',delta:'Recorded delta',action:'Action',effect:'Effect',result:'Archived result',initial:'Initial saved page',final:'Final saved frame',no_action:'No action yet.',no_effect:'Initial observation; no browser Effect has been recorded yet.',frame:'Frame {n} / {total}',attempt:'Attempt {n} / {total}',line_info:'Excerpt: lines {start}–{end} of {total}',source:'Source and recorded outcome',saved:'Saved success · script checks',reviewed:'Saved success · evidence reviewed',note:'Original frame order is preserved, including page-ready retries. A frame after a rejected action may include the recorded recovery wait.',file:'Saved image: {file}',count:'{n} saved frames',date:'Recorded {date}',model:'Model: {model}',verdict_script:'Archived verdict: success from script checks.',verdict_review:'Archived verdict: success from script checks plus saved screenshot review.',answer:'Recorded final answer',proof:'Record SHA-256',data:'Replay data ↗',selected:'Selected {title}',range:'Saved frame',done:'Recorded final outcome: success (reward 1.0).',loading:'Loading saved frame…'},
    zh:{nav:'运行案例',heading:'探索 CAE Agent 的真实运行案例',lede:'来自真实保存的运行：使用原始截图、记录中的 CAE Content 或增量更新、动作及浏览器 Effect。回放缩短了等待时间。',task:'原始任务',play:'播放',pause:'暂停',prev:'上一帧',next:'下一帧',screenshot:'原始网页截图',open:'打开原图 ↗',content:'记录中的 Content',delta:'记录中的增量更新',action:'Action',effect:'Effect',result:'归档结果',initial:'初始保存页面',final:'最终保存画面',no_action:'尚未执行动作。',no_effect:'初始观测，尚无浏览器 Effect。',frame:'第 {n} / {total} 帧',attempt:'第 {n} / {total} 次动作尝试',line_info:'摘录：第 {start}–{end} 行，共 {total} 行',source:'来源与运行结果',saved:'已保存的成功判定 · 脚本检查',reviewed:'已保存的成功判定 · 证据复核',note:'保留原始帧顺序及页面未就绪时的重试。动作被拒绝后的截图可能包含当时的恢复等待。',file:'原图：{file}',count:'{n} 张原始截图',date:'记录于 {date}',model:'模型：{model}',verdict_script:'归档判定：成功，来自脚本检查。',verdict_review:'归档判定：成功，来自脚本检查及保存截图的证据复核。',answer:'记录中的最终回答',proof:'记录 SHA-256',data:'回放数据 ↗',selected:'已选择：{title}',range:'原始截图帧',done:'记录中的最终结果：成功（reward 1.0）。',loading:'正在加载原始截图…'}
  };
  const lang=()=>window.CAE_I18N?.lang==='zh'?'zh':'en';
  const tr=(key,values={})=>strings[lang()][key].replace(/\{(\w+)\}/g,(token,name)=>Object.hasOwn(values,name)?String(values[name]):token);
  let selected=0,index=0,timer=null,inView=false,choice=null,preload=null;
  const image=byId('case-image'),code=byId('case-code'),range=byId('case-range');
  function wanted(){return (choice??!reduced.matches)&&inView&&!document.hidden;}
  function clock(){
    if(timer){clearTimeout(timer);timer=null;}
    const playing=wanted();byId('case-play').textContent=tr(playing?'pause':'play');byId('case-play').setAttribute('aria-pressed',String(playing));
    if(playing&&image.complete&&image.naturalWidth>0){const row=cases[selected].frames[index];timer=setTimeout(()=>{index=(index+1)%cases[selected].frames.length;render();},row.final?4000:row.invalid?1800:2600);}
  }
  function renderCode(text,action){
    code.replaceChildren();const node=action.match(/"node_id":\s*(\d+)/)?.[1];
    text.split('\n').forEach((line,i)=>{if(i)code.append(document.createTextNode('\n'));const span=document.createElement('span');span.textContent=line;if(line.startsWith('+ '))span.classList.add('case-line-add');if(line.startsWith('- '))span.classList.add('case-line-remove');if(node&&line.includes('|'+node+'|'))span.classList.add('case-line-active');code.append(span);});
    code.scrollTop=0;const active=code.querySelector('.case-line-active');if(active)code.scrollTop=Math.max(0,active.offsetTop-code.offsetTop-100);
  }
  function render(manual=false){
    const c=cases[selected],f=c.frames[index],title=c.title[lang()];
    root.querySelectorAll('[data-case-copy]').forEach(node=>node.textContent=tr(node.dataset.caseCopy));
    document.querySelectorAll('[data-case-copy="nav"]').forEach(node=>node.textContent=tr('nav'));
    root.querySelectorAll('[data-case-select]').forEach((button,i)=>{const row=cases[i];button.setAttribute('aria-pressed',String(i===selected));button.querySelector('.case-choice-title').textContent=row.title[lang()];button.querySelector('.case-choice-meta').textContent=row.model+' · '+row.recorded_date+' · '+tr('count',{n:row.frames.length});});
    byId('case-task-text').textContent=c.task;byId('case-model').textContent=tr('model',{model:c.model});byId('case-date').textContent=tr('date',{date:c.recorded_date});byId('case-verdict').textContent=tr(c.outcome.verdict_source==='script'?'saved':'reviewed');
    const url=f.screenshot+'?v='+f.screenshot_sha256.slice(0,12),screen=image.closest('.case-screen');
    screen.dataset.loading='true';screen.dataset.loadingLabel=tr('loading');
    image.onload=()=>{screen.dataset.loading='false';clock();};
    image.src=url;if(image.complete&&image.naturalWidth>0)screen.dataset.loading='false';
    preload=new Image();const next=c.frames[(index+1)%c.frames.length];preload.src=next.screenshot+'?v='+next.screenshot_sha256.slice(0,12);
    image.alt=title+' · '+tr('frame',{n:index+1,total:c.frames.length});byId('case-open-image').href=url;byId('case-image-link').href=url;byId('case-image-info').textContent=tr('file',{file:f.screenshot.split('/').at(-1)});
    byId('case-code-title').textContent=tr(f.observation_kind==='Delta'?'delta':'content')+' · v'+f.version;
    renderCode(f.cae_excerpt,f.action);byId('case-line-info').textContent=tr('line_info',{start:f.line_start,end:f.line_end,total:f.line_total});
    byId('case-action').textContent=f.action||tr('no_action');byId('case-effect').textContent=f.effect||(f.final?tr('done'):tr('no_effect'));byId('case-effect-label').textContent=tr(f.final?'result':'effect');byId('case-effect-row').dataset.invalid=String(f.invalid);
    byId('case-counter').textContent=tr('frame',{n:index+1,total:c.frames.length});byId('case-position').textContent=f.final?tr('final'):f.attempt?tr('attempt',{n:f.attempt,total:c.attempts}):tr('initial');
    range.max=String(c.frames.length-1);range.value=String(index);range.setAttribute('aria-label',tr('range'));range.setAttribute('aria-valuetext',byId('case-counter').textContent);
    byId('case-prev').setAttribute('aria-label',tr('prev'));byId('case-next').setAttribute('aria-label',tr('next'));
    byId('case-answer-title').textContent=tr('answer');byId('case-answer').textContent=c.result;byId('case-verdict-detail').textContent=tr(c.outcome.verdict_source==='script'?'verdict_script':'verdict_review');byId('case-proof').textContent=c.record_sha256;
    if(manual)byId('case-announce').textContent=title+' · '+byId('case-counter').textContent;
    clock();
  }
  root.querySelectorAll('[data-case-select]').forEach((button,i)=>button.addEventListener('click',()=>{selected=i;index=0;render(true);}));
  byId('case-play').addEventListener('click',()=>{choice=!wanted();clock();});
  byId('case-prev').addEventListener('click',()=>{choice=false;index=(index-1+cases[selected].frames.length)%cases[selected].frames.length;render(true);});
  byId('case-next').addEventListener('click',()=>{choice=false;index=(index+1)%cases[selected].frames.length;render(true);});
  range.addEventListener('input',()=>{choice=false;index=Number(range.value);render(true);});
  document.addEventListener('cae:languagechange',()=>render());document.addEventListener('visibilitychange',clock);
  reduced.addEventListener('change',()=>{choice=null;clock();});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;clock();},{threshold:.16}).observe(byId('case-player'));
  byId('case-controls').hidden=false;render();
})();
