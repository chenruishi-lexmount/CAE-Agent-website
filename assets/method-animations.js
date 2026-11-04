'use strict';
// Native explanatory animations. No network requests, agent sessions or model calls.
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-method-animation]').forEach(root=>{
    const cards=Array.from(root.querySelectorAll('[data-method-step]'));
    const isAgent=root.dataset.methodAnimation==='agent';
    const count=cards.length+(isAgent?1:0);
    const feedback=root.querySelector('.method-return');
    const delta=root.querySelector('.method-delta');
    const prefix=root.querySelector('.method-prefix');
    let step=0,elapsed=0,last=null,raf=null,inView=false;
    function labels(){
      const zh=window.CAE_I18N?.lang==='zh';
      root.querySelectorAll('[data-method-en]').forEach(el=>el.textContent=zh?el.dataset.methodZh:el.dataset.methodEn);
    }
    function draw(){
      root.dataset.step=String(step);
      root.dataset.ready='true';
      cards.forEach((card,i)=>{
        const revealed=reduced.matches||i<=step;
        card.classList.toggle('is-revealed',revealed);
        card.classList.toggle('is-connected',reduced.matches||i<step);
        card.classList.toggle('is-active',!reduced.matches&&i===step);
        card.classList.toggle('is-complete',!reduced.matches&&i<step);
        card.setAttribute('aria-hidden',String(!revealed));
      });
      for(const [panel,phase] of [[delta,1],[prefix,2],[feedback,cards.length]]){
        if(!panel)continue;
        const visible=reduced.matches||step>=phase;
        panel.classList.toggle('is-revealed',visible);
        panel.setAttribute('aria-hidden',String(!visible));
      }
    }
    function tick(now){
      raf=null;
      if(last!==null)elapsed+=Math.min(now-last,100);
      last=now;
      const duration=step===count-1?(isAgent?4400:5600):3200;
      if(elapsed>=duration){elapsed-=duration;step=(step+1)%count;draw();}
      raf=requestAnimationFrame(tick);
    }
    function playback(){
      const running=inView&&!document.hidden&&!reduced.matches;
      root.dataset.running=String(running);
      if(running&&raf===null){last=null;raf=requestAnimationFrame(tick);}
      if(!running&&raf!==null){cancelAnimationFrame(raf);raf=null;last=null;}
    }
    reduced.addEventListener('change',()=>{step=0;elapsed=0;draw();playback();});
    document.addEventListener('visibilitychange',playback);
    document.addEventListener('cae:languagechange',labels);
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;playback();},{threshold:0}).observe(root);
    labels();draw();playback();
  });
})();
