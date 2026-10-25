(function(root){
'use strict';
const AUTH_PROOF='1713137c886b62824937974bb71c9ddec4192c34f55f84230e73195cb466a953';
const ITERATIONS=210000,encoder=new TextEncoder(),decoder=new TextDecoder();
const webcrypto=()=>{if(!root.crypto?.subtle)throw Error('Abra o site por uma conexão HTTPS para desbloquear o modo GM.');return root.crypto};
function toBase64(bytes){let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s)}
function fromBase64(s){const data=atob(s);return Uint8Array.from(data,x=>x.charCodeAt(0))}
async function checkPassword(password){const digest=await webcrypto().subtle.digest('SHA-256',encoder.encode(password));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')===AUTH_PROOF}
async function deriveKey(password,salt,iterations=ITERATIONS){
 if(!Number.isInteger(iterations)||iterations<100000||iterations>1000000)throw Error('Parâmetros do backup inválidos.');
 const material=await webcrypto().subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
 return webcrypto().subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
function newSalt(){return webcrypto().getRandomValues(new Uint8Array(16))}
async function encrypt(data,key,salt,iterations=ITERATIONS){
 const iv=webcrypto().getRandomValues(new Uint8Array(12));
 const ciphertext=await webcrypto().subtle.encrypt({name:'AES-GCM',iv},key,encoder.encode(JSON.stringify(data)));
 return {format:'overwatch-rpg-gm-vault',version:1,salt:toBase64(salt),iterations,iv:toBase64(iv),ciphertext:toBase64(new Uint8Array(ciphertext)),updatedAt:new Date().toISOString()};
}
async function decrypt(record,key){
 if(record?.format!=='overwatch-rpg-gm-vault'||record.version!==1||typeof record.ciphertext!=='string'||typeof record.iv!=='string')throw Error('Backup do GM inválido.');
 const plain=await webcrypto().subtle.decrypt({name:'AES-GCM',iv:fromBase64(record.iv)},key,fromBase64(record.ciphertext));
 return JSON.parse(decoder.decode(plain));
}
let connection;
function db(){
 if(connection)return connection;
 connection=new Promise((resolve,reject)=>{
  const req=indexedDB.open('OverwatchRPGGM',1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('vault'))req.result.createObjectStore('vault')};
  req.onsuccess=()=>{const value=req.result;value.onversionchange=()=>{value.close();connection=undefined};resolve(value)};
  req.onerror=()=>reject(req.error||Error('Não foi possível abrir o bestiário.'));
  req.onblocked=()=>reject(Error('Outra aba está bloqueando o bestiário.'));
 }).catch(error=>{connection=undefined;throw error});
 return connection;
}
async function read(){const opened=await db();return new Promise((resolve,reject)=>{const tx=opened.transaction('vault','readonly'),req=tx.objectStore('vault').get('main');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);tx.onabort=()=>reject(tx.error||Error('Leitura interrompida.'))})}
async function write(record){const opened=await db();return new Promise((resolve,reject)=>{const tx=opened.transaction('vault','readwrite');tx.objectStore('vault').put(record,'main');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Falha ao salvar o bestiário.'));tx.onabort=()=>reject(tx.error||Error('Salvamento interrompido.'))})}
const api={checkPassword,deriveKey,newSalt,encrypt,decrypt,fromBase64,read,write,ITERATIONS};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GMVault=api;
})(typeof window!=='undefined'?window:globalThis);
