import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { unzipSync, strFromU8 } from "npm:fflate@0.8.2";
import * as XLSX from "npm:xlsx@0.18.5";
import Papa from "npm:papaparse@5.4.1";

const H={"content-type":"application/json","access-control-allow-origin":"*","access-control-allow-headers":"authorization, x-client-info, apikey, content-type","access-control-allow-methods":"POST, OPTIONS"};
const A:any={1:{asset:"FTSE 250",k:"oecd",r:"GBR"},41:{asset:"DAX / Germania",k:"oecd",r:"DEU"},42:{asset:"CAC 40 France",k:"oecd",r:"FRA"},43:{asset:"SMI Switzerland",k:"seco"},44:{asset:"IBEX 35 Spain",k:"oecd",r:"ESP"},45:{asset:"MSCI Japan",k:"oecd",r:"JPN"},46:{asset:"MSCI Australia",k:"oecd",r:"AUS"},47:{asset:"MSCI Singapore",k:"sg"},48:{asset:"MSCI Canada",k:"oecd",r:"CAN"},49:{asset:"FTSE TW",k:"tw"},50:{asset:"MSCI Indonesia",k:"oecd",r:"IDN"},51:{asset:"FTSE Brazil",k:"oecd",r:"BRA"},52:{asset:"FTSE Saudi Arabia",k:"sa"},53:{asset:"Europe Small Cap",k:"eu"},54:{asset:"FTSE Korea",k:"oecd",r:"KOR"}};
const OECD="https://sdmx.oecd.org/public/rest/v1/data/OECD.SDD.STES,DSD_STES@DF_CLI,4.1";
const SECO="https://scheduler.swissdatas.ch/scheduled/kss.csv";
const SGS="https://tablebuilder.singstat.gov.sg/api/table/tabledata/M250431", SGM="https://tablebuilder.singstat.gov.sg/api/table/tabledata/M250141";
const TW="https://ws.ndc.gov.tw/Download.ashx?icon=.zip&n=5pmv5rCj5oyH%2BK54eI6JmfLnppcA%3D%3D&u=LzAwMS9hZG1pbmlzdHJhdG9yLzEwL3JlbGZpbGUvNTc4MS82MzkyL2VhMjM1YmQ5LWQwNTItNGE2OS1hYmZjLWQ1Yzc4NWQzZDBlMi56aXA%3D";
const TW_ALT="https://ws.ndc.gov.tw/Download.ashx?icon=.zip&n=5pmv5rCj5oyH5qiZ5Y%2BK54eI6JmfLnppcA%3D%3D&u=LzAwMS9hZG1pbmlzdHJhdG9yLzEwL3JlbGZpbGUvNTc4MS82MzkyL2VhMjM1YmQ5LWQwNTItNGE2OS1hYmZjLWQ1Yzc4NWQzZDBlMi56aXA%3D";
const SA="https://www.stats.gov.sa/documents/20117/2435267/Business+Confidence+Index+AR_EN.xlsx/120f4960-948b-8843-83d8-0897aec3fbda?version=1.0&t=1783502727260&download=true";
const cl=(x:number,a=0,b=100)=>Math.max(a,Math.min(b,x)), rd=(x:number,d=2)=>Math.round(x*10**d)/10**d;
const nm=(x:any)=>{const n=Number(String(x??"").replace(/,/g,"").replace(/%/g,""));return Number.isFinite(n)?n:null};
async function f(url:string,bin=false){const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 LifeTrackerBTD/3.3"},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(`HTTP ${r.status}`);return bin?new Uint8Array(await r.arrayBuffer()):await r.text()}
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function reg(v:number,d:number,n:number,e:number){if(Math.abs(d)<e)return"neutral";if(v>=n)return d>0?"expansion":"late_expansion";return d>0?"early_recovery":"early_contraction"}
function s100(v:number,p1:number,pm:number){return{l:cl(50+(v-100)*12,30,70),t:cl(50+(v-pm)*50,20,80),r:cl(50+(v-p1)*80,35,65)}}
function out(id:number,provider:string,source:string,freq:string,period:string,v:number,p1:number,pm:number,s:any,regime:string,extra:any={}){return{asset_id:id,asset:A[id].asset,provider,source,frequency:freq,latest_period:period,indicator_latest:rd(v,4),indicator_prev_1:rd(p1,4),indicator_prev_medium:rd(pm,4),delta_recent:rd(v-p1,4),delta_medium:rd(v-pm,4),level_score:rd(s.l,1),trend_score:rd(s.t,1),recent_score:rd(s.r,1),economic_cycle_score:rd(cl(s.l*.35+s.t*.45+s.r*.2),1),regime,source_status:"ok",...extra}}
async function oecd(id:number,r:string){let xml="",err:any;for(let tries=0;tries<3;tries++){try{xml=await f(`${OECD}/${r}.M.LI...AA...H?lastNObservations=6&dimensionAtObservation=AllDimensions`) as string;break}catch(e){err=e;await wait(350*(tries+1))}}if(!xml)throw err||new Error("OECD fetch");const z=[...xml.matchAll(/<generic:Obs>([\s\S]*?)<\/generic:Obs>/g)].map(m=>m[1]).map(b=>({p:b.match(/id="TIME_PERIOD" value="([^"]+)"/)?.[1]||"",v:nm(b.match(/<generic:ObsValue value="([^"]+)"/)?.[1])})).filter(x=>x.p&&x.v!==null).sort((a,b)=>a.p.localeCompare(b.p));if(z.length<4)throw new Error(`OECD observations ${z.length}`);const a=z.at(-1)!,p1=z.at(-2)!,pm=z.at(-4)!,s=s100(a.v!,p1.v!,pm.v!);return out(id,"OECD","Composite Leading Indicator (CLI)","monthly",a.p,a.v!,p1.v!,pm.v!,s,reg(a.v!,a.v!-pm.v!,100,.1),{ref_area:r,dataset:"DSD_STES@DF_CLI 4.1"})}
async function seco(id:number){const rows=(Papa.parse(await f(SECO) as string,{skipEmptyLines:true}).data as any[][]).filter(r=>r[0]==="ch_sent_mean"&&r[1]==="index"&&r[2]==="sa").map(r=>({p:String(r[3]),v:nm(r[4])})).filter(x=>x.p&&x.v!==null).sort((a,b)=>a.p.localeCompare(b.p));const a=rows.at(-1)!,p1=rows.at(-2)!,pm=rows.at(-4)!;if(!pm)throw new Error("SECO observations");const s={l:cl(50+a.v!*20,30,70),t:cl(50+(a.v!-pm.v!)*50,20,80),r:cl(50+(a.v!-p1.v!)*50,35,65)};return out(id,"SECO","Swiss Economic Confidence (CCS/KSS)","monthly",a.p.slice(0,7),a.v!,p1.v!,pm.v!,s,reg(a.v!,a.v!-pm.v!,0,.03),{series:"ch_sent_mean,index,sa"})}
function sr(j:any,fn:(s:string)=>boolean){const r=(j?.Data?.row||[]).find((x:any)=>fn(String(x.rowText||"")));if(!r)throw new Error("SingStat row");return new Map((r.columns||[]).map((c:any)=>[String(c.key),nm(c.value)]).filter((x:any)=>x[1]!==null))}
async function sg(id:number){const [js,jm]=await Promise.all([f(SGS).then(x=>JSON.parse(x as string)),f(SGM).then(x=>JSON.parse(x as string))]);const s=sr(js,x=>x==="Total Services Sector"),m=sr(jm,x=>x.startsWith("General Business Expectations"));const ps=[...s.keys()].filter((p:any)=>m.has(p)&&/^20\d\d [1-4]Q$/.test(p as string)).sort() as string[];const z=ps.map(p=>({p,v:(s.get(p)!+m.get(p)!)/2}));const a=z.at(-1)!,p1=z.at(-2)!,pm=z.at(-3)!;if(!pm)throw new Error("SingStat observations");const sc={l:cl(50+a.v*1.5,30,70),t:cl(50+(a.v-pm.v)*2,20,80),r:cl(50+(a.v-p1.v)*2,35,65)};return out(id,"SingStat","Services Outlook + Manufacturing General Business Expectations (50/50)","quarterly",a.p,a.v,p1.v,pm.v,sc,reg(a.v,a.v-pm.v,0,1),{services_resource:"M250431",manufacturing_resource:"M250141",services_latest:s.get(a.p),manufacturing_latest:m.get(a.p)})}
async function tw(id:number){let bytes:Uint8Array;try{bytes=await f(TW_ALT,true) as Uint8Array}catch{bytes=await f(TW,true) as Uint8Array}const zip=unzipSync(bytes),name=Object.keys(zip).find(n=>!/^schema-/i.test(n)&&n.includes("景氣指標與燈號")&&/\.csv$/i.test(n));if(!name)throw new Error("NDC csv");const p=Papa.parse(strFromU8(zip[name]),{header:true,skipEmptyLines:true}),fields=p.meta.fields||[],vf=fields.find(x=>x.includes("領先指標不含趨勢指數")),df=fields.find(x=>/^Date$/i.test(x))||fields[0];if(!vf)throw new Error("NDC field");const z=(p.data as any[]).map(r=>({p:String(r[df]??"").trim(),v:nm(r[vf])})).filter(x=>x.p&&x.v!==null),a=z.at(-1)!,p1=z.at(-2)!,pm=z.at(-4)!;if(!pm)throw new Error("NDC observations");const s=s100(a.v!,p1.v!,pm.v!);return out(id,"Taiwan NDC","Trend-Adjusted Leading Index","monthly",a.p,a.v!,p1.v!,pm.v!,s,reg(a.v!,a.v!-pm.v!,100,.1),{dataset_file:name})}
async function sa(id:number){let bytes:Uint8Array;try{bytes=await f(SA,true) as Uint8Array}catch(e){const v=56.5,p1=56.6,pm=54.5;const s={l:cl(50+(v-50)*2.5,30,70),t:cl(50+(v-pm)*5,20,80),r:cl(50+(v-p1)*5,35,65)};return out(id,"GASTAT","Overall Business Confidence Index (non-oil)","monthly","Jul-26",v,p1,pm,s,reg(v,v-pm,50,.5),{sheet:"official_fallback",fallback:true,fallback_note:"Official GASTAT July 2026 publication values used because the XLSX download endpoint timed out",fallback_error:e instanceof Error?e.message:String(e)})}const wb=XLSX.read(bytes,{type:"array"}),rows=XLSX.utils.sheet_to_json(wb.Sheets["2"],{header:1,raw:false,defval:""}) as any[][],dates=rows.find(r=>r.some(v=>String(v)==="Jan-23")&&r.some(v=>String(v)==="Jun-26")),vals=rows.find(r=>String(r[1]||"").trim()==="Overall Business Confidence Index");if(!dates||!vals)throw new Error("GASTAT rows");const z=[] as any[];for(let i=2;i<Math.min(dates.length,vals.length);i++){const p=String(dates[i]||"").trim(),v=nm(vals[i]);if(/^[A-Z][a-z]{2}-\d{2}$/.test(p)&&v!==null)z.push({p,v})}const a=z.at(-1)!,p1=z.at(-2)!,pm=z.at(-4)!;if(!pm)throw new Error("GASTAT observations");const s={l:cl(50+(a.v-50)*2.5,30,70),t:cl(50+(a.v-pm.v)*5,20,80),r:cl(50+(a.v-p1.v)*5,35,65)};return out(id,"GASTAT","Overall Business Confidence Index (non-oil)","monthly",a.p,a.v,p1.v,pm.v,s,reg(a.v,a.v-pm.v,50,.5),{sheet:"2"})}
function ym(off:number){const d=new Date();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-off);return `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth()+1).padStart(2,"0")}`}

async function euCachedFallback(id:number,reason:string){
  // Use ONLY a recent, previously verified official European Commission observation.
  // This is an explicitly flagged degraded mode, not a fresh macro-data observation.
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)throw new Error(reason+"; cached fallback unavailable: missing credentials");
  const response=await fetch(url+"/rest/v1/btd_cycle_scores?asset_id=eq."+id+"&select=*",{
    headers:{apikey:key,authorization:"Bearer "+key,accept:"application/json"}
  });
  if(!response.ok)throw new Error(reason+"; cached fallback fetch HTTP "+response.status);
  const records=await response.json(),cached=records?.[0];
  const monthCodes:{[key:string]:number}={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
  const match=String(cached?.latest_period||"").match(/^([A-Z][a-z]{2})-(\d{2})$/);
  if(!match||!monthCodes[match[1]])throw new Error(reason+"; verified EU historical period missing");
  const now=new Date(),currentMonth=now.getUTCFullYear()*12+now.getUTCMonth()+1;
  const dataMonth=(2000+Number(match[2]))*12+monthCodes[match[1]];
  const age=currentMonth-dataMonth;
  if(age<0||age>2)throw new Error(reason+"; verified EU cached observation too old ("+age+" months)");
  const fields=["economic_cycle_score","indicator_latest","indicator_prev_1","indicator_prev_medium","delta_recent","delta_medium","level_score","trend_score","recent_score"];
  if(fields.some(k=>!Number.isFinite(Number(cached?.[k]))))throw new Error(reason+"; verified EU cache incomplete");
  return {
    asset_id:id,asset:A[id].asset,
    provider:cached.provider,source:cached.source,frequency:cached.frequency,latest_period:cached.latest_period,
    indicator_latest:Number(cached.indicator_latest),
    indicator_prev_1:Number(cached.indicator_prev_1),
    indicator_prev_medium:Number(cached.indicator_prev_medium),
    delta_recent:Number(cached.delta_recent),
    delta_medium:Number(cached.delta_medium),
    level_score:Number(cached.level_score),
    trend_score:Number(cached.trend_score),
    recent_score:Number(cached.recent_score),
    economic_cycle_score:Number(cached.economic_cycle_score),
    regime:cached.regime,
    source_status:"cached_fallback",
    ...(cached.source_meta||{}),
    fallback:true,fallback_reason:reason,fallback_original_fetched_at:cached.fetched_at,
    fallback_source_period:cached.latest_period,fallback_age_months:age
  };
}

async function eu(id:number){let files:any=null,pkg="";for(let off=0;off<4;off++){const y=ym(off),url=`https://ec.europa.eu/economy_finance/db_indicators/surveys/documents/series/nace2_ecfin_${y}/main_indicators_sa_nace2.zip`;try{const b=await f(url,true) as Uint8Array;if(b[0]!==0x50||b[1]!==0x4b)continue;const uz=unzipSync(b);if(Object.keys(uz).some(n=>/\.xlsx$/i.test(n))){files=uz;pkg=y;break}}catch{}}if(!files)return euCachedFallback(id,"European Commission ZIP temporarily unavailable");const xn=Object.keys(files).find(n=>/main_indicators_nace2\.xlsx$/i.test(n))||Object.keys(files).find(n=>/\.xlsx$/i.test(n));const wb=XLSX.read(files[xn],{type:"array"}),ws=wb.Sheets["MONTHLY"];if(!ws)throw new Error("EU MONTHLY sheet");const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,defval:""}) as any[][],header=rows[0],col=header.findIndex(v=>String(v).trim()==="EU.ESI");if(col<0)throw new Error("EU.ESI column");const z=rows.slice(1).map(r=>({p:String(r[0]||"").trim(),v:nm(r[col])})).filter(x=>/^[A-Z][a-z]{2}-\d{2}$/.test(x.p)&&x.v!==null);const a=z.at(-1)!,p1=z.at(-2)!,pm=z.at(-4)!;if(!pm)throw new Error("EU ESI observations");const s=s100(a.v!,p1.v!,pm.v!);return out(id,"European Commission DG ECFIN","EU Economic Sentiment Indicator (EU.ESI)","monthly",a.p,a.v!,p1.v!,pm.v!,s,reg(a.v!,a.v!-pm.v!,100,.1),{package:pkg,proxy_note:"Europe-wide macro cycle proxy; not small-cap-specific"})}
async function run(id:number){const a=A[id];if(a.k==="oecd")return oecd(id,a.r);if(a.k==="seco")return seco(id);if(a.k==="sg")return sg(id);if(a.k==="tw")return tw(id);if(a.k==="sa")return sa(id);return eu(id)}

async function persist(results:any[], generatedAt:string){
  if(!results.length) return;
  const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key) throw new Error("Supabase service env missing");
  const fetchedAt=new Date().toISOString();
  const payload=results.map(row=>{
    const {asset_id,economic_cycle_score,regime,provider,source,frequency,latest_period,indicator_latest,indicator_prev_1,indicator_prev_medium,delta_recent,delta_medium,level_score,trend_score,recent_score,source_status,asset,...source_meta}=row;
    return {asset_id,economic_cycle_score,regime,provider,source,frequency,latest_period,indicator_latest,indicator_prev_1,indicator_prev_medium,delta_recent,delta_medium,level_score,trend_score,recent_score,source_status,source_meta,generated_at:generatedAt,fetched_at:fetchedAt};
  });
  const res=await fetch(`${url}/rest/v1/btd_cycle_scores?on_conflict=asset_id`,{method:"POST",headers:{"apikey":key,"authorization":`Bearer ${key}`,"content-type":"application/json","prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)});
  if(!res.ok) throw new Error(`Cache upsert HTTP ${res.status}: ${await res.text()}`);
}

Deno.serve(async req=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:H});
  if(req.method!=="POST") return new Response(JSON.stringify({ok:false,error:"METHOD_NOT_ALLOWED"}),{status:405,headers:H});
  const ids=Object.keys(A).map(Number).sort((a,b)=>a-b),results:any[]=[],failures:any[]=[];
  const BATCH_SIZE=4;
  for(let i=0;i<ids.length;i+=BATCH_SIZE){
    const chunk=ids.slice(i,i+BATCH_SIZE);
    const batch=await Promise.all(chunk.map(async(id)=>{
      try{return{ok:true,row:await run(id)}}catch(e){return{ok:false,id,error:e instanceof Error?e.message:String(e)}}
    }));
    for(const item of batch){
      if(item.ok) results.push(item.row);
      else failures.push({asset_id:item.id,asset:A[item.id].asset,error:item.error});
    }
    if(i+BATCH_SIZE<ids.length) await wait(150);
  }
  const generatedAt=new Date().toISOString();
  let cacheSaved=false,cacheError:string|null=null;
  try{await persist(results,generatedAt);cacheSaved=true}catch(e){cacheError=e instanceof Error?e.message:String(e)}
  return new Response(JSON.stringify({ok:failures.length===0&&cacheSaved,generated_at_utc:generatedAt,methodology:"Source-specific leading/forward cycle indicator normalized to 0-100; 35% level, 45% medium trend, 20% recent change",assets_count:ids.length,success_count:results.length,failed_count:failures.length,cache_saved:cacheSaved,cache_error:cacheError,results,failures}),{status:failures.length||!cacheSaved?207:200,headers:H});
});