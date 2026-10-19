(()=>{'use strict';
// Uses the existing authenticated Supabase session, never a service credential.
window.FiscalServer=class{
 constructor(db){this.db=db;}
 async call(route,body){const {data,error}=await this.db.functions.invoke('fiscal-google/'+route,{body:body||{},method:'POST'});if(error)throw Error('Integrazione Google non disponibile: '+error.message);if(data?.error)throw Error(data.error);return data;}
 async status(){return this.call('status');}
 async connect(){const result=await this.call('connect');const u=new URL(result.url);if(u.origin!=='https://accounts.google.com')throw Error('Indirizzo OAuth non valido');location.assign(u.href);}
 async upload(row,file,user){const key='lifeos.server.upload.'+user.id+'.'+row.id+'.'+file.name+'.'+file.size+'.'+file.lastModified;const operation=localStorage.getItem(key)||crypto.randomUUID();localStorage.setItem(key,operation);const body=new FormData();body.append('file',file);body.append('deadline_id',row.id);body.append('operation_id',operation);const result=await this.call('upload',body);localStorage.removeItem(key);return result;}
};})();
