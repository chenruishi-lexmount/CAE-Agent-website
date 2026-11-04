'use strict';
// Keep the authored illustration independent of captured page examples.
(() => {
  const root=document.getElementById('flight-demo');
  if(!root)return;
  const image=root.querySelector('img'),control=root.querySelector('button');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const copy={
    en:{taskLabel:'Task',task:'Find flights from Beijing to Paris.',note:'View larger ↗',
      caption:'Illustrative interaction: full page → focus → Action → Effect',stop:'Stop animation',play:'Play animation',
      alt:'A paired browser screenshot and CAE outline of an illustrative travel website. Full Content appears line by line. Both views zoom to the same form control, input Beijing at node 41 and Paris at node 42, then click Search at node 43. Each action returns its Effect, followed by updated page Content.'},
    zh:{taskLabel:'任务',task:'查询北京到巴黎的机票。',note:'查看大图 ↗',
      caption:'交互示意：完整页面 → 聚焦目标 → 动作 → 效果',stop:'停止动画',play:'播放动画',
      alt:'旅行网页截图与 CAE 表示并排展示：先展示完整页面，41 个节点逐行出现；随后两侧同步放大到搜索字段，在节点 41 输入北京、节点 42 输入巴黎，再点击节点 43 的 Search。每个动作后均返回 Effect，最后更新页面与 Content。'}
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
