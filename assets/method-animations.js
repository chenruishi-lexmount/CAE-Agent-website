'use strict';
// Native explanatory animations. No network requests, agent sessions or model calls.
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-method-animation]').forEach(root=>{
    const cards=Array.from(root.querySelectorAll('[data-method-step]'));
    const button=root.querySelector('[data-method-toggle]');
    const progress=root.querySelector('[data-method-progress]');
    button.hidden=false;
    const isAgent=root.dataset.methodAnimation==='agent';
    const count=cards.length+(isAgent?1:0),duration=3200;
    let step=0,elapsed=0,last=null,raf=null,inView=false,paused=reduced.matches;
    function labels(){
      const zh=window.CAE_I18N?.lang==='zh';
      root.querySelectorAll('[data-method-en]').forEach(el=>el.textContent=zh?el.dataset.methodZh:el.dataset.methodEn);
      button.textContent=zh?(paused?'播放动画':'暂停动画'):(paused?'Play animation':'Pause animation');
      button.setAttribute('aria-pressed',String(paused));
      const title=step<cards.length?cards[step].querySelector('.method-card-title [data-method-en]').textContent:(zh?'返回 Effect，开始下一轮':'Return Effect · next iteration');
      progress.textContent=`${String(step+1).padStart(2,'0')} / ${String(count).padStart(2,'0')} · ${title}`;
    }
    function draw(){
      root.dataset.step=String(step);
      cards.forEach((card,i)=>{card.classList.toggle('is-active',i===step);card.classList.toggle('is-complete',i<step);});
      labels();
    }
    function tick(now){
      raf=null;
      if(last!==null)elapsed+=Math.min(now-last,100);
      last=now;
      if(elapsed>=duration){elapsed-=duration;step=(step+1)%count;draw();}
      raf=requestAnimationFrame(tick);
    }
    function playback(){
      const running=inView&&!document.hidden&&!paused;
      root.dataset.running=String(running);
      if(running&&raf===null){last=null;raf=requestAnimationFrame(tick);}
      if(!running&&raf!==null){cancelAnimationFrame(raf);raf=null;last=null;}
      labels();
    }
    button.addEventListener('click',()=>{paused=!paused;playback();});
    reduced.addEventListener('change',()=>{paused=reduced.matches;playback();});
    document.addEventListener('visibilitychange',playback);
    document.addEventListener('cae:languagechange',labels);
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;playback();},{threshold:0}).observe(root);
    draw();playback();
  });
})();
