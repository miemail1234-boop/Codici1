(() => {
"use strict";
// Dashboard AUTONOMA, in sola lettura: nessuna modifica alle tabelle legacy.
const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
const client = window.supabase && window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const INCEPTION = "2023-09-19";
const COLORS = ["#69c8ca","#e3bd7c","#81a4ed","#bcabeb","#8bdbb0","#ef9fa8","#82bcca","#e5a87a","#b0c1db","#d5db87","#d29ccc","#87d4a9"];
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(Number(n)||0);
const percent = n => Number.isFinite(n) ? new Intl.NumberFormat("it-IT",{style:"percent",minimumFractionDigits:1,maximumFractionDigits:2}).format(n) : "n.d.";
const fmtDate = d => {const s=String(d||"");if(!/^\d{4}-\d\d-\d\d$/.test(s))return s;return s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4);};
const safe = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num = x => Number(x)||0;
const dayMs = d => Date.parse(d+"T12:00:00Z");
const days = (a,b) => (dayMs(b)-dayMs(a))/86400000;
const unique = arr => [...new Set(arr)];
const taxRate = .26;
const state = {assets:[],entries:[],flows:[],trades:[],movements:[],balances:[],marketIndex:[],settings:null,positions:[],accountCash:{},tax:0,taxUncertain:false,brokerValue:0,netContributions:0, asof:"2026-11-21", primarySeries:"broker", returnMode:"value", limit:100, houseMode:"market", purchaseCosts:null, ownerCosts:null, assumedHouseGrowth:2};
const getValue = x => num(x?.current_value);
const byDate = (a,b) => String(a.date||"").localeCompare(String(b.date||""));
function latest(rows) {return rows.slice().sort((a,b)=>byDate(b,a)||num(b.created_at_ms)-num(a.created_at_ms)||String(b.updated_at||"").localeCompare(String(a.updated_at||"")))[0]||null;}
function contributionFlows() {
 return state.flows.filter(f => String(f.id).startsWith("sc-history-") || String(f.id).startsWith("tr-pdf-netexternal-"))
 .filter(f=>f.type==="deposit_external"||f.type==="withdraw_external")
 .map(f=>({date:f.date,value:(f.type==="deposit_external"?-1:1)*num(f.amount)})).sort(byDate);
}
function xirr(cashFlows) {
 const fs=cashFlows.filter(x=>Number.isFinite(x.value)).slice().sort(byDate);
 if(fs.length<2||!fs.some(x=>x.value<0)||!fs.some(x=>x.value>0))return null;
 const t0=fs[0].date;
 const npv = rate => fs.reduce((sum,x)=>sum+x.value/Math.pow(1+rate,days(t0,x.date)/365.25),0);
 let low=-.9999,high=1,fa=npv(low),fb=npv(high);
 for(let i=0;i<28 && fa*fb>0;i++){high=high*2+1;fb=npv(high);}
 if(!Number.isFinite(fa)||!Number.isFinite(fb)||fa*fb>0)return null;
 for(let i=0;i<135;i++){const middle=(low+high)/2,fm=npv(middle);if(!Number.isFinite(fm))break;if(fa*fm<=0){high=middle;fb=fm;}else{low=middle;fa=fm;}}
 return (low+high)/2;
}
function rollingBasis(assetId,date) {
 const ts=state.trades.filter(t=>t.asset_id===assetId && t.date<=date).sort((a,b)=>byDate(a,b)||String(a.created_at||"").localeCompare(String(b.created_at||"")));
 let quantity=0,cost=0;
 for(const t of ts) {const qty=num(t.quantity),amount=num(t.amount),fee=num(t.fee);
  if(t.side==="buy"){quantity+=qty;cost+=amount+fee;}
  else if(t.side==="sell"&&quantity>0){const sold=Math.min(qty,quantity);const fraction=sold/quantity;cost*=Math.max(0,1-fraction);quantity-=sold;if(quantity<1e-7){quantity=0;cost=0;}}
 }
 return {quantity,cost};
}
function classify(name) {const n=name.toLowerCase();if(n.includes("overnight"))return "Monetario";if(n.includes("nasdaq"))return "Nasdaq 100";if(n.includes("ex-usa")||n.includes("occidente"))return "Azionario ex USA";if(n.includes("minimum volatility"))return "Azionario globale";if(n.includes("physical gold"))return "Oro";if(n.includes("managed futures")||n.includes("dbi"))return "Managed futures";if(n.includes("bitcoin")||n.includes("eth core"))return "Cripto ETP";return "Azionario/altro";}
function brokerName(n) {return n==="Scalable Capital"?"Scalable Capital":n==="Trade Republic"?"Trade Republic":n;}
async function readAll(table,uid,order="date") {
 let result=[],from=0;for(let part=0;part<40;part++){
 let query=client.from(table).select("*").eq("user_id",uid).order(order,{ascending:true});
 if(!["portfolio_dashboard_balances","portfolio_dashboard_scenarios","portfolio_dashboard_property_index"].includes(table))query=query.order("id",{ascending:true});
 const res=await query.range(from,from+999);
 if(res.error)throw new Error(table+": "+res.error.message);
 const rows=res.data||[];result.push(...rows);if(rows.length<1000)break;from+=1000;
 }
 return result;
}
async function load() {
 if(!client){$("auth").innerHTML="<h2>Errore caricamento</h2><p>La libreria Supabase non è disponibile.</p>";return;}
 $("auth").hidden=false;$("auth").innerHTML="<h2>Connessione protetta</h2><p>Lettura dei dati riservati in corso…</p>";
 $("dashboard").hidden=true;
 try{
 const {data,error}=await client.auth.getSession();
 if(error)throw error;
 if(!data?.session) {$("auth").innerHTML='<h2>Accedi per vedere il patrimonio</h2><p>Questa dashboard non pubblica i tuoi dati. Effettua prima l’accesso Supabase dal modulo <a href="../life-tracker/" target="_blank" rel="noopener">Life Tracker → Dati → Cloud Supabase</a>, poi torna qui e premi «Aggiorna».</p>';return;}
 const uid=data.session.user.id;
 const [assets,entries,flows,trades,movements,balances,settings,marketIndex]=await Promise.all([
 readAll("investment_assets",uid,"id"),readAll("investment_entries",uid,"date"),readAll("investment_cash_flows",uid,"date"),readAll("investment_trades",uid,"date"),readAll("portfolio_dashboard_movements",uid,"date"),readAll("portfolio_dashboard_balances",uid,"date"),readAll("portfolio_dashboard_scenarios",uid,"inception"),readAll("portfolio_dashboard_property_index",uid,"month")
 ]);
 Object.assign(state,{assets,entries,flows,trades,movements,balances,marketIndex,settings:settings[0]||null});
 prepare();render();
 $("auth").hidden=true;$("dashboard").hidden=false;
 }catch(error){console.error(error);$("auth").hidden=false;$("auth").innerHTML='<h2>Errore di caricamento</h2><p>'+safe(error.message||"Impossibile accedere a Supabase")+'</p><p>La dashboard originale rimane indipendente e utilizzabile.</p>';}
}
function prepare(){
 const pos=[];
 for(const asset of state.assets){
  const current=latest(state.entries.filter(e=>e.generic_option===asset.block_id));
  if(!current||getValue(current)<=0)continue;
  pos.push({...asset,value:getValue(current),valuationDate:current.date,categoryName:classify(asset.name)});
 }
 state.positions=pos.sort((a,b)=>b.value-a.value);
 const cash={};
 for(const acct of ["Scalable Capital","Trade Republic"]){
  const f=latest(state.flows.filter(x=>x.type==="cash_balance"&&x.broker===acct));cash[acct]=f?num(f.amount):0;
 }
 const fin=latest(state.balances.filter(x=>x.account==="Fineco"));cash.Fineco=fin?num(fin.balance):0;
 state.accountCash=cash;
 const brokerAssets=pos.reduce((t,x)=>t+x.value,0);
 state.brokerValue=brokerAssets+cash["Scalable Capital"]+cash["Trade Republic"];
 const cs=contributionFlows();
 state.netContributions=-cs.reduce((t,x)=>t+x.value,0);
 state.asof=state.entries.reduce((max,e)=>e.date>max?e.date:max,INCEPTION);
 state.tax=0;state.taxUncertain=false;
 for(const asset of pos){const basis=rollingBasis(asset.id,state.asof);
  if(basis.quantity<=0||basis.cost<=0){state.taxUncertain=true;continue;}
  state.tax+=taxRate*Math.max(0,asset.value-basis.cost);
 }
 state.tax=Math.round(state.tax*100)/100;
}
function allocation(){
 const parts=state.positions.map(p=>({name:p.name,category:p.categoryName,account:brokerName(p.broker),value:p.value}));
 parts.push({name:"Liquidità Fineco",account:"Fineco",category:"Liquidità",value:state.accountCash.Fineco});
 parts.push({name:"Liquidità Trade Republic",account:"Trade Republic",category:"Liquidità",value:state.accountCash["Trade Republic"]});
 parts.push({name:"Liquidità Scalable",account:"Scalable Capital",category:"Liquidità",value:state.accountCash["Scalable Capital"]});
 return parts.filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
}
function render(){
 const parts=allocation(),grand=parts.reduce((v,p)=>v+p.value,0),invested=state.positions.reduce((v,p)=>v+p.value,0);
 $("totalWealth").textContent=money(grand);
 $("investedShare").textContent=percent(grand?invested/grand:0);
 $("asOf").textContent="Situazione ricostruita al "+fmtDate(state.asof)+" · dati non in tempo reale · cripto TR convenzionalmente a zero";
 const accountTotals={"Scalable Capital":state.accountCash["Scalable Capital"],"Trade Republic":state.accountCash["Trade Republic"],"Fineco":state.accountCash.Fineco};
 state.positions.forEach(p=>accountTotals[brokerName(p.broker)]=(accountTotals[brokerName(p.broker)]||0)+p.value);
 $("accountCards").innerHTML=Object.entries(accountTotals).map(([a,v])=>'<div class="acct"><span>'+safe(a)+'</span><strong>'+money(v)+'</strong></div>').join("");
 const allocationColors=parts.map((p,i)=>COLORS[i%COLORS.length]),segments=[];let start=0;
 for(let i=0;i<parts.length;i++){const end=start+100*parts[i].value/grand;segments.push(allocationColors[i]+' '+start.toFixed(3)+'% '+end.toFixed(3)+'%');start=end;}
 $("donut").style.background="conic-gradient("+segments.join(",")+")";
 $("allocationLegend").innerHTML=parts.slice(0,9).map((p,i)=>'<div class="legend-row"><span><i class="swatch" style="background:'+allocationColors[i]+'"></i>'+safe(p.name)+'</span><b>'+percent(p.value/grand)+'</b></div>').join("")+(parts.length>9?'<div class="legend-row">+'+(parts.length-9)+' altre voci</div>':"");
 const flows=contributionFlows(),gross=xirr([...flows,{date:state.asof,value:state.brokerValue}]),net=xirr([...flows,{date:state.asof,value:state.brokerValue-state.tax}]);
 const grossGain=state.brokerValue-state.netContributions,netGain=grossGain-state.tax;
 const months=Math.max(.1,days(INCEPTION,state.asof)/365.25*12);
 $("grossRate").textContent=percent(gross);$("netRate").textContent=percent(net);
 $("netGain").textContent=money(netGain);$("monthlyGain").textContent=money(netGain/months);
 $("taxNote").innerHTML="Stima imposte di liquidazione sulle <strong>posizioni aperte</strong>: "+money(state.tax)+" (aliquota indicativa del 26% sulle sole plusvalenze positive, senza compensare automaticamente perdite ETF). Il netto non comprende eventuali imposte pregresse ancora da dichiarare"+(state.taxUncertain?", con costo fiscale non ricostruito per alcune posizioni.":".")+" Il rendimento storico esclude Fineco come capitale investito.";
 $("holdingsTable").innerHTML=parts.map((p,i)=>'<div class="hold-row"><div><strong title="'+safe(p.name)+'">'+safe(p.name)+'</strong><small>'+safe(p.account)+' · '+safe(p.category)+'</small><div class="mini-bar"><div style="width:'+(100*p.value/grand).toFixed(2)+'%;background:'+allocationColors[i]+'"></div></div></div><div class="pct">'+percent(p.value/grand)+'</div><div class="money">'+money(p.value)+'</div></div>').join("");
 renderHousing();buildSelect();buildKindFilter();renderChart();renderMovements();renderMethodology();
}
function getRentUntil(date){
 const rent=state.settings?num(state.settings.monthly_rent_saved):940;
 return rent*Math.max(0,days(INCEPTION,date))/30.4375;
}
function housingAt(date){
 const purchase=state.settings?num(state.settings.house_purchase_price):250000;
 const rent=getRentUntil(date);
 const market=state.marketIndex.slice().sort((a,b)=>String(a.month).localeCompare(String(b.month)));
 const base=market[0], current=market.filter(x=>x.month<=date.slice(0,7)+"-01").at(-1);
 const isMarket=state.houseMode==="market"&&base&&current;
 const years=Math.max(0,days(INCEPTION,date)/365.25);
 const change=isMarket?num(current.asking_price_eur_sqm)/num(base.asking_price_eur_sqm)-1:Math.pow(1+state.assumedHouseGrowth/100,years)-1;
 const value=purchase*(1+change);
 const initial=state.purchaseCosts==null?num(state.settings?.one_time_purchase_cost):state.purchaseCosts;
 const monthly=state.ownerCosts==null?num(state.settings?.monthly_owner_cost):state.ownerCosts;
 const cost=initial+monthly*Math.max(0,days(INCEPTION,date)/30.4375);
 return {purchase,rent,change,value,appreciation:value-purchase,acquisitionCosts:initial,monthlyCosts:monthly,cost,benefit:value-purchase+rent-cost,flat:rent-cost,market:!!isMarket,month:current?.month||null,basePrice:base?num(base.asking_price_eur_sqm):null,currentPrice:current?num(current.asking_price_eur_sqm):null};
}
function renderHousing(){
 const h=housingAt(state.asof);
 const fromDb=state.settings?.one_time_purchase_cost!=null && state.settings?.monthly_owner_cost!=null;
 const costsSpecified=(state.purchaseCosts!=null&&state.ownerCosts!=null)||fromDb;
 $("marketChange").textContent=state.marketIndex.length>1?percent(num(state.marketIndex.at(-1).asking_price_eur_sqm)/num(state.marketIndex[0].asking_price_eur_sqm)-1):"n.d.";
 $("marketPeriod").textContent=state.marketIndex.length>1?
  "Idealista: "+Math.round(h.basePrice).toLocaleString("it-IT")+" €/m² (09/2023) → "+Math.round(num(state.marketIndex.at(-1).asking_price_eur_sqm)).toLocaleString("it-IT")+" €/m² ("+fmtDate(state.marketIndex.at(-1).month).slice(3)+")":"Indice di mercato non disponibile";
 $("houseImpliedValue").textContent=money(h.value);
 $("houseAppreciation").textContent=(h.appreciation>=0?"+":"")+money(h.appreciation);
 $("savedRent").textContent=money(h.rent);
 $("flatHouse").textContent=money(h.flat);
 $("appreciatedHouse").textContent=money(h.benefit);
 $("houseGrowthValue").textContent=(state.assumedHouseGrowth>=0?"+":"")+state.assumedHouseGrowth.toFixed(1).replace(".",",")+"%";
 $("houseMode").value=state.houseMode;
 $("houseScenarioControls").hidden=state.houseMode!=="scenario";
 $("houseCaveat").textContent=(h.market?
   "Rivalutazione indicativa derivata dai prezzi richiesti a Monza, non dal prezzo delle compravendite o da una perizia. Dal luglio 2026 Idealista segnala un cambio di metodologia. ":"Rivalutazione simulata, non osservata sul mercato. ")+
   (costsSpecified?"Costi iniziali e mensili ipotizzati inclusi. ":"Costi di acquisto e proprietà non ancora quantificati: beneficio LORDO di queste spese. ")+
   "Affitto evitato calcolato pro rata a 940 €/mese, non imponibile. Acquisto ipotetico da 250.000 € nel 2023: NON equivale ai versamenti realmente effettuati nei broker.";
}
function buildSelect(){
 const old=$("seriesSelect").value;
 $("seriesSelect").innerHTML='<option value="broker">Conti broker · titoli e liquidità</option><option value="global">Patrimonio globale (incluso Fineco)</option><option value="invested">Solo valore dei titoli</option><option value="netgain">Risultato broker netto parziale</option><option value="capital">Capitale netto conferito ai broker</option><option value="house">Casa: beneficio economico teorico</option>'+
 state.positions.map(p=>'<option value="asset:'+safe(p.id)+'">'+safe(p.name)+' ('+safe(p.broker)+')</option>').join("");
 $("seriesSelect").value=[...$("seriesSelect").options].some(x=>x.value===old)?old:"broker";
}
function buildKindFilter(){
 const old=$("kindFilter").value;
 const categories=unique(state.movements.map(x=>x.category)).sort((a,b)=>a.localeCompare(b));
 $("kindFilter").innerHTML='<option value="all">Tutti i tipi</option>'+categories.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join("");
 $("kindFilter").value=categories.includes(old)?old:"all";
}
function chartDates(){
 const end=state.asof;const out=[INCEPTION];
 let y=2023,m=10;
 while(y<Number(end.slice(0,4))||(y===Number(end.slice(0,4))&&m<=Number(end.slice(5,7)))){
  const iso=y+'-'+String(m).padStart(2,"0")+'-01',next=new Date(Date.UTC(y,m,1));const monthEnd=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);
  if(monthEnd>INCEPTION&&monthEnd<end)out.push(monthEnd);
  m++;if(m===13){m=1;y++;}
 }
 out.push(end);return unique(out);
}
function lastAt(rows,date){const found=rows.filter(r=>r.date<=date);return latest(found);}
function lastCash(acct,date){const f=lastAt(state.flows.filter(x=>x.type==="cash_balance"&&x.broker===acct),date);return f?{value:num(f.amount),date:f.date}:null;}
function finecoAt(date){
 const rs=state.movements.filter(r=>r.account==="Fineco"&&r.date<=date);
 if(!rs.length)return null;return rs.reduce((t,x)=>t+num(x.amount),0);
}
function historicalPortfolio(date,assetId=null){
 if(assetId){const a=state.assets.find(x=>x.id===assetId);if(!a||rollingBasis(assetId,date).quantity<=0)return null;const e=lastAt(state.entries.filter(x=>x.generic_option===a.block_id),date);return e&&days(e.date,date)<=45?getValue(e):null;}
 const cs=lastCash("Scalable Capital",date),ct=lastCash("Trade Republic",date),f=finecoAt(date);
 const relevant=state.assets.filter(a=>rollingBasis(a.id,date).quantity>0.000001);
 // I valori dei titoli non osservati in quel periodo NON sono inventati come zero.
 if(relevant.length<2)return null;
 const dated=relevant.map(a=>{const e=lastAt(state.entries.filter(x=>x.generic_option===a.block_id),date);return e?{value:getValue(e),date:e.date}:null;});
 if(dated.some(e=>!e||days(e.date,date)>45))return null;
 const investments=dated.reduce((s,e)=>s+e.value,0);
 const brokerCash=(cs?cs.value:0)+(ct?ct.value:0);
 return {investments,brokerCash,fineco:f,hasBrokerCash:!!(cs&&ct),complete:!!(cs&&ct&&f!=null)};
}
function assetXirrAt(assetId,date,terminal){
 const flows=state.trades.filter(t=>t.asset_id===assetId&&t.date<=date).map(t=>({
  date:t.date,value:t.side==="buy"?-(num(t.amount)+num(t.fee)):t.side==="sell"?num(t.amount)-num(t.fee):0
 })).filter(x=>x.value!==0);
 if(terminal>0)flows.push({date,value:terminal});
 return xirr(flows);
}
function brokerCapitalAt(date){
 return -contributionFlows().filter(f=>f.date<=date).reduce((t,f)=>t+f.value,0);
}
function taxForOpenAssetsAt(date){
 let tax=0;
 for(const a of state.assets){
  const b=rollingBasis(a.id,date);
  if(b.quantity<=0||b.cost<=0)continue;
  const v=historicalPortfolio(date,a.id);
  if(v==null)return null;
  tax+=taxRate*Math.max(0,v-b.cost);
 }
 return tax;
}
function chartSeries(){
 const selected=$("seriesSelect").value,mode=$("chartMode").value,dates=chartDates();
 const names={broker:"Conti broker · titoli e liquidità",global:"Patrimonio complessivo · Fineco incluso",invested:"Valore dei titoli",netgain:"Risultato netto parziale dei broker",capital:"Capitale netto conferito ai broker",house:"Casa · beneficio economico"};
 const label=names[selected]||state.positions.find(a=>"asset:"+a.id===selected)?.name||"Strumento";
 const primary=dates.map(date=>{
  let value=null;
  if(selected==="house"){
   const h=housingAt(date);
   value=mode==="value"?h.benefit:100*h.benefit/h.purchase;
  }else if(selected==="capital"){
   value=mode==="value"?brokerCapitalAt(date):null;
  }else if(selected.startsWith("asset:")){
   const id=selected.slice(6),v=historicalPortfolio(date,id);
   if(v!=null){
    const rate=assetXirrAt(id,date,v);
    value=mode==="value"?v:rate==null?null:100*rate;
   }
  }else{
   const d=historicalPortfolio(date);
   if(d){
    if(mode==="value"){
     if(selected==="invested")value=d.investments;
     else if(selected==="broker")value=d.hasBrokerCash?d.investments+d.brokerCash:null;
     else if(selected==="global")value=d.complete?d.investments+d.brokerCash+d.fineco:null;
     else if(selected==="netgain"&&d.hasBrokerCash){
      const tax=taxForOpenAssetsAt(date);
      value=tax==null?null:d.investments+d.brokerCash-brokerCapitalAt(date)-tax;
     }
    }else if((selected==="broker"||selected==="netgain")&&d.hasBrokerCash){
     const flow=contributionFlows().filter(f=>f.date<=date);
     const tax=selected==="netgain"?taxForOpenAssetsAt(date):0;
     if(tax!=null){const rate=xirr([...flow,{date,value:d.investments+d.brokerCash-tax}]);value=rate==null?null:100*rate;}
    }
   }
  }
  return {date,value};
 });
 const series=[{name:label,color:"#69c8ca",points:primary,dash:false}];
 if(mode==="value"&&selected==="broker"){
  series.push({name:"Capitale netto conferito (non valore di mercato)",color:"#81a4ed",points:dates.map(date=>({date,value:brokerCapitalAt(date)})),dash:true});
 }
 if(mode==="value"&&selected==="netgain"){
  series.push({name:"Casa · rivalutazione + affitto evitato (confronto non omogeneo)",color:"#e3bd7c",points:dates.map(date=>({date,value:housingAt(date).benefit})),dash:true});
 }
 if(mode==="value"&&selected==="house"){
  series.push({name:"Solo affitto evitato",color:"#81a4ed",points:dates.map(date=>({date,value:getRentUntil(date)})),dash:true});
 }
 return series;
}
function drawSvg(series){
 const w=920,h=320,L=80,R=22,T=24,B=48,dateStart=dayMs(INCEPTION),dateEnd=dayMs(state.asof),values=series.flatMap(s=>s.points.map(p=>p.value)).filter(x=>x!=null&&Number.isFinite(x)),el=$("performanceChart");
 if(!values.length){el.innerHTML='<text x="460" y="160" text-anchor="middle" fill="#91a2b7" font-size="15">Non ci sono osservazioni storiche per questa selezione</text>';return;}
 let lo=Math.min(0,...values),hi=Math.max(0,...values);if(hi===lo)hi=lo+1;const margin=(hi-lo)*.09;hi+=margin;lo-=margin;
 const X=date=>L+(w-L-R)*(dayMs(date)-dateStart)/Math.max(1,dateEnd-dateStart);
 const Y=v=>T+(h-T-B)*(hi-v)/(hi-lo);
 const grid=Array.from({length:5},(_,i)=>{const value=lo+(hi-lo)*i/4,y=Y(value),txt=$("chartMode").value==="return"?value.toFixed(1)+"%":(Math.abs(value)>=1000?(value/1000).toFixed(0)+"k":value.toFixed(0));return'<line x1="'+L+'" y1="'+y+'" x2="'+(w-R)+'" y2="'+y+'" stroke="#294057" stroke-width="1"/><text x="'+(L-12)+'" y="'+(y+4)+'" text-anchor="end" fill="#8298ab" font-size="11">'+txt+'</text>';}).join("");
 const xticks=Array.from({length:5},(_,i)=>{const t=dateStart+(dateEnd-dateStart)*i/4,iso=new Date(t).toISOString().slice(0,10);return'<text x="'+X(iso)+'" y="'+(h-16)+'" text-anchor="middle" fill="#8298ab" font-size="11">'+iso.slice(0,7)+'</text>';}).join("");
 let lines="";
 for(const s of series){let chunk=[],segments=[];for(const p of s.points){if(p.value==null||!Number.isFinite(p.value)){if(chunk.length>1)segments.push(chunk.join(" "));chunk=[];continue;}chunk.push((chunk.length?"L":"M")+X(p.date).toFixed(1)+","+Y(p.value).toFixed(1));}if(chunk.length>1)segments.push(chunk.join(" "));
  for(const seg of segments)lines+='<path d="'+seg+'" fill="none" stroke="'+s.color+'" stroke-width="'+(s.dash?2:3)+'" stroke-linecap="round" stroke-linejoin="round" '+(s.dash?'stroke-dasharray="7 7" ':'')+'/>';
  const last=s.points.filter(p=>p.value!=null).at(-1);if(last)lines+='<circle cx="'+X(last.date)+'" cy="'+Y(last.value)+'" r="4" fill="'+s.color+'" stroke="#142335" stroke-width="2"/>';
 }
 const baseline=lo<=0&&hi>=0?'<line x1="'+L+'" y1="'+Y(0)+'" x2="'+(w-R)+'" y2="'+Y(0)+'" stroke="#89a4bd" stroke-width="1" stroke-dasharray="2 5"/>':"";
 el.innerHTML=grid+baseline+lines+xticks;
 el.onpointermove=ev=>{const rect=el.getBoundingClientRect(),fx=(ev.clientX-rect.left)/rect.width,at=dateStart+(fx*w-L)/(w-L-R)*(dateEnd-dateStart);let best=null,bestDistance=Infinity;for(const s of series){for(const p of s.points){if(p.value==null)continue;const dd=Math.abs(dayMs(p.date)-at);if(dd<bestDistance){best={...p,series:s.name};bestDistance=dd;}}}if(best){$("chartTooltip").hidden=false;$("chartTooltip").textContent=best.series+" · "+fmtDate(best.date)+" · "+($("chartMode").value==="return"?num(best.value).toFixed(2)+"%":money(best.value));}};
 el.onpointerleave=()=>{$("chartTooltip").hidden=true;};
}
function renderChart(){
 const series=chartSeries(),selected=$("seriesSelect").value,mode=$("chartMode").value;
 $("chartLegend").innerHTML=series.map(v=>'<span><i class="swatch" style="background:'+v.color+'"></i>'+safe(v.name)+'</span>').join("");
 drawSvg(series);
 const valid=series[0]?.points.filter(x=>x.value!=null)||[];
 const from=valid.length?fmtDate(valid[0].date):"—";
 const evidence=selected==="house"?"Serie dei prezzi richiesti mensili Idealista; ultimo mese disponibile ottobre 2026. Confronto basato sulla media cittadina, non su compravendite dello stesso immobile.":
 selected==="capital"?"Serie storica dei flussi di entrata e uscita dai broker, distinta dal valore di mercato. Per Trade Republic le spese con carta sono uscite dal conto.":
 "Sono rappresentate soltanto valorizzazioni documentate presenti in Supabase; prezzi storici mancanti non sono interpolati. Le posizioni sono mostrate solo nei periodi di detenzione verificati.";
 $("chartCoverage").textContent=valid.length+" osservazioni nella serie principale; prima: "+from+". "+evidence;
 $("chartCompareWarning").textContent=selected==="netgain"?
   "ATTENZIONE: il beneficio della casa presuppone 250.000 € disponibili immediatamente nel 2023, mentre nei broker il capitale è stato conferito progressivamente. Le due curve non misurano opportunità equivalenti.":
   selected==="global"&&mode==="return"?
   "Il rendimento percentuale del patrimonio complessivo non è calcolabile: manca lo storico di liquidità UniCredit e la riconciliazione dei flussi esterni a tutto il patrimonio.":
   selected==="invested"&&mode==="return"?
   "Il rendimento percentuale dei soli titoli non è ricavabile dai versamenti ai broker perché la liquidità è esclusa. Seleziona «Conti broker» o uno strumento.":
   selected==="house"?
   "Percentuale = beneficio cumulato diviso 250.000 €; non è un tasso annualizzato né un rendimento monetario incassato. Costi non inseriti esclusi.":
   selected==="broker"?
   "I versamenti netti sono flussi di capitale, non una seconda valorizzazione del patrimonio. La percentuale dei broker è XIRR annualizzata.":
   selected.startsWith("asset:")&&mode==="return"?
   "Percentuale = XIRR annualizzata delle compravendite registrate e del valore osservato; il rendimento dei periodi senza quotazione affidabile resta non disponibile.":
   "";
}
function filteredMovements(){
 const account=$("accountFilter").value,kind=$("kindFilter").value,all=$("showPersonal").checked,term=$("movementSearch").value.trim().toLocaleLowerCase("it-IT");
 return state.movements.filter(x=>(account==="all"||x.account===account)&&(kind==="all"||x.category===kind)&&(all||x.is_financial)&&(!term||(x.description+" "+x.instrument+" "+x.category+" "+x.account+" "+x.amount).toLocaleLowerCase("it-IT").includes(term))).sort((a,b)=>byDate(b,a)||String(b.id).localeCompare(String(a.id)));
}
function renderMovements(){
 const rows=filteredMovements(),shown=rows.slice(0,state.limit);
 $("movementStats").textContent=rows.length.toLocaleString("it-IT")+" movimenti visualizzabili · "+state.movements.length.toLocaleString("it-IT")+" archiviati · più recenti prima";
 $("movements").innerHTML=shown.map(r=>{
 const value=num(r.amount),cls=value>0?"plus":value<0?"minus":"zero";
 const category=safe(r.category||"Movimento");let bank=safe(r.account);
 const internal=(r.account==="Fineco" && /Trasferimento interno/.test(r.description))||(r.account==="Scalable Capital"&&r.category==="Migrazione interna")||(r.account==="Scalable Capital"&&r.category==="Trasferimento titoli");
 const desc=safe(r.description||r.instrument||r.category),note=internal?" · Giroconto / movimento interno":"";
 return'<article class="movement"><div class="date">'+fmtDate(r.date)+'<span class="bank">'+bank+'</span></div><div class="description"><strong>'+desc+'</strong><small>'+category+note+'</small></div><div class="amount '+cls+'">'+(value>0?"+":"")+money(value)+'</div></article>';
 }).join("")||'<p class="muted">Nessun movimento con i filtri selezionati.</p>';
 $("loadMore").hidden=shown.length>=rows.length;
}
function renderMethodology(){
 const ntr=state.movements.filter(x=>x.account==="Trade Republic").length,nsc=state.movements.filter(x=>x.account==="Scalable Capital").length,nfin=state.movements.filter(x=>x.account==="Fineco").length;
 $("methodology").innerHTML=
 '<p><strong>Fonti movimenti:</strong> Trade Republic '+ntr.toLocaleString("it-IT")+' registrazioni, Scalable '+nsc+', Fineco '+nfin+'. I movimenti di trading duplicati fra estratti conto e Invest Tracker sono mostrati una volta sola: il registro qui usa la fonte documentale privata dedicata.</p>'+
 '<p><strong>Patrimonio attuale:</strong> quotazioni/valori delle posizioni e saldi broker dagli snapshot di Invest Tracker; Fineco dall’estratto Excel. Le criptovalute spot Trade Republic, pur presenti nei flussi storici, hanno <em>valore convenzionale zero</em>, per scelta dell’utente: non è un prezzo di mercato osservato.</p>'+
 '<p><strong>Rendimento:</strong> XIRR dei flussi esterni dei broker e del controvalore finale. I bonifici Fineco → Trade Republic non sono contati due volte: rappresentano capitale verso i broker e contemporaneamente trasferimenti interni al patrimonio complessivo. Fineco non entra nel rendimento degli investimenti, poiché non vi sono titoli e manca lo storico UniCredit.</p>'+
 '<p><strong>Fiscalità:</strong> '+money(state.tax)+' di imposte teoriche aggiuntive sulle plusvalenze positive ancora aperte; il 26% è una <em>semplificazione</em>. Perdite ETF non automaticamente compensabili, fiscalità degli strumenti, plusvalenze storiche e regime fiscale da verificare. La media mensile è un dato retrospettivo, non reddito ricorrente.</p>'+
 '<p class="note-warning"><strong>Riconciliazioni aperte:</strong> differenza di 71,20 € tra saldo Trade Republic del 20/11 e snapshot del 21/11; differenza di 33,63 € fra somma dei 142 movimenti Scalable trascritti e saldo screenshot. Le date 2023–2025 del grafico possono risultare vuote quando mancano valutazioni.</p>';
}
["accountFilter","kindFilter"].forEach(id=>$(id).addEventListener("change",()=>{state.limit=100;renderMovements();}));
$("movementSearch").addEventListener("input",()=>{state.limit=100;renderMovements();});
$("showPersonal").addEventListener("change",()=>{state.limit=100;renderMovements();});
$("seriesSelect").addEventListener("change",renderChart);
$("chartMode").addEventListener("change",renderChart);
$("loadMore").addEventListener("click",()=>{state.limit+=100;renderMovements();});
$("reload").addEventListener("click",load);
$("houseGrowth").addEventListener("input",e=>{state.assumedHouseGrowth=Number(e.target.value)||0;renderHousing();renderChart();});
$("houseMode").addEventListener("change",e=>{state.houseMode=e.target.value;renderHousing();renderChart();});
$("houseGrowth").addEventListener("input",e=>{state.assumedHouseGrowth=Number(e.target.value)||0;renderHousing();renderChart();});
$("purchaseCosts").addEventListener("input",e=>{state.purchaseCosts=e.target.value.trim()===""?null:Math.max(0,num(e.target.value));renderHousing();renderChart();});
$("ownerCosts").addEventListener("input",e=>{state.ownerCosts=e.target.value.trim()===""?null:Math.max(0,num(e.target.value));renderHousing();renderChart();});
load();
})();
