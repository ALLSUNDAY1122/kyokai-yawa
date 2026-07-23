(()=>{
  const root=document.querySelector('[data-status-page]');
  if(!root)return;
  const SOURCE='/kyokai-yawa/reports/public-monitoring-history.json';
  const expectedKinds=['reading','site-health','offline','incident-config'];
  const labels={reading:'読書機能・54ページ品質','site-health':'54ページ品質','offline':'オフライン・PWA','incident-config':'障害Issue通知設定'};
  const overall=root.querySelector('[data-status-overall]');
  const updated=root.querySelector('[data-status-updated]');
  const updatedNote=root.querySelector('[data-status-updated-note]');
  const grid=root.querySelector('[data-status-grid]');
  const historyBody=root.querySelector('[data-status-history]');
  const message=root.querySelector('[data-status-message]');
  const formatDate=value=>{
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return '日時不明';
    return new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date).replaceAll('/','.');
  };
  const metric=value=>value===null||value===undefined?'—':String(value);
  const duration=value=>Number.isFinite(Number(value))?`${Number(value).toFixed(1)}秒`:'—';
  const stateLabel=status=>status==='passed'?'正常':'要確認';
  const latestEntries=entries=>{
    const sorted=[...entries].sort((a,b)=>Date.parse(b.executedAt||0)-Date.parse(a.executedAt||0));
    return expectedKinds.map(kind=>sorted.find(entry=>entry.kind===kind)).filter(Boolean);
  };
  const renderCard=entry=>{
    const article=document.createElement('article');
    article.className='status-card';
    const status=entry.status==='passed'?'passed':'failed';
    article.innerHTML=`<div class="status-card__head"><h2>${labels[entry.kind]||entry.label||entry.kind}</h2><span class="state-pill" data-state="${status}">${stateLabel(status)}</span></div><time datetime="${entry.executedAt||''}">${formatDate(entry.executedAt)}</time><dl class="metrics"><div><dt>成功</dt><dd>${metric(entry.passed)}</dd></div><div><dt>失敗</dt><dd>${metric(entry.failed)}</dd></div><div><dt>警告</dt><dd>${metric(entry.warnings)}</dd></div><div><dt>所要時間</dt><dd>${duration(entry.durationSeconds)}</dd></div></dl>`;
    return article;
  };
  const renderHistoryRow=entry=>{
    const row=document.createElement('tr');
    const status=entry.status==='passed'?'passed':'failed';
    row.innerHTML=`<td>${formatDate(entry.executedAt)}</td><td><strong>${labels[entry.kind]||entry.label||entry.kind}</strong></td><td><span class="history-state" data-state="${status}">${stateLabel(status)}</span></td><td>${metric(entry.passed)}</td><td>${metric(entry.failed)}</td><td>${metric(entry.warnings)}</td><td>${duration(entry.durationSeconds)}</td>`;
    return row;
  };
  const render=data=>{
    if(!data||data.version!==1||!Array.isArray(data.entries))throw new Error('監視履歴の形式が不正です。');
    const entries=data.entries.filter(entry=>entry&&typeof entry==='object'&&expectedKinds.includes(entry.kind));
    const latest=latestEntries(entries);
    if(latest.length!==expectedKinds.length)throw new Error('必要な監視結果がそろっていません。');
    const healthy=latest.every(entry=>entry.status==='passed'&&Number(entry.failed||0)===0);
    overall.dataset.state=healthy?'passed':'failed';
    overall.textContent=healthy?'正常':'要確認';
    const updatedAt=data.updatedAt||latest.map(entry=>entry.executedAt).sort().at(-1);
    updated.dateTime=updatedAt||'';
    updated.textContent=formatDate(updatedAt);
    updatedNote.textContent='表示中のデータは同一サイト内の監査履歴から取得しています。';
    grid.replaceChildren(...latest.map(renderCard));
    const history=[...entries].sort((a,b)=>Date.parse(b.executedAt||0)-Date.parse(a.executedAt||0)).slice(0,20);
    historyBody.replaceChildren(...history.map(renderHistoryRow));
    message.dataset.type=healthy?'success':'error';
    message.textContent=healthy?'すべての公開監査が正常です。':'失敗または要確認の監査があります。GitHubの障害Issueを確認してください。';
    document.documentElement.dataset.monitoringState=healthy?'passed':'failed';
  };
  const load=async()=>{
    message.dataset.type='';
    message.textContent='最新の監視結果を確認しています。';
    try{
      const response=await fetch(`${SOURCE}?t=${Date.now()}`,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok)throw new Error(`監視履歴を取得できませんでした（HTTP ${response.status}）。`);
      render(await response.json());
    }catch(error){
      overall.dataset.state='failed';
      overall.textContent='取得失敗';
      message.dataset.type='error';
      message.textContent=error instanceof Error?error.message:'監視結果を表示できませんでした。';
    }
  };
  load();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')load();},5*60*1000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load();});
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();