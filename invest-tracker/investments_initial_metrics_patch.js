(()=>{
  const keyKeep={netReturn:1,annualNet:1};
  const titleKeep={'Rendimento totale netto':1,'Media annua netta':1,'Netto mensile stimato':1};
  function apply(){
    const box=document.getElementById('metricControls');
    const dash=document.getElementById('dashboard');
    if(!box||!dash)return;
    if(box.dataset.initialKeyMetricsDone!=='1'){
      const list=box.querySelectorAll('[data-metric-check]');
      if(list.length){
        list.forEach(el=>{el.checked=!!keyKeep[el.value];});
        box.dataset.initialKeyMetricsDone='1';
      }
    }
    const month=document.getElementById('monthlyNetMetricCheck');
    if(month)month.checked=true;
    dash.querySelectorAll('.card').forEach(card=>{
      const h=card.querySelector('h3');
      const t=h?h.textContent.trim():'';
      if(!titleKeep[t])card.remove();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  [300,900,1700,2600,4200].forEach(t=>setTimeout(apply,t));
})();
