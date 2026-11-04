'use strict';
// The cameras move over original saved media. Native text is never invented.
(() => {
  const root = document.getElementById('cae-cases');
  if (!root) return;
  const data = JSON.parse(document.getElementById('recorded-cases-data').textContent);
  const cases = data.cases, byId = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const strings = {
    en: {
      nav:'Cases', heading:'Explore more cases with CAE Agent',
      lede:'Real saved runs, replayed from page overview to node focus, Action, and Effect. Inspect the full CAE Page and its recorded Delta below.',
      task:'Original task', play:'Play', pause:'Pause', prev:'Previous frame', next:'Next frame', screenshot:'Original screenshot', open:'Open frame ↗',
      content:'Full CAE Page', delta:'Recorded Delta', action:'Action', effect:'Effect', result:'Archived result', initial:'Initial saved page', final:'Final saved frame',
      no_action:'No action yet.', no_effect:'Initial observation; no browser Effect yet.', wait_action:'Next: execute the recorded action.', wait_effect:'Waiting for the recorded Effect…',
      frame:'Frame {n} / {total}', attempt:'Attempt {n} / {total}', line_info:'Complete page · {total} lines · scroll to inspect',
      source:'Source and recorded outcome', saved:'Saved success · script checks', reviewed:'Saved success · evidence reviewed',
      note:'Original frames and retries are preserved. Focus boxes mark visible controls; off-screen nodes are labelled. Playback timing is shortened.',
      file:'Saved image: {file}', count:'{n} saved frames', date:'Recorded {date}', model:'Model: {model}',
      verdict_script:'Archived verdict: success from script checks.', verdict_review:'Archived verdict: success from script checks plus saved screenshot review.',
      answer:'Recorded final answer', proof:'Record SHA-256', data:'Replay data ↗', range:'Saved frame', done:'Recorded final outcome: success (reward 1.0).', loading:'Loading saved frame…',
      stages:['1 · Overview','2 · Focus node','3 · Action','4 · Effect'], full:'Full view', focus:'Focus node',
      node:'Node #{node}', outside:'Node #{node} · outside saved viewport', baseline:'New full Content recorded · v{version}. No Delta was saved for this update.',
      unchanged:'No new Delta for this action.', no_delta:'No Delta for the initial page.', delta_pending:'The recorded Delta appears after Effect.',
      restored:'Full page restored from the saved baseline and exact recorded deltas.'
    },
    zh: {
      nav:'运行案例', heading:'探索 CAE Agent 的真实运行案例',
      lede:'真实记录回放：完整页面 → 聚焦 node → Action → Effect。右侧保留完整 CAE Page 与记录中的 Delta。',
      task:'原始任务', play:'播放', pause:'暂停', prev:'上一帧', next:'下一帧', screenshot:'原始网页截图', open:'打开原图 ↗',
      content:'完整 CAE Page', delta:'记录中的 Delta', action:'Action', effect:'Effect', result:'归档结果', initial:'初始保存页面', final:'最终保存画面',
      no_action:'尚未执行动作。', no_effect:'初始观测，尚无浏览器 Effect。', wait_action:'接下来展示记录中的动作。', wait_effect:'等待记录中的 Effect…',
      frame:'第 {n} / {total} 帧', attempt:'第 {n} / {total} 次动作尝试', line_info:'完整页面 · 共 {total} 行 · 可滚动查看',
      source:'来源与运行结果', saved:'已保存的成功判定 · 脚本检查', reviewed:'已保存的成功判定 · 证据复核',
      note:'保留原始帧与重试。高亮框标注可见控件；截图视口外的 node 会注明。回放缩短了等待时间。',
      file:'原图：{file}', count:'{n} 张原始截图', date:'记录于 {date}', model:'模型：{model}',
      verdict_script:'归档判定：成功，来自脚本检查。', verdict_review:'归档判定：成功，来自脚本检查及保存截图的证据复核。',
      answer:'记录中的最终回答', proof:'记录 SHA-256', data:'回放数据 ↗', range:'原始截图帧', done:'记录中的最终结果：成功（reward 1.0）。', loading:'正在加载原始截图…',
      stages:['1 · 完整页面','2 · 聚焦 node','3 · Action','4 · Effect'], full:'完整视图', focus:'聚焦 node',
      node:'Node #{node}', outside:'Node #{node} · 位于原截图视口外', baseline:'本次记录了新的完整 Content · v{version}，没有保存 Delta。',
      unchanged:'本次动作没有新的 Delta。', no_delta:'初始页面尚无 Delta。', delta_pending:'Effect 出现后展示对应 Delta。',
      restored:'完整页面由保存的基线和原始 Delta 严格还原。'
    }
  };
  const lang = () => window.CAE_I18N?.lang === 'zh' ? 'zh' : 'en';
  const tr = (key, values={}) => strings[lang()][key].replace(/\{(\w+)\}/g, (token,name) => Object.hasOwn(values,name) ? String(values[name]) : token);
  const image = byId('case-image'), code = byId('case-code'), screen = byId('case-screen');
  const stage = byId('case-image-stage'), target = byId('case-target'), range = byId('case-range');
  const phaseButtons = [...root.querySelectorAll('[data-case-stage]')];
  let selected=0, index=0, phase=0, choice=null, inView=false, timer=null;
  let wide=false, camera=null, activeLine=null, renderToken=0, preload=null;
  const pageText = (c,frame) => c.pages[frame.page_ref].text;
  const wanted = () => (choice ?? !reduced.matches) && inView && !document.hidden;
  function advance() {
    const c=cases[selected];
    if (index===0 || phase===3) { index=(index+1)%c.frames.length; phase=0; wide=false; }
    else { phase++; if(c.frames[index].final && phase===1) phase=2; }
    render();
  }
  function clock() {
    clearTimeout(timer); timer=null;
    const playing=wanted();
    byId('case-play').textContent=tr(playing?'pause':'play');
    byId('case-play').setAttribute('aria-pressed',String(playing));
    if (playing && image.complete && image.naturalWidth) {
      const f=cases[selected].frames[index];
      const duration=index===0?2400:phase===0?1100:phase===1?1700:phase===2?1500:f.final?3400:f.invalid?2400:3400;
      timer=setTimeout(advance,duration);
    }
  }
  function drawText(el,text,node,delta=false) {
    el.replaceChildren();
    text.split('\n').forEach((line,i)=>{
      if(i)el.append(document.createTextNode('\n'));
      const span=document.createElement('span');span.textContent=line;
      if(delta && line.startsWith('+ '))span.classList.add('case-line-add');
      if(delta && line.startsWith('- '))span.classList.add('case-line-remove');
      if(node && line.includes('|'+node+'|'))span.classList.add('case-line-active');
      el.append(span);
    });
  }
  function positionCode(smooth=false) {
    const zoom=camera?.zoom && !wide;
    code.classList.toggle('case-code-focused',Boolean(zoom));
    const top=zoom && activeLine ? Math.max(0,activeLine.offsetTop-code.clientHeight*.4) : 0;
    code.scrollTo({top,left:0,behavior:smooth&&!reduced.matches?'smooth':'instant'});
  }
  function positionCamera() {
    if(!camera || !image.naturalWidth)return;
    const width=screen.clientWidth,height=screen.clientHeight;
    const fit=Math.min(width/1920,height/1080),iw=1920*fit,ih=1080*fit;
    const left=(width-iw)/2,top=(height-ih)/2;
    Object.assign(stage.style,{width:iw+'px',height:ih+'px',left:left+'px',top:top+'px'});
    const zoom=camera.zoom&&!wide,area=camera.area;
    let scale=1,tx=0,ty=0;
    if(zoom && area) {
      const [x,y,w,h]=area.region;
      scale=Math.max(2.2,Math.min(4.8,width/(w*fit*1.5),height/(h*fit*1.8)));
      tx=Math.max(width-left-scale*iw,Math.min(-left,width/2-left-scale*(x+w/2)*fit));
      ty=Math.max(height-top-scale*ih,Math.min(-top,height/2-top-scale*(y+h/2)*fit));
    }
    stage.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
    stage.style.setProperty('--case-scale',scale);
    target.hidden=!(zoom && area?.target);
    if(!target.hidden) {
      const [x,y,w,h]=area.target;
      Object.assign(target.style,{left:x*fit+'px',top:y*fit+'px',width:w*fit+'px',height:h*fit+'px'});
    }
    const badge=byId('case-node-badge');
    badge.hidden=!(zoom && camera.node && area);
    if(!badge.hidden)badge.textContent=tr(area.target?'node':'outside',{node:camera.node});
    screen.dataset.zoomed=String(Boolean(zoom&&area));
    screen.dataset.targetVisible=String(!target.hidden);
  }
  function showImage(frame,title) {
    const url=frame.screenshot+'?v='+frame.screenshot_sha256.slice(0,12);
    screen.dataset.loadingLabel=tr('loading');
    image.onload=()=>{screen.dataset.loading='false';positionCamera();clock();};
    if(image.getAttribute('src')!==url) {
      screen.dataset.loading='true';image.src=url;
    }
    if(image.complete&&image.naturalWidth)screen.dataset.loading='false';
    image.alt=title+' · '+tr('file',{file:frame.screenshot.split('/').at(-1)});
    byId('case-open-image').href=url;byId('case-image-link').href=url;
    byId('case-image-info').textContent=tr('file',{file:frame.screenshot.split('/').at(-1)});
    positionCamera();
  }
  function render(manual=false) {
    const token=++renderToken,c=cases[selected],f=c.frames[index];
    const effect=index===0||phase===3,display=effect?f:c.frames[index-1];
    const node=f.focus?.node_id,area=f.focus?.[effect?'after':'before'];
    const oldKey=code.dataset.pageRef,zoom=index>0&&phase>0&&!f.final&&Boolean(area);
    camera={node,area,zoom};
    root.querySelectorAll('[data-case-copy]').forEach(el=>el.textContent=tr(el.dataset.caseCopy));
    document.querySelectorAll('[data-case-copy="nav"]').forEach(el=>el.textContent=tr('nav'));
    root.querySelectorAll('[data-case-select]').forEach((button,i)=>{
      const item=cases[i];button.setAttribute('aria-pressed',String(i===selected));
      button.querySelector('.case-choice-title').textContent=item.title[lang()];
      button.querySelector('.case-choice-meta').textContent=item.model+' · '+item.recorded_date+' · '+tr('count',{n:item.frames.length});
    });
    byId('case-task-text').textContent=c.task;
    byId('case-model').textContent=tr('model',{model:c.model});byId('case-date').textContent=tr('date',{date:c.recorded_date});
    byId('case-verdict').textContent=tr(c.outcome.verdict_source==='script'?'saved':'reviewed');
    byId('case-position').textContent=f.final?tr('final'):f.attempt?tr('attempt',{n:f.attempt,total:c.attempts}):tr('initial');
    phaseButtons.forEach((button,i)=>{
      button.textContent=strings[lang()].stages[i];button.setAttribute('aria-pressed',String(i===phase));
      button.disabled=index===0&&i>0 || f.final&&i===1;
    });
    byId('case-full-view').textContent=tr(wide?'focus':'full');byId('case-full-view').setAttribute('aria-pressed',String(wide));
    byId('case-full-view').disabled=!zoom;
    showImage(display,c.title[lang()]);
    byId('case-code-title').textContent=tr('content')+' · v'+display.version;
    const text=pageText(c,display);
    drawText(code,text,zoom?node:null);code.dataset.pageRef=display.page_ref;
    activeLine=code.querySelector('.case-line-active');
    byId('case-line-info').textContent=tr('line_info',{total:c.pages[display.page_ref].line_count});
    code.title=display.page_source==='saved_baseline_plus_exact_deltas'?tr('restored'):'';
    positionCode(zoom&&oldKey===display.page_ref);
    byId('case-delta-title').textContent=tr('delta')+(effect&&f.delta?' · v'+f.version:'');
    const deltaText=!effect?tr('delta_pending'):f.delta||tr(index===0?'no_delta':f.page_source==='saved_full_content'&&f.page_ref!==c.frames[Math.max(0,index-1)].page_ref?'baseline':'unchanged',{version:f.version});
    drawText(byId('case-delta'),deltaText,effect?node:null,true);byId('case-delta').scrollTop=0;
    const actionShown=index>0&&phase>=2,effectShown=index>0&&phase===3;
    byId('case-action').textContent=actionShown?f.action:tr(index===0?'no_action':'wait_action');
    byId('case-effect').textContent=effectShown?(f.effect||tr('done')):tr(index===0?'no_effect':'wait_effect');
    byId('case-action').dataset.revealed=String(actionShown);byId('case-effect').dataset.revealed=String(effectShown);
    byId('case-effect-label').textContent=tr(f.final?'result':'effect');byId('case-effect-row').dataset.invalid=String(effectShown&&f.invalid);
    byId('case-counter').textContent=tr('frame',{n:index+1,total:c.frames.length});range.max=String(c.frames.length-1);range.value=String(index);
    range.setAttribute('aria-label',tr('range'));range.setAttribute('aria-valuetext',byId('case-counter').textContent);
    byId('case-prev').setAttribute('aria-label',tr('prev'));byId('case-next').setAttribute('aria-label',tr('next'));
    byId('case-answer-title').textContent=tr('answer');byId('case-answer').textContent=c.result;
    byId('case-verdict-detail').textContent=tr(c.outcome.verdict_source==='script'?'verdict_script':'verdict_review');byId('case-proof').textContent=c.record_sha256;
    if(manual)byId('case-announce').textContent=c.title[lang()]+' · '+byId('case-counter').textContent+' · '+strings[lang()].stages[phase];
    root.dataset.phase=String(phase);root.dataset.case=c.id;root.dataset.frame=String(index+1);
    // Only a new full baseline is revealed after navigation. Every original row remains in the DOM.
    if(effect&&index>0&&oldKey!==display.page_ref&&display.page_source==='saved_full_content'&&!reduced.matches) {
      const lines=[...code.children];lines.forEach((el,i)=>{el.style.animationDelay=(Math.floor(i/Math.max(1,Math.ceil(lines.length/20)))*24)+'ms';el.classList.add('case-line-reveal');});
    }
    preload=new Image();preload.src=c.frames[(index+1)%c.frames.length].screenshot;
    requestAnimationFrame(()=>{if(token===renderToken){positionCamera();positionCode(zoom&&oldKey===display.page_ref);}});
    clock();
  }
  root.querySelectorAll('[data-case-select]').forEach((button,i)=>button.addEventListener('click',()=>{selected=i;index=0;phase=0;wide=false;render(true);}));
  byId('case-play').addEventListener('click',()=>{choice=!wanted();clock();});
  function step(direction) {choice=false;index=(index+direction+cases[selected].frames.length)%cases[selected].frames.length;phase=index?3:0;wide=false;render(true);}
  byId('case-prev').addEventListener('click',()=>step(-1));byId('case-next').addEventListener('click',()=>step(1));
  range.addEventListener('input',()=>{choice=false;index=Number(range.value);phase=index?3:0;wide=false;render(true);});
  phaseButtons.forEach((button,i)=>button.addEventListener('click',()=>{choice=false;phase=i;wide=false;render(true);}));
  byId('case-full-view').addEventListener('click',()=>{choice=false;wide=!wide;positionCamera();positionCode(true);byId('case-full-view').textContent=tr(wide?'focus':'full');byId('case-full-view').setAttribute('aria-pressed',String(wide));clock();});
  document.addEventListener('cae:languagechange',()=>render());document.addEventListener('visibilitychange',clock);
  reduced.addEventListener('change',()=>{choice=null;clock();});
  new ResizeObserver(()=>{positionCamera();positionCode();}).observe(screen);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;clock();},{threshold:.12}).observe(byId('case-player'));
  byId('case-controls').hidden=false;render();
})();
