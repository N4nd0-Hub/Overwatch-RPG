(function(root){
'use strict';
const FACTIONS=['Talon','Setor Nulo','Independente'];
const GRADES=['Lacaio','Soldado','Elite','Chefe'];
const ROLES=['DPS','Suporte','Tanque'];
const CONDITIONS=['Atordoado','Derrubado','Lento','Enraizado','Cego','Surdo','Desorientado','Sangrando','Envenenado','Queimando','Eletrificado','Congelante','Congelado','Silenciado'];
const ATTRS=[['life','Vida'],['power','Poder'],['precision','Precisão'],['dexterity','Destreza'],['resistance','Resistência']];
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36);
const clone=x=>JSON.parse(JSON.stringify(x));
const num=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,num(x)));
const round=x=>Math.round(num(x)*100)/100;
function scale(grade='Soldado',tier=0){
 const base={Lacaio:[1,2,2,2,0],Soldado:[2,3,3,2,1],Elite:[5,5,5,4,3],Chefe:[10,8,6,4,5]}[grade]||[2,3,3,2,1],t=clamp(tier,0,10);
 return Object.fromEntries(ATTRS.map(([k],i)=>[k,base[i]+t*(i===0?(grade==='Chefe'?3:2):i===1?2:1)]));
}
function ability(name,kind='skill',fields={}){return {id:uid(),kind,name,output:'Dano',action:kind==='passive'?'Passiva':'Ação Padrão',range:'Médio',target:'1 alvo',cost:kind==='ultimate'?10:kind==='skill'?2:0,mode:kind==='passive'?'none':'auto',amount:0,bonus:0,effect:'',...fields}}
function makeEnemy(fields={}){
 const grade=GRADES.includes(fields.grade)?fields.grade:'Soldado';
 return {id:uid(),name:'Novo inimigo',faction:'Independente',grade,role:'DPS',tier:0,folderId:'',portrait:'',summary:'',notes:'',archived:false,
  stats:scale(grade,fields.tier||0),adjust:{hp:0,damage:0,reduction:0,movement:0,energy:0,attack:0,defense:0},
  abilities:[ability('Ataque Básico','basic')],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),...fields};
}
function stats(enemy){
 const a=enemy.stats,m=enemy.adjust||{},base=enemy.role==='Tanque'?150:enemy.role==='Suporte'?100:50;
 return {hp:Math.max(1,Math.round(base+num(a.life)*50+num(m.hp))),damage:Math.max(0,round(num(a.power)*5+num(m.damage))),reduction:Math.max(0,round(num(a.resistance)*2+num(m.reduction))),movement:Math.max(0,round(10+num(a.dexterity)*2.5+num(m.movement))),energy:Math.max(0,round(10+num(m.energy))),attack:round(num(a.precision)+num(m.attack)),defense:round(num(a.dexterity)+num(m.defense)),dt:round(10+num(a.power))};
}
function abilityValue(enemy,a){
 if(a.mode==='none'||a.kind==='passive')return null;
 if(a.mode==='fixed')return Math.max(0,round(a.amount));
 if(a.output==='Movimento'||a.output==='Utilidade')return null;
 if(a.output==='Controle')return round(stats(enemy).dt+num(a.cost));
 return Math.max(0,round(stats(enemy).damage+num(a.bonus)+(a.kind==='basic'?0:num(a.cost)*15)));
}
function normalize(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Ficha de inimigo inválida.');
 const e=makeEnemy(),clean=(s,n=300)=>String(s??'').slice(0,n);
 for(const k of ['id','name','faction','grade','role','folderId','portrait','summary','notes','createdAt','updatedAt'])if(raw[k]!==undefined)e[k]=clean(raw[k],k==='portrait'?5000000:k==='notes'?60000:k==='summary'?5000:300);
 e.name=e.name.trim()||'Inimigo sem nome';if(!ROLES.includes(e.role))e.role='DPS';if(!GRADES.includes(e.grade))e.grade='Soldado';if(!FACTIONS.includes(e.faction))e.faction='Independente';
 e.tier=Math.round(clamp(raw.tier??0,0,10));e.archived=!!raw.archived;
 const original=raw.stats||raw.attrs||{};
 e.stats=Object.fromEntries(ATTRS.map(([k])=>[k,clamp(original[k]??e.stats[k],0,999)]));
 e.adjust=Object.fromEntries(Object.keys(e.adjust).map(k=>[k,clamp(raw.adjust?.[k]??0,-99999,99999)]));
 if(Array.isArray(raw.abilities))e.abilities=raw.abilities.slice(0,80).map(a=>{
  if(!a||typeof a!=='object')throw Error('Habilidade inválida.');
  const v=ability(clean(a.name,160),['basic','skill','passive','ultimate'].includes(a.kind)?a.kind:'skill');
  for(const k of ['id','name','output','action','range','target','mode','effect'])if(a[k]!==undefined)v[k]=clean(a[k],k==='effect'?30000:300);
  if(!['auto','fixed','none'].includes(v.mode))v.mode='none';
  for(const k of ['amount','bonus','cost'])v[k]=clamp(a[k]??0,k==='bonus'?-99999:0,99999);
  return v;
 });
 return e;
}
function fromHero(h){
 const e=makeEnemy({name:h.name||'NPC importado',role:h.role==='Tank'?'Tanque':h.role,stats:h.attrs,portrait:h.image||'',tier:h.tier||0,grade:'Elite'});
 e.abilities=[];
 const convert=(a,kind)=>ability(a.name,kind,{output:a.type||'Dano',action:a.action||'Ação Padrão',range:a.range||'',target:a.target||'',cost:a.minCost||0,mode:a.baseMode==='description'?'none':a.baseMode==='manual'?'fixed':'auto',amount:a.baseValue||0,bonus:a.bonusValue||0,effect:[a.description,a.amplification,a.notes].filter(Boolean).join('\n\n')});
 for(const a of h.basicAttacks||[])e.abilities.push(convert(a,'basic'));
 for(const a of h.abilities||[])e.abilities.push(convert(a,'skill'));
 for(const a of h.passives||[])e.abilities.push(convert(a,'passive'));
 if(h.ultimate)e.abilities.push(convert(h.ultimate,'ultimate'));
 const f=h.mechanics?.formulas||{};
 const base=h.role==='Tanque'?150:h.role==='Suporte'?100:50;
 if(f.hp)e.adjust.hp=(f.hp.useRoleBase===false?num(f.hp.base):base)+num(h.attrs?.life)*num(f.hp.mult,50)+num(f.hp.flat)-(base+num(h.attrs?.life)*50);
 if(f.damage)e.adjust.damage=num(h.attrs?.power)*num(f.damage.mult,5)+num(f.damage.flat)-num(h.attrs?.power)*5;
 if(f.reduction)e.adjust.reduction=num(h.attrs?.resistance)*num(f.reduction.mult,2)+num(f.reduction.flat)-num(h.attrs?.resistance)*2;
 if(f.movement)e.adjust.movement=num(f.movement.base,10)+num(h.attrs?.dexterity)*num(f.movement.mult,2.5)+num(f.movement.flat)-(10+num(h.attrs?.dexterity)*2.5);
 if(f.energy)e.adjust.energy=num(f.energy.base,10)+num(f.energy.flat)-10;
 return normalize(e);
}
function spawn(enemy,number=1){return {id:uid(),enemyId:enemy.id,name:enemy.name+(number>1?' #'+number:''),snapshot:clone(enemy),hp:stats(enemy).hp,energy:0,initiative:0,conditions:[],note:''}}
function newState(){return {version:1,enemies:[],folders:[],encounter:{name:'Novo encontro',round:1,entries:[]}}}
function normalizeState(raw){
 if(!raw||!Array.isArray(raw.enemies))throw Error('Bestiário inválido.');
 const s=newState();s.enemies=raw.enemies.slice(0,3000).map(normalize);
 s.folders=(raw.folders||[]).slice(0,300).filter(f=>f&&typeof f.id==='string').map(f=>({id:String(f.id).slice(0,100),name:String(f.name||'Pasta').slice(0,100)}));
 if(raw.encounter&&Array.isArray(raw.encounter.entries)){
  s.encounter.name=String(raw.encounter.name||'Encontro').slice(0,200);s.encounter.round=Math.max(1,Math.round(num(raw.encounter.round,1)));
  s.encounter.entries=raw.encounter.entries.slice(0,300).map(row=>{const enemy=normalize(row.snapshot),entry=spawn(enemy);return {...entry,id:String(row.id||uid()).slice(0,100),enemyId:String(row.enemyId||enemy.id),name:String(row.name||enemy.name).slice(0,300),hp:clamp(row.hp,0,stats(enemy).hp),energy:clamp(row.energy,0,stats(enemy).energy),initiative:clamp(row.initiative,-999,999),conditions:(row.conditions||[]).filter(x=>CONDITIONS.includes(x)),note:String(row.note||'').slice(0,5000)}});
 }
 return s;
}
const TEMPLATES=[
 {key:'talon-trooper',name:'Soldado de assalto',faction:'Talon',grade:'Soldado',role:'DPS',summary:'Infantaria de avanço e pressão. Funciona em dupla ou em esquadrão.',abilities:[
  ability('Rifle de assalto','basic',{range:'Médio • até 30m',effect:'Disparo de rajada contra um alvo. Gera +1 Energia ao acertar.'}),
  ability('Granada de impacto','skill',{cost:2,range:'Até 18m',target:'Raio de 3m',effect:'Alvos fazem Destreza contra a DT do efeito. Uma falha também deixa o alvo Derrubado.'}),
  ability('Disciplina de esquadrão','passive',{effect:'Se outro soldado da Talon estiver a até 6m, o primeiro ataque da rodada recebe +2 no acerto. Use o bônus apenas nessa situação.'})]},
 {key:'talon-sniper',name:'Atirador de precisão',faction:'Talon',grade:'Elite',role:'DPS',summary:'Ameaça de longo alcance. Obriga o grupo a se mover entre coberturas.',abilities:[
  ability('Rifle perfurante','basic',{range:'Longo • até 80m',bonus:15,effect:'Ignora até 4 de Redução de Dano. Um disparo por Ação Padrão.'}),
  ability('Mira marcada','skill',{output:'Controle',cost:2,mode:'none',range:'Até 80m',effect:'Marca um alvo até seu próximo turno. O próximo disparo contra ele recebe +5 no acerto; mover o atirador encerra a marca.'}),
  ability('Posição preparada','passive',{effect:'Enquanto estiver elevado e em cobertura, recebe +2 de Defesa contra ataques à distância.'})]},
 {key:'talon-medic',name:'Especialista de campo',faction:'Talon',grade:'Soldado',role:'Suporte',summary:'Mantém os soldados em pé e amplia a duração do confronto.',abilities:[
  ability('Pistola tática','basic',{range:'Curto / Médio',effect:'Um disparo contra um alvo.'}),
  ability('Pulso restaurador','skill',{output:'Cura',cost:2,range:'Até 12m',target:'1 aliado',effect:'Recupera o valor de cura do alvo, até o HP Máximo.'}),
  ability('Injeção de emergência','skill',{output:'Cura',cost:3,mode:'fixed',amount:75,range:'Toque',target:'1 aliado',effect:'Cura 75 HP e remove Sangrando ou Envenenado. Uso limitado a 1 vez por combate.'})]},
 {key:'talon-heavy',name:'Baluarte pesado',faction:'Talon',grade:'Elite',role:'Tanque',summary:'Protege o avanço com escudo e pune quem tentar passar.',abilities:[
  ability('Canhão de contenção','basic',{range:'Curto / Médio',bonus:5,effect:'Ao acertar, pode empurrar o alvo 2m para trás.'}),
  ability('Barreira portátil','skill',{output:'Escudo',cost:3,mode:'fixed',amount:150,range:'Pessoal',target:'Frente do agente',effect:'Ergue uma barreira com 150 HP. Ela cobre aliados posicionados atrás do baluarte até ser destruída.'}),
  ability('Parede de aço','passive',{effect:'Enquanto não se mover no turno, recebe +4 de Redução de Dano contra o próximo ataque frontal.'})]},
 {key:'talon-infiltrator',name:'Infiltradora de ruptura',faction:'Talon',grade:'Elite',role:'DPS',summary:'Flanqueia, desativa recursos e pressiona a retaguarda.',abilities:[
  ability('Lâminas de choque','basic',{range:'Corpo a corpo • 1,5m',bonus:10,effect:'Ataque rápido; o alvo não pode receber o bônus de cobertura contra esse golpe.'}),
  ability('Pulso de interferência','skill',{output:'Controle',cost:3,range:'Até 12m',target:'1 alvo',effect:'Resistência contra a DT. Em falha, fica Silenciado até o fim do próximo turno.'}),
  ability('Salto de flanco','skill',{output:'Movimento',cost:1,mode:'none',range:'Até 12m',target:'Você',effect:'Reposiciona-se sem provocar Ataques de Oportunidade.'})]},
 {key:'talon-commander',name:'Comandante de operação',faction:'Talon',grade:'Chefe',role:'Tanque',summary:'Chefe de missão que coordena reforços e muda de postura na metade da luta.',abilities:[
  ability('Punho do comando','basic',{range:'Corpo a corpo • 3m',bonus:15,effect:'O alvo faz Resistência contra DT base; em falha, é empurrado 3m.'}),
  ability('Ordem de execução','skill',{output:'Controle',cost:3,mode:'none',range:'Aliados a até 18m',target:'Até 3 soldados',effect:'Os aliados escolhidos recebem +3 no acerto do próximo ataque até o fim da rodada.'}),
  ability('Reforços na área','skill',{output:'Utilidade',cost:4,mode:'none',range:'Especial',effect:'Uma vez por combate, chama 2 soldados de assalto. Eles entram na rodada seguinte.'}),
  ability('Protocolo de extermínio','ultimate',{cost:10,range:'Raio de 6m',target:'Todos os inimigos',bonus:25,effect:'Alvos fazem Destreza contra DT 10 + Poder + 10. Sucesso reduz o dano à metade.'}),
  ability('Fase II — Sem retirada','passive',{effect:'Ao atingir 50% do HP Máximo, uma vez por combate, remove uma condição e recupera 3 Energia. Até o fim da luta, seu primeiro ataque por rodada recebe +15 de dano.'})]},
 {key:'null-trooper',name:'Unidade de assalto',faction:'Setor Nulo',grade:'Soldado',role:'DPS',summary:'Omnico de combate que concentra fogo e ocupa corredores.',abilities:[
  ability('Emissor de pulso','basic',{range:'Médio • até 24m',effect:'Disparo de energia contra um alvo.'}),
  ability('Rajada sincronizada','skill',{cost:2,range:'Até 24m',target:'Linha de 6m',effect:'Todos na linha sofrem o dano. Cobertura total interrompe a linha.'}),
  ability('Foco de rede','passive',{effect:'Quando duas unidades atacarem o mesmo alvo na rodada, a segunda recebe +2 no acerto.'})]},
 {key:'null-drones',name:'Drone de perseguição',faction:'Setor Nulo',grade:'Lacaio',role:'DPS',summary:'Unidade leve e móvel. Use várias para cercar alvos isolados.',abilities:[
  ability('Ferrão de energia','basic',{range:'Curto • até 9m',effect:'Ataque leve contra um alvo.'}),
  ability('Voo de interceptação','skill',{output:'Movimento',cost:1,mode:'none',range:'Até 12m',target:'Você',effect:'Move-se pelo ar até um ponto visível, podendo ultrapassar obstáculos baixos.'}),
  ability('Alvo frágil','passive',{effect:'Seus ataques recebem +5 de dano contra alvos sem aliados a até 3m.'})]},
 {key:'null-repair',name:'Unidade de reparo',faction:'Setor Nulo',grade:'Soldado',role:'Suporte',summary:'Prioriza unidades pesadas e cria uma decisão de alvo para o grupo.',abilities:[
  ability('Arco de defesa','basic',{range:'Curto • até 6m',effect:'Descarga de proteção contra um alvo.'}),
  ability('Nanorreparo','skill',{output:'Cura',cost:2,range:'Até 12m',target:'1 omnico aliado',effect:'Restaura HP até o máximo. Não afeta alvos orgânicos.'}),
  ability('Remontagem de emergência','skill',{output:'Cura',cost:4,mode:'fixed',amount:100,range:'Toque',target:'1 omnico aliado',effect:'Uma vez por combate, reativa uma unidade caída com 100 HP, limitados ao HP Máximo dela.'})]},
 {key:'null-siege',name:'Unidade de cerco',faction:'Setor Nulo',grade:'Elite',role:'Tanque',summary:'Plataforma pesada de supressão e ataques em área.',abilities:[
  ability('Canhão de cerco','basic',{range:'Longo • até 48m',bonus:15,effect:'Um disparo pesado. Se a unidade tiver se movido no turno, sofre −2 no acerto.'}),
  ability('Bombardeio marcado','skill',{cost:4,range:'Até 36m',target:'Raio de 6m',bonus:10,effect:'Anuncia a área no turno atual; o ataque resolve no início de seu próximo turno. Destreza contra a DT reduz o dano à metade.'}),
  ability('Blindagem frontal','passive',{effect:'Recebe +6 de Redução de Dano contra ataques vindos de sua frente; esse bônus não se aplica a flancos ou retaguarda.'})]},
 {key:'null-executor',name:'Executor de ruptura',faction:'Setor Nulo',grade:'Elite',role:'DPS',summary:'Omnico de combate próximo com controle de deslocamento.',abilities:[
  ability('Lâmina gravitacional','basic',{range:'Corpo a corpo • 3m',bonus:10,effect:'Um golpe contra um alvo.'}),
  ability('Gancho magnético','skill',{output:'Controle',cost:2,range:'Até 15m',target:'1 alvo',effect:'Resistência contra a DT. Em falha, é puxado até 6m em direção ao executor.'}),
  ability('Onda de ruptura','skill',{cost:3,range:'Cone de 6m',target:'Todos no cone',effect:'Destreza contra a DT reduz o dano à metade. Em falha, também fica Derrubado.'})]},
 {key:'null-boss',name:'Núcleo aniquilador',faction:'Setor Nulo',grade:'Chefe',role:'Tanque',summary:'Chefe omnico de múltiplas fases, proteção própria e controle da arena.',abilities:[
  ability('Braço de demolição','basic',{range:'Corpo a corpo • 4,5m',bonus:20,effect:'Pode atingir até 2 alvos adjacentes entre si com a mesma ação; faça um teste para cada alvo.'}),
  ability('Campo de contenção','skill',{output:'Controle',cost:3,range:'Raio de 9m',target:'Todos os inimigos',effect:'Resistência contra a DT. Em falha, fica Lento até o fim da próxima rodada.'}),
  ability('Escudo de núcleo','skill',{output:'Escudo',cost:4,mode:'fixed',amount:200,range:'Pessoal',target:'Você',effect:'Recebe 200 HP de Escudo. O escudo não acumula consigo mesmo.'}),
  ability('Aniquilação de área','ultimate',{cost:10,range:'Raio de 12m',target:'Todos na área',bonus:30,effect:'A área é anunciada uma rodada antes. Destreza contra DT 10 + Poder + 10 reduz o dano à metade.'}),
  ability('Fase II — Núcleo exposto','passive',{effect:'Ao chegar a 50% do HP Máximo, remove seu próprio escudo e recebe +3 Energia. Sua Redução de Dano diminui em 4; os ataques recebem +20 de dano até o fim do combate.'})]}
];
function fromTemplate(key,tier=0){const t=TEMPLATES.find(x=>x.key===key);if(!t)throw Error('Modelo não encontrado.');return makeEnemy({...clone(t),id:uid(),templateKey:key,tier,stats:scale(t.grade,tier),abilities:t.abilities.map(a=>({...clone(a),id:uid()}))})}
const api={FACTIONS,GRADES,ROLES,CONDITIONS,ATTRS,TEMPLATES,uid,clone,num,clamp,round,scale,ability,makeEnemy,stats,abilityValue,normalize,fromHero,spawn,newState,normalizeState,fromTemplate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GMCore=api;
})(typeof window!=='undefined'?window:globalThis);
