import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const H={"content-type":"application/json","access-control-allow-origin":"*","access-control-allow-headers":"authorization, x-client-info, apikey, content-type"};
const A:any={1:{asset:'FTSE 250',k:'rate',p:'GB',i:'GB'},41:{asset:'DAX / Germania',k:'rate',p:'XM',i:'DE'},42:{asset:'CAC 40 France',k:'rate',p:'XM',i:'FR'},43:{asset:'SMI Switzerland',k:'rate',p:'CH',i:'CH'},44:{asset:'IBEX 35 Spain',k:'rate',p:'XM',i:'ES'},45:{asset:'MSCI Japan',k:'rate',p:'JP',i:'JP'},46:{asset:'MSCI Australia',k:'au'},47:{asset:'MSCI Singapore',k:'sg'},48:{asset:'MSCI Canada',k:'rate',p:'CA',i:'CA'},49:{asset:'FTSE TW',k:'tw'},50:{asset:'MSCI Indonesia',k:'rate',p:'ID',i:'ID'},51:{asset:'FTSE Brazil',k:'rate',p:'BR',i:'BR'},52:{asset:'FTSE Saudi Arabia',k:'rate',p:'SA',i:'SA'},53:{asset:'Europe Small Cap',k:'rate',p:'XM',i:'XM'},54:{asset:'FTSE Korea',k:'rate',p:'KR',i:'KR'}};
const BIS='https://stats.bis.org/api/v2/data/dataflow/BIS';
const cl=(x:number,a=0,b=100)=>Math.max(a,Math.min(b,x));
const rd=(x:number|null,d=3)=>x===null?null:Math.round(x*10**d)/10**d;
const nm=(x:any)=>{const n=Number(String(x??'').replace(/,/g,''));return Number.isFinite(n)?n:null};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function csv(t:string){const ls=t.trim().split(/\r?\n/).filter(Boolean);if(ls.length<2)return[];const sp=(l:string)=>{const a:string[]=[];let c='',q=false;for(let j=0;j<l.length;j++){const x=l[j];if(x==='"'){if(q&&l[j+1]==='"'){c+='"';j++;}else q=!q}else if(x===','&&!q){a.push(c);c=''}else c+=x}a.push(c);return a};const h=sp(ls[0]);return ls.slice(1).map(l=>{const v=sp(l),o:any={};h.forEach((k,j)=>o[k]=v[j]??'');return o})}
async function tx(url:string,accept='*/*'){let e:any;for(let n=0;n<3;n++){try{const r=await fetch(url,{headers:{Accept:accept,'User-Agent':'Mozilla/5.0 LifeTrackerBTD/4.1'}}),t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} ${t.slice(0,100)}`);return t}catch(err){e=err;await wait(300*(n+1))}}throw e}
async function bis(flow:string,key:string){const z=csv(await tx(`${BIS}/${flow}/1.0/${key}?startPeriod=2025-01&format=csvfile`,'text/csv')).map((x:any)=>({p:String(x.TIME_PERIOD||''),v:nm(x.OBS_VALUE)})).filter((x:any)=>x.p&&x.v!==null).sort((a:any,b:any)=>a.p.localeCompare(b.p));if(!z.length)throw new Error(`${flow} ${key}: no observations`);return z as {p:string,v:number}[]}
function mo(p:string){const m=p.match(/^(\d{4})-(\d{2})$/);return m?Number(m[1])*12+Number(m[2])-1:null}
function back(z:{p:string,v:number}[],p:string,n:number){const m=mo(p);if(m===null)return z[Math.max(0,z.length-1-n)];return z.reduce((best,x)=>{const xm=mo(x.p);if(xm===null)return best;const d=Math.abs(xm-(m-n)),bd=Math.abs((mo(best.p)??-9999)-(m-n));return d<bd?x:best},z[0])}
function comp(rate:number,r3:number,r6:number,inf:number,i3:number){const d3=rate-r3,d6=rate-r6,di=inf-i3,real=rate-inf,p=cl(50-d6*15-d3*20,20,80),i=cl(50-di*15,25,75),rr=cl(50-real*5,25,75);return{d3,d6,di,real,p,i,rr,s:cl(p*.5+i*.3+rr*.2)}}
function row(id:number,b:any,c:any){return{asset_id:id,asset:A[id].asset,monetary_score:rd(c.s,1),policy_rate:rd(b.rate,4),policy_rate_3m_ago:rd(b.r3,4),policy_rate_6m_ago:rd(b.r6,4),inflation_yoy:rd(b.inf,4),inflation_yoy_3m_ago:rd(b.i3,4),real_policy_rate:rd(c.real,4),policy_rate_change_3m:rd(c.d3,4),policy_rate_change_6m:rd(c.d6,4),inflation_change_3m:rd(c.di,4),policy_component_score:rd(c.p,1),inflation_component_score:rd(c.i,1),real_rate_component_score:rd(c.rr,1),provider:b.provider,policy_source:b.ps,inflation_source:b.is,latest_policy_period:b.pp,latest_inflation_period:b.ip,methodology_note:'50% policy direction + 30% inflation trend + 20% real policy rate; higher = more supportive monetary backdrop for BTD',source_status:'ok'}}
async function rate(id:number,p:string,i:string){const[pz,iz]=await Promise.all([bis('WS_CBPOL',`M.${p}`),bis('WS_LONG_CPI',`M.${i}.771`)]),pr=pz.at(-1)!,p3=back(pz,pr.p,3),p6=back(pz,pr.p,6),ir=iz.at(-1)!,i3=back(iz,ir.p,3),c=comp(pr.v,p3.v,p6.v,ir.v,i3.v);return row(id,{rate:pr.v,r3:p3.v,r6:p6.v,inf:ir.v,i3:i3.v,provider:'BIS',ps:`BIS WS_CBPOL ${p}`,is:`BIS WS_LONG_CPI ${i} unit 771`,pp:pr.p,ip:ir.p},c)}
async function au(id:number){const pz=await bis('WS_CBPOL','M.AU'),pr=pz.at(-1)!,p3=back(pz,pr.p,3),p6=back(pz,pr.p,6),u='https://sdmx.oecd.org/public/rest/v1/data/OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0/AUS.M.N.CPI.PA._T.N.GY?lastNObservations=12&dimensionAtObservation=AllDimensions',t=await tx(u,'application/vnd.sdmx.genericdata+xml; version=2.1'),iz=[...t.matchAll(/<generic:Obs>([\s\S]*?)<\/generic:Obs>/g)].map(m=>m[1]).map(b=>({p:b.match(/id="TIME_PERIOD" value="([^"]+)"/)?.[1]||'',v:nm(b.match(/<generic:ObsValue value="([^"]+)"/)?.[1])})).filter((x:any)=>x.p&&x.v!==null).sort((a:any,b:any)=>a.p.localeCompare(b.p)) as {p:string,v:number}[];if(iz.length<4)throw new Error('OECD Australia CPI');const ir=iz.at(-1)!,i3=back(iz,ir.p,3),c=comp(pr.v,p3.v,p6.v,ir.v,i3.v);return row(id,{rate:pr.v,r3:p3.v,r6:p6.v,inf:ir.v,i3:i3.v,provider:'BIS + OECD',ps:'BIS WS_CBPOL AU',is:'OECD Australia CPI YoY',pp:pr.p,ip:ir.p},c)}
function sgp(s:string){const m=s.match(/^(\d{4}) ([A-Z][a-z]{2})$/),mm:any={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};return m&&mm[m[2]]?`${m[1]}-${String(mm[m[2]]).padStart(2,'0')}`:null}
async function sg(id:number){const[ez,jt]=await Promise.all([bis('WS_EER','M.N.B.SG'),tx('https://tablebuilder.singstat.gov.sg/api/table/tabledata/M213751','application/json')]),j=JSON.parse(jt),r=(j?.Data?.row||[]).find((x:any)=>String(x.rowText||'').trim()==='All Items');if(!r)throw new Error('SingStat All Items');const ix=(r.columns||[]).map((x:any)=>({p:sgp(String(x.key||'')),v:nm(x.value)})).filter((x:any)=>x.p&&x.v!==null).sort((a:any,b:any)=>a.p.localeCompare(b.p));if(ix.length<16)throw new Error('SingStat history');const yoy=(x:any)=>{const m=mo(x.p)!-12,p=ix.find((q:any)=>mo(q.p)===m);if(!p)throw new Error('SingStat YoY base');return(x.v/p.v-1)*100},lr=ix.at(-1)!,i3r=back(ix as any,lr.p,3),inf=yoy(lr),i3=yoy(i3r),er=ez.at(-1)!,e3=back(ez,er.p,3),chg=(er.v/e3.v-1)*100,pc=cl(50-chg*8,25,75),ic=cl(50-(inf-i3)*15,25,75),s=pc*.65+ic*.35;return{asset_id:id,asset:A[id].asset,monetary_score:rd(s,1),policy_rate:null,policy_rate_3m_ago:null,policy_rate_6m_ago:null,inflation_yoy:rd(inf,4),inflation_yoy_3m_ago:rd(i3,4),real_policy_rate:null,policy_rate_change_3m:null,policy_rate_change_6m:null,inflation_change_3m:rd(inf-i3,4),policy_component_score:rd(pc,1),inflation_component_score:rd(ic,1),real_rate_component_score:null,provider:'BIS + SingStat',policy_source:'BIS WS_EER nominal broad Singapore (exchange-rate monetary conditions proxy)',inflation_source:'SingStat M213751 All Items CPI index; YoY calculated',latest_policy_period:er.p,latest_inflation_period:lr.p,methodology_note:'Singapore: 65% BIS nominal EER 3m change + 35% CPI trend. EER appreciation = tighter; proxy, not a policy interest rate.',source_status:'ok'}}
const ent=(s:string)=>s.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function twp(s:string){const m=s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);return m?`${m[1]}-${String(Number(m[2])).padStart(2,'0')}`:null}
async function tw(id:number){
  // DGBAS direct TLS is currently rejected by the Edge runtime (unknown certificate issuer).
  // Fetch the *official* CPI releases through an HTTPS text relay. Never bypass TLS validation.
  // Resolve the latest release and the release exactly three months earlier; no made-up/neutral score.
  const [ct,listing]=await Promise.all([
    tx('https://www.cbc.gov.tw/en/lp-695-2.html','text/html'),
    tx('https://r.jina.ai/https://eng.dgbas.gov.tw/News.aspx?n=4438','text/plain')
  ]);
  const plain=ct.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const rm=plain.match(/(20\d{2}\/\d{1,2}\/\d{1,2})\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/);
  if(!rm)throw new Error('Taiwan CBC policy rate unavailable');
  const rate=Number(rm[2]);
  const months:{[key:string]:number}={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
  const found=[...listing.matchAll(/\[The Price Indices for ([A-Z][a-z]+) (\d{4})\]\(https:\/\/eng\.dgbas\.gov\.tw\/News_Content\.aspx\?n=4438&s=(\d+)/g)]
    .map(m=>({name:m[1],year:Number(m[2]),month:months[m[1].slice(0,3)],release:m[3]}))
    .filter(x=>Number.isInteger(x.month));
  const unique=new Map<number,(typeof found)[number]>();
  for(const x of found)unique.set(x.year*12+x.month,x);
  const releases=[...unique.values()].sort((a,b)=>(b.year*12+b.month)-(a.year*12+a.month));
  if(releases.length<4)throw new Error('Taiwan DGBAS CPI releases missing');
  const newest=releases[0],prev=releases.find(x=>x.year*12+x.month===newest.year*12+newest.month-3);
  if(!prev)throw new Error('Taiwan DGBAS CPI 3-month history missing');
  const getCPI=async(x:(typeof found)[number])=>{
    const url='https://r.jina.ai/https://eng.dgbas.gov.tw/News_Content.aspx?n=4438%26s='+x.release;
    const page=await tx(url,'text/plain');
    const anchor='The CPI in '+x.name+' '+x.year;
    const pos=page.indexOf(anchor);
    if(pos<0)throw new Error('Taiwan DGBAS CPI missing headline '+anchor);
    const match=page.slice(pos,pos+550).match(/\b(increased|rose|decreased|fell|declined)\s+([0-9]+(?:\.[0-9]+)?)%\s+compared with the same month of\s+\d{4}/i);
    if(!match)throw new Error('Taiwan DGBAS annual CPI growth missing for '+anchor);
    const sign=/^(decreased|fell|declined)$/i.test(match[1])?-1:1;
    return sign*Number(match[2]);
  };
  const [inf,i3]=await Promise.all([getCPI(newest),getCPI(prev)]);
  const period=(x:(typeof found)[number])=>x.year+'-'+String(x.month).padStart(2,'0');
  const c=comp(rate,rate,rate,inf,i3);
  const result=row(id,{rate,r3:rate,r6:rate,inf,i3,
    provider:'Taiwan CBC + DGBAS (HTTPS text relay)',
    ps:'CBC discount rate, most recent published decision',
    is:'DGBAS official monthly CPI releases accessed through r.jina.ai HTTPS text relay',
    pp:rm[1],ip:period(newest)},c);
  result.methodology_note+='; TW policy rate direction assumed unchanged until next CBC published rate decision; CPI from official DGBAS YoY releases';
  return result;
}

async function run(id:number){const a=A[id];return a.k==='rate'?rate(id,a.p,a.i):a.k==='au'?au(id):a.k==='sg'?sg(id):tw(id)}
async function save(rows:any[]){const u=Deno.env.get('SUPABASE_URL'),k=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!u||!k)throw new Error('service env');const p=rows.map(r=>({...r,fetched_at:new Date().toISOString()})),res=await fetch(`${u}/rest/v1/btd_monetary_scores?on_conflict=asset_id`,{method:'POST',headers:{apikey:k,Authorization:`Bearer ${k}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(p)});if(!res.ok)throw new Error(`cache ${res.status}: ${await res.text()}`)}
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:H});const ids=Object.keys(A).map(Number).sort((a,b)=>a-b),results:any[]=[],failures:any[]=[];for(const id of ids){try{results.push(await run(id))}catch(e){failures.push({asset_id:id,asset:A[id].asset,error:e instanceof Error?e.message:String(e)})}await wait(100)}let cache_saved=false,cache_error=null;try{if(results.length){await save(results);cache_saved=true}}catch(e){cache_error=e instanceof Error?e.message:String(e)}return new Response(JSON.stringify({ok:failures.length===0&&cache_saved,generated_at_utc:new Date().toISOString(),assets_count:ids.length,success_count:results.length,failed_count:failures.length,cache_saved,cache_error,methodology:'Rate economies: 50% policy direction + 30% inflation trend + 20% real policy rate. Singapore: 65% BIS NEER monetary-conditions proxy + 35% CPI trend.',results,failures}),{status:failures.length?207:(cache_saved?200:500),headers:H})});