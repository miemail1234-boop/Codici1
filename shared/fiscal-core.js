/* Shared by Journal and Fisco Tracker. No independent fiscal cache. */
(function(root){
'use strict';
const types=[['cu','Certificazione Unica'],['saldo-primo-acconto','Saldo imposte e primo acconto'],['secondo-acconto','Secondo acconto'],['730','Modello 730'],['redditi-pf','Modello Redditi PF'],['enpap-acconto','ENPAP: acconto contributi'],['enpap-redditi','ENPAP: comunicazione redditi'],['tari','TARI'],['bollo-auto','Bollo auto'],['assicurazione-auto','Assicurazione auto'],['ordine-psicologi','Quota Ordine Psicologi Lombardia'],['investimenti-esteri','Investimenti esteri / IVAFE'],['cripto','Criptoattività / plusvalenze']];
function identity(key){return key.replace(/-saldo-maggiorato$/,'-saldo-primo-acconto');}
function legacyRows(state){
 const completed=Array.isArray(state.completedDeadlines)?Object.fromEntries(state.completedDeadlines.map(k=>[k,true])):state.completedDeadlines||{};
 const keys=new Set([...Object.keys(completed),...Object.keys(state.paymentAmounts||{}),...Object.keys(state.deadlineNotes||{}),...Object.keys(state.uploadedFiles||{})]);
 const grouped=new Map();
 for(const key of keys){
  if(!/^20\d{2}-[a-z0-9-]+$/.test(key))continue;
  const canonical=identity(key), year=Number(key.slice(0,4)),type=canonical.slice(5);
  const row=grouped.get(canonical)||{external_source:'fisco-tracker',external_key:canonical,fiscal_year:year,obligation_key:type,title:(types.find(x=>x[0]===type)?.[1]||type)+' '+year,category:'fiscale',due_on:null,date_verified:false,applicability:'da_verificare',status:'pending',notes:''};
  if(completed[key])row.status='completed';
  // Legacy amount has no payment date or clear due/paid meaning; preserve it without fabricating a payment.
  const amount=state.paymentAmounts?.[key];const note=state.deadlineNotes?.[key];
  if(amount!==undefined||note)row.notes+=(row.notes?'\n':'')+key+': '+(note||'')+(amount!==undefined?' | Importo storico da classificare: '+String(amount):'');
  if(key.endsWith('saldo-maggiorato'))row.notes+='\nFinestra alternativa con maggiorazione: verificare data/importo; stesso obbligo del saldo ordinario.';
  if(key.endsWith('secondo-acconto'))row.notes+='\nIl vecchio modello univa secondo acconto e Redditi PF: verificare separatamente la dichiarazione.';
  grouped.set(canonical,row);
 }
 return [...grouped.values()];
}
class Store {
 constructor(db,user){this.db=db;this.user=user;}
 async all(table='journal_deadlines',filter=null){let result=[];for(let from=0;;from+=500){let q=this.db.from(table).select('*').eq('user_id',this.user.id).order('id').range(from,from+499);if(filter)q=filter(q);const {data,error}=await q;if(error)throw error;result.push(...data);if(data.length<500)return result;}}
 async create(p){const {data,error}=await this.db.from('journal_deadlines').insert({...p,user_id:this.user.id}).select().single();if(error)throw error;return data;}
 async update(row,patch){const {data,error}=await this.db.from('journal_deadlines').update(patch).eq('user_id',this.user.id).eq('id',row.id).eq('revision',row.revision).select().maybeSingle();if(error)throw error;if(!data)throw Error('Modifica concorrente: i tuoi dati non sono stati sovrascritti. Ricarica e confronta prima di salvare.');return data;}
 async payment(row,p){const {data,error}=await this.db.rpc('lifeos_record_payment',{p_deadline:row.id,p_revision:row.revision,p_id:p.id,p_amount:p.amount,p_paid_on:p.paid_on,p_note:p.note||''});if(error)throw error;return data;}
 async migrate(state){const existing=await this.all();let imported=0,conflicts=[];for(const p of legacyRows(state)){
 const old=existing.find(x=>x.external_source===p.external_source&&x.external_key===p.external_key||x.fiscal_year===p.fiscal_year&&x.obligation_key===p.obligation_key);
 if(old){if((p.status==='completed'&&old.status!=='completed')||p.notes)conflicts.push({local:p,cloud:old.id});continue;}
 try{const row=await this.create(p);existing.push(row);imported++;}catch(e){if(e.code==='23505')conflicts.push({local:p,reason:'Identità già presente'});else throw e;}}
 return {imported,conflicts};}
}
const api={Store,types,identity,legacyRows};if(typeof module!=='undefined')module.exports=api;else root.LifeOSFiscal=api;
})(typeof window==='undefined'?globalThis:window);
