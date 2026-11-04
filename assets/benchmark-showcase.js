'use strict';
(() => {
  const root=document.getElementById('benchmark');if(!root)return;
  const payload=JSON.parse(document.getElementById('benchmark-showcase-data').textContent),examples=payload.examples;
  const el=id=>document.getElementById(id),lang=()=>window.CAE_I18N?.lang==='zh'?'zh':'en';
  const strings={
    en:{categories:'Website categories',figure:'Paper · Figure 4 ↗',category_note:'Original paper figure. Each task is counted once by its starting website.',composition:'Task sources',table3:'Paper · Table 3 ↗',source:'Source',tasks:'Tasks',hosts:'Start hosts',checks:'Checks',unique_total:'Total (unique)',host_note:'Four starting hosts are shared across sources; the total counts 129 unique hosts.',evidence:'Evidence used by tasks',table4:'Paper · Table 4 ↗',group_url:'URL or open tabs',group_page:'Page content or control state',group_storage:'Storage or API state',group_history:'Interaction history',group_answer:'Submitted answer',evidence_note:'Paper statistics. Groups overlap: one task can use several evidence types. Bars use all 197 tasks as the denominator.',examples:'Explore tasks and evaluation functions',examples_lede:"Real task definitions paired with runnable Python adapters to the repository scorer. Every adapter retains the task's complete original evaluation specification.",task:'Original task',completion:'Completion checks',all_required:'All checks must pass; declared prerequisites are preserved.',function:'Evaluation function',download:'Download .py ↓',spec:'Task specification ↗',function_note:'Calls the repository scorer with the complete task specification.',previous:'Previous task',next:'Next task',count:'Example {n} / {total}',requires:'Requires: '},
    zh:{categories:'网站类别分布',figure:'论文 · 图 4 ↗',category_note:'论文原图。每个任务按起始网站归类，且只计一次。',composition:'任务来源',table3:'论文 · 表 3 ↗',source:'来源',tasks:'任务',hosts:'起始主机',checks:'检查项',unique_total:'总计（去重）',host_note:'不同来源之间有四个共同起始主机；总计为 129 个去重后的主机。',evidence:'任务使用的证据类型',table4:'论文 · 表 4 ↗',group_url:'URL 或打开的标签页',group_page:'页面内容或控件状态',group_storage:'存储或 API 状态',group_history:'交互历史',group_answer:'提交的答案',evidence_note:'论文统计。各组允许重叠：一个任务可使用多种证据。柱形均以全部 197 个任务为分母。',examples:'探索任务与 evaluation 函数',examples_lede:'真实任务定义与可运行的 Python 判分适配函数对应展示。每个函数保留该任务完整的原始 evaluation specification，并调用仓库中的判分器。',task:'原始任务',completion:'完成检查项',all_required:'所有检查项均须通过，并保留定义中的前置依赖。',function:'Evaluation 函数',download:'下载 .py ↓',spec:'任务定义 ↗',function_note:'使用完整任务定义，调用仓库中的判分器。',previous:'上一个任务',next:'下一个任务',count:'示例 {n} / {total}',requires:'前置检查：'}
  };
  let index=0;
  const tr=(key,values={})=>strings[lang()][key].replace(/\{(\w+)\}/g,(token,key)=>Object.hasOwn(values,key)?String(values[key]):token);
  function render(announce=false){
    const item=examples[index];root.querySelectorAll('[data-bench-copy]').forEach(node=>node.textContent=tr(node.dataset.benchCopy));
    el('bench-example-title').textContent=item.title[lang()];el('bench-example-count').textContent=tr('count',{n:index+1,total:examples.length});
    el('bench-example-kind').textContent=item.kind[lang()];el('bench-example-source').textContent=item.source;el('bench-task-id').textContent=item.task_id;
    el('bench-task').textContent=item.task;el('bench-website').href=item.website;el('bench-website').textContent=new URL(item.website).hostname+' ↗';
    el('bench-example-prev').setAttribute('aria-label',tr('previous'));el('bench-example-next').setAttribute('aria-label',tr('next'));el('bench-example-card').setAttribute('aria-label',item.title[lang()]);
    const checks=el('bench-checks');checks.replaceChildren();
    item.checks.forEach(check=>{const li=document.createElement('li'),label=document.createElement('strong'),flow=document.createElement('code');label.textContent=check.title[lang()];flow.textContent=check.result_getter+' × '+check.reference_getter+' → '+check.metric;li.append(label,flow);if(check.requires.length){const dependency=document.createElement('span');dependency.textContent=tr('requires')+check.requires.join(', ');li.append(dependency);}checks.append(li);});
    const code=el('bench-function');code.replaceChildren();item.function_code.split('\n').forEach((line,i)=>{if(i)code.append(document.createTextNode('\n'));const row=document.createElement('span');row.textContent=line;if(/^#/.test(line))row.className='bench-code-comment';else if(/^(def |from )/.test(line))row.className='bench-code-keyword';code.append(row);});code.scrollTop=0;code.scrollLeft=0;
    el('bench-download').href=item.function_href;el('bench-download').download=item.function_name+'.py';el('bench-task-json').href=item.task_href;
    if(announce)el('bench-announce').textContent=tr('count',{n:index+1,total:examples.length})+' · '+item.title[lang()];
    root.dataset.example=item.task_id;
  }
  function move(direction){index=(index+direction+examples.length)%examples.length;render(true);}
  el('bench-example-prev').addEventListener('click',()=>move(-1));el('bench-example-next').addEventListener('click',()=>move(1));
  document.addEventListener('cae:languagechange',()=>render());render();
})();
