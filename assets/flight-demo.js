'use strict';
// Keep the authored illustration independent of captured page examples.
(() => {
  const root=document.getElementById('flight-demo');
  if(!root)return;
  const image=root.querySelector('img'),control=root.querySelector('button');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const copy={
    en:{taskLabel:'Task',task:'Find flights from Beijing to Paris.',note:'Illustrative interaction',
      caption:'Content appears. Actions run. Effects return.',stop:'Stop animation',play:'Play animation',
      alt:'Animated CAE example: load a flight-search page, reveal its Content line by line, input Beijing at node 41 and receive its field-change Effect, input Paris at node 42 and receive its Effect, then click Search at node 43 and observe navigation to an updated results page.'},
    zh:{taskLabel:'任务',task:'查询北京到巴黎的机票。',note:'交互流程示意',
      caption:'页面内容逐行呈现，动作执行，效果返回。',stop:'停止动画',play:'播放动画',
      alt:'CAE 动画示例：加载机票查询网页，逐行呈现 Content；在节点 41 输入北京并返回字段变化 Effect；在节点 42 输入巴黎并返回 Effect；最后点击节点 43 的 Search 按钮，返回导航完成和结果页面更新。'}
  };
  let chosenPlayback=null;
  function update(){
    const strings=copy[window.CAE_I18N?.lang==='zh'?'zh':'en'];
    root.parentElement.querySelectorAll('[data-demo-copy]').forEach(node=>node.textContent=strings[node.dataset.demoCopy]);
    image.alt=strings.alt;
    const running=(chosenPlayback??!reducedMotion.matches)&&!document.hidden;
    const source=running?image.dataset.animation:image.dataset.poster;
    if(image.getAttribute('src')!==source)image.src=source;
    control.dataset.running=String(running);
    control.textContent=running?strings.stop:strings.play;
    control.hidden=false;
  }
  control.addEventListener('click',()=>{chosenPlayback=control.dataset.running!=='true';update();});
  reducedMotion.addEventListener('change',()=>{chosenPlayback=null;update();});
  document.addEventListener('visibilitychange',update);
  document.addEventListener('cae:languagechange',update);
  update();
})();
