/* Modificadores da ficha. Os pontos base nunca são alterados por um bônus. */
const BONUS_LABELS = {
  life:'Vida',power:'Poder',precision:'Precisão',dexterity:'Destreza',resistance:'Resistência',
  hp:'HP Máximo',energy:'Energia Máxima',move:'Movimento',damage:'Dano',healing:'Cura',output:'Dano e Cura',
  reduction:'Redução de Dano',reductionMult:'Redução por Resistência',hpScale:'Multiplicador de HP',
  attack:'Acerto',defense:'Defesa',initiative:'Iniciativa',rangedAttack:'Acerto à distância',
  rangedDefense:'Defesa à distância',meleeAttack:'Acerto corpo a corpo',healingAttack:'Acerto de cura',healingSingleAttack:'Acerto de cura alvo único',
  ccResistance:'Resistência contra CC',damagePower:'Poder para dano/cura',basicPower:'Poder do Ataque Básico',
  meleePower:'Poder corpo a corpo',basicDamage:'Dano do Ataque Básico',meleeDamage:'Dano corpo a corpo',
  rangedDamage:'Dano à distância',healingSingle:'Cura alvo único',healingArea:'Cura em área por alvo',
  healingReceived:'Cura recebida',perception:'Percepção',medicine:'Medicina / Tratamento',positioning:'Cobertura / Posicionamento',
  reductionResistance:'Resistência para Redução',ultimateDiscount:'Desconto de Ultimate'
};
const BONUS_EDITABLE = Object.keys(BONUS_LABELS).filter(k=>!['reductionMult','hpScale','ultimateDiscount'].includes(k));
const bonusAlways = mods=>({mods,mode:'always'});
const bonusManual = (mods,label)=>({mods,mode:'manual',label});
const bonusAuto = (mods,when,label)=>({mods,mode:'auto',when,label});

const PERK_BONUSES = {
  'Mira Refinada':[bonusAlways({precision:1})],
  'Bio-Estabilizadores':[bonusAlways({hp:10})],
  'Condensador de Energia':[bonusAlways({energy:1})],
  'Placas Reforçadas':[bonusAlways({resistance:1})],
  'Servos Leves':[bonusAlways({dexterity:1})],
  'Otimizador de Rotas':[bonusAlways({move:2})],
  'Interface de Combate':[bonusAlways({damagePower:1})],
  'HUD de Alerta':[bonusAlways({perception:2})],
  'Projéteis Otimizados':[bonusAlways({basicDamage:5})],
  'Propulsores Avançados':[bonusAlways({move:5})],
  'Blindagem Auxiliar':[bonusManual({reduction:2},'Primeiro ataque recebido na rodada')],
  'Bateria de Reserva':[bonusAlways({energy:2})],
  'Visor Tático':[bonusAlways({rangedAttack:1,positioning:1})],
  'Estimulantes de Campo':[bonusManual({move:5},'Após a cura descrita, até o fim do turno')],
  'Alvo Prioritário':[bonusManual({damage:2},'Alvo com menos de 25% de HP')],
  'Amplificador de Ultimate':[bonusAlways({ultimateDiscount:1})],
  'Overclock Defensivo':[bonusAlways({ccResistance:2})],
  'Cibernética de Impacto':[bonusAlways({meleeDamage:10})],
  'Dispersor Cinético':[bonusManual({reduction:5},'Somente ao receber dano em área')],
  'Sincronização de Fogo':[bonusManual({attack:2},'Mesmo alvo acertado pelo aliado, até o fim do turno')],
  'Kit de Campo Avançado':[bonusAlways({healingReceived:5})],
  'Reforço Estrutural':[bonusAlways({hp:20})],
  'Algoritmo de Supressão':[bonusManual({rangedAttack:2},'Ataques à distância contra cobertura')],
  'Protocolo de Combate Integrado':[bonusAlways({power:1,precision:1,resistance:1})],
  'Exoesqueleto de Assalto':[bonusManual({move:10,damage:30},'Primeira rodada e primeiro ataque acertado')],
  'Núcleo de Overcharge':[bonusManual({attack:5,resistance:10,damage:50},'Overcharge: 2 rodadas; encerre ao terminar')],
  'Matriz Quantizada':[bonusAlways({hpScale:.5})],
  'Implantes de Reação Zero':[bonusAlways({move:25})],
  'Matriz de Sinergia':[bonusManual({precision:3},'Após usar a Ultimate, até o fim da rodada')],
  'Protocolo de Execução':[bonusManual({damage:50},'Somente contra alvos com menos de 25% de HP')]
};

// Cada chave inclui o ramo: nomes repetidos não compartilham regras.
const TREE_BONUSES = {
  'Atirador de Elite':{
    'Mira Cirúrgica':[bonusAlways({rangedAttack:1})],
    'Respiração Controlada':[bonusManual({rangedAttack:1},'Sem se mover neste turno')],
    'Ótica Avançada':[bonusManual({perception:2},'Somente em testes de Percepção ligados à visão')],
    'Fogo Disciplinado':[bonusManual({basicDamage:5},'Todos os ataques básicos contra o mesmo alvo')],
    'Ponto Fraco Exposto':[bonusManual({basicDamage:15},'Alvo com 50% ou menos de HP')],
    'Treinado em Linha de Fogo':[bonusManual({rangedDefense:2,basicDamage:5},'Em cobertura, usando supressão; dano no primeiro alvo')],
    'Sentinela de Altura':[bonusManual({rangedAttack:1,perception:2},'Posição elevada; respeite o alcance descrito')],
    'Posto Fixado':[bonusManual({rangedDamage:5},'Sem mudar de posição, no primeiro acerto')],
    'Domínio de Alcance':[bonusManual({rangedDamage:5},'Ataque Básico em Longo Alcance')],
    'Atirador Intocável':[bonusManual({rangedDefense:2,rangedDamage:10},'Elevado e parado; dano no primeiro acerto da rodada')],
    'Sniper da Overwatch':[bonusManual({rangedAttack:10,rangedDamage:25},'Disparo de Assinatura: 1 vez por missão')]
  },
  'Predador':{
    'Passo de Caça':[bonusAlways({move:2}),bonusManual({attack:1},'Alvo do qual se aproximou neste turno')],
    'Rota de Flanco':[bonusManual({move:2},'Movimento de flanco conforme a descrição')],
    'Entrada Explosiva':[bonusManual({basicDamage:10},'Após mover metade do Movimento, no primeiro acerto')],
    'Nunca Fica Parado':[bonusManual({defense:2},'Após atacar e se mover, até seu próximo turno')],
    'Golpe de Oportunidade':[bonusManual({basicDamage:5},'Corpo a corpo/Curto, alvo acima de 50% de HP')],
    'Instinto de Execução':[bonusManual({basicDamage:10},'Alvo com até 50% de HP'),bonusManual({basicDamage:5},'Adicional se o alvo tiver até 25% de HP')],
    'Explosão de Flanco':[bonusManual({damage:50},'Uma vez por missão, no primeiro dano aplicável')],
    'Isolamento Tático':[bonusManual({attack:2,damage:5},'Alvo isolado conforme a descrição')],
    'Caos na Retaguarda':[bonusManual({rangedDefense:5},'Durante o efeito, contra ataques vindos da área')],
    'Espectro da Backline':[bonusManual({move:15,damage:25},'Modo Espectro: dano somente em Curto; encerre ao terminar')]
  },
  'Sobrevivente':{
    'Pele Grossa':[bonusAlways({resistance:1,reduction:2})],
    'Fôlego de Ferro':[bonusAlways({life:1,healingReceived:5})],
    'Postura Baixa':[bonusManual({reduction:5},'Parado, contra o próximo ataque')],
    'Casca Dura':[bonusAuto({resistance:1,reductionMult:4},'hp50','Seu HP em 50% ou menos')],
    'Armadura Improvisada':[bonusManual({defense:4},'Depois de perder o HP temporário, até a rodada seguinte')],
    'Inquebrável':[bonusManual({resistance:3},'Após usar a sobrevivência, até o fim da cena')],
    'Alimentado pela Dor':[bonusManual({basicDamage:10},'Após perder 20+ HP, no próximo acerto da rodada seguinte')],
    'Instinto de Retaliação':[bonusManual({precision:1},'Após ser alvo de ataque, até a rodada seguinte')],
    'Contra-Golpe Violento':[bonusManual({basicDamage:5},'Contra-golpe, se estiver com até 50% de HP')],
    'Fúria Controlada':[bonusAuto({precision:2,basicDamage:15},'hp50','Seu HP em 50% ou menos')],
    'Cair Não É Opção':[bonusAuto({basicDamage:30},'hp25','Seu HP em 25% ou menos')],
    'Não Vai Cair Agora':[bonusAuto({defense:1,resistance:1},'hp50alive','Seu HP entre 1% e 50%')],
    'Adrenalina de Sobrevivência':[bonusManual({move:5},'Primeira vez abaixo de 50%, até o próximo turno')],
    'Limiar da Dor':[bonusAuto({basicDamage:10,ccResistance:4},'hp30','Seu HP em 30% ou menos')],
    'Instinto de Sobrevida':[bonusManual({defense:2},'Após usar a sobrevivência, até seu próximo turno')],
    'Imortal de Teimosia':[bonusManual({resistance:5,precision:5},'Após usar a sobrevivência, até o fim da cena'),bonusManual({basicDamage:60},'Dano adicional até o fim da próxima rodada')]
  },
  'Executor':{
    'Marca do Caçador':[bonusManual({damage:5},'Contra o alvo marcado; não acumule com Pressão Letal')],
    'Pressão Letal':[bonusManual({basicDamage:15},'Alvo marcado com até 50% de HP; desative Marca do Caçador')],
    'Não Escapa':[bonusManual({attack:2},'Contra inimigos recuando conforme a descrição')],
    'Caçador Implacável':[bonusManual({precision:1,basicDamage:5},'Enquanto houver inimigo abaixo de 50% de HP')],
    'Ritmo de Execução':[bonusManual({move:5,precision:2},'Após derrubar inimigo, até seu próximo turno')],
    'Ceifador Oportunista':[bonusManual({precision:3,power:3},'Alvo ferido e inimigo com até 50% de HP em campo')],
    'Anjo da Morte':[bonusManual({basicPower:12},'Execução Total, contra alvo com até 50% de HP')]
  },
  'Curandeiro de Linha de Frente':{
    'Cura Focada':[bonusAlways({healingSingle:5})],
    'Diagnóstico Rápido':[bonusAlways({healingSingleAttack:1,medicine:2})],
    'Terapia Intensiva':[bonusManual({healingSingle:10},'Alvo da cura com até 50% de HP')],
    'Pulso Regenerativo':[bonusAlways({healingArea:5})],
    'Poço de Cura':[bonusManual({healing:25},'Ao declarar um Poço de Cura; divisão conforme descrição')],
    'Instinto de Sobrevivência':[bonusAlways({dexterity:1}),bonusManual({rangedDefense:1},'Em cobertura')],
    'Foco Inabalável':[bonusManual({healingAttack:2},'Após sofrer dano, nas curas do próximo turno')],
    'Pilar de Vida':[bonusManual({healing:250},'Pilar de Vida: somente na habilidade declarada')]
  },
  'Guardião Protetor':{
    'Muralha Viva':[bonusManual({resistance:3},'A até 3m de aliado com escudo seu'),bonusManual({reduction:15},'Na mesma condição, somente contra ataques à distância')],
    'Proteção Prioritária':[bonusManual({move:12},'Aliado prioritário abaixo de 50%, na rodada do gatilho')],
    'Guardião Inabalável':[bonusManual({resistance:2},'A até 6m do aliado prioritário')],
    'Leitura de Explosão':[bonusManual({perception:2},'Percepção para notar ataques em área')],
    'Bastião Antiexplosão':[bonusManual({resistance:5},'Na Zona Segura, somente contra dano em área')]
  },
  'Agressividade':{
    'Impacto Revigorante':[bonusManual({resistance:2},'Se você for o aliado escolhido, até o próximo turno')],
    'Instinto de Posição':[bonusManual({defense:1},'A até 6m de aliado'),bonusManual({precision:1},'Sozinho: desative o bônus de Defesa')],
    'Apóstolo da Linha de Frente':[bonusManual({basicPower:4},'Em corpo a corpo, a até 3m de aliados')],
    'Suporte em Assassinato':[bonusManual({damage:15},'Modo de Assassinato: somente nas habilidades de Suporte')]
  },
  'Muralha Viva':{
    'Casco de Aço':[bonusAlways({resistance:1,reductionMult:5})],
    'Gigante Robusto':[bonusAlways({hp:25})],
    'Muralha de Aço':[bonusManual({resistance:2},'Escudo ativo e aliado a até 3m')],
    'Respiração de Ferro':[bonusManual({resistance:1},'Enquanto tiver HP de Escudo ou temporário')],
    'Mantém-se em Pé':[bonusAuto({defense:1},'hp30alive','Seu HP em até 30%, acima de 0')],
    'Imóvel como Montanha':[bonusManual({resistance:2,reduction:5},'Sem se mover; redução no próximo ataque')]
  },
  'Quebra-Linha':{
    'Passo de Investida':[bonusAlways({move:6}),bonusManual({meleeAttack:1},'Após avançar 6m em linha reta, no primeiro ataque')],
    'Carga Determinada':[bonusManual({defense:2},'Somente contra oportunidades geradas pelo avanço')],
    'Entrada Demolidora':[bonusManual({meleeDamage:25},'Após mover metade do Movimento, no primeiro acerto')],
    'Vanguarda Imparável':[bonusManual({resistance:10},'Após a investida descrita; opção Resistência')]
  },
  'Guardião de Objetivo':{
    'Raiz no Terreno':[bonusManual({resistance:2},'A até 3m do Objetivo')],
    'Conheço Cada Pedra':[bonusManual({defense:2},'Defendendo o mesmo ponto desde o início')],
    'Bastião do Ponto':[bonusManual({reduction:10},'Sobre o Objetivo')],
    'Instinto de Contestação':[bonusManual({resistance:1,defense:1},'No Objetivo, com inimigo a até 6m')],
    'Contestação Solitária':[bonusManual({resistance:3,reduction:10},'Único aliado no Objetivo')],
    'Última Linha':[bonusManual({resistance:5,reduction:10},'Sozinho no Objetivo, até o próximo turno')]
  },
  'Colosso':{
    'Musculatura de Aço':[bonusAlways({life:1,basicDamage:5})],
    'Peso do Impacto':[bonusAuto(c=>({damage:Math.floor(c.maxHp/100)*5}),'hp50plus','Seu HP em 50% ou mais; +5 por 100 HP Máximo')],
    'Investida Pesada':[bonusManual({meleeDamage:10},'Após mover metade do Movimento, no primeiro acerto'),bonusManual({meleeDamage:5},'Adicional se estiver com 75% ou mais de HP')],
    'Demolidor de Linha':[bonusAuto({damage:10},'max400','HP Máximo de 400 ou mais'),bonusAuto({meleeDamage:5,resistance:1},'maxUnder400','HP Máximo abaixo de 400')],
    'Corpo-Bastião':[bonusAuto(c=>({reductionResistance:Math.min(3,Math.floor(c.maxHp/100))}),'always','+1 Resistência para Redução a cada 100 HP, máximo +3')],
    'Núcleo Imóvel':[bonusAuto({resistance:4,reduction:10},'hp30alive','Seu HP em até 30%, acima de 0')],
    'Motor de Sacrifício':[bonusManual({resistance:2},'Após perder 75+ HP na rodada, até o fim da seguinte')],
    'Colosso Indomável':[bonusAuto({meleePower:5},'hp50','Seu HP em 50% ou menos; corpo a corpo')],
    'Coração de Juggernaut':[bonusManual({resistance:3,damage:10},'Após usar a sobrevivência, até o fim da cena')],
    'Avatar da Massa':[bonusAuto(c=>({meleeDamage:Math.floor(c.maxHp/100)*10}),'hp50plus','Seu HP em 50% ou mais; +10 por 100 HP Máximo'),bonusAuto({resistance:10,defense:4},'hp30','Seu HP em 30% ou menos')],
    'O Colosso':[bonusManual(c=>({meleeDamage:Math.floor(c.maxHp/10)}),'Modo Colosso, nos ataques corpo a corpo')]
  }
};

function bonusSettings(h=hero()) {
  if(!h.bonusToggles||typeof h.bonusToggles!=='object'||Array.isArray(h.bonusToggles))h.bonusToggles={};
  return h.bonusToggles;
}
function bonusSigned(n){return (n>=0?'+':'')+roundSmart(n)}
function bonusFormat(mods){return Object.entries(mods).filter(([,v])=>v!==0).map(([k,v])=>k==='hpScale'?`HP Máximo × ${v}`:k==='reductionMult'?`RD = Resistência × ${v}`:`${bonusSigned(v)}${k==='move'?'m':''} ${BONUS_LABELS[k]||k}`).join(' • ')}

/* Leitura conservadora de descrições personalizadas. Regras complexas usam o editor. */
function inferSheetBonuses(entry,kind){
  const text=String(entry.description||'').replace(/[–−]/g,'-');
  const out={};
  for(const sentence of text.split(/\n|;|[.!?](?=\s|$)/)){
    if(/temporári|por\s+(?:cada|ponto)|para cada|%|\bOU\b/i.test(sentence))continue;
    const self=/\bvocê\s+(?:recebe|ganha|obtém|tem)|\b(?:recebe|ganha)\s+[+-]/i.test(sentence);
    if(/aliad|inimig|advers|\balvo\b/i.test(sentence)&&!self)continue;
    if(kind!=='passive'&&!self&&!/^\s*[+-]/.test(sentence))continue;
    const re=/([+-]\s*\d+(?:[.,]\d+)?)\s*(m\b)?\s*(?:(?:em|de|no|na|ao)\s+)?(HP\s+M[aá]ximo|Vida\s+M[aá]xima|Energia\s+M[aá]xima|Movimento(?:\s+Total)?|Redu[çc][aã]o(?:\s+de\s+Dano)?|Precis[aã]o|Resist[eê]ncia|Destreza|Poder|Vida|Defesa|Iniciativa|Dano|Cura)(?![\wÀ-ÿ])/gi;
    for(const match of sentence.matchAll(re)){
      const prefix=sentence.slice(0,match.index),tail=sentence.slice(match.index+match[0].length);
      if(/(?:aliad|inimig|advers|\balvo\b)/i.test(prefix)&&!/(?:você|recebe|ganha)[^,;]*$/i.test(prefix))continue;
      if(/\b(?:teste|testes)\b/i.test(tail)&&!/Defesa|Iniciativa/i.test(match[3]))continue;
      const label=match[3].toLocaleLowerCase('pt-BR');
      let stat=label.includes('máxim')?(label.startsWith('energia')?'energy':'hp'):label.startsWith('movimento')?'move':label.startsWith('redu')?'reduction':({'precisão':'precision','resistência':'resistance','destreza':'dexterity','poder':'power','vida':'life','defesa':'defense','iniciativa':'initiative','dano':'damage','cura':'healing'})[label];
      if(!stat)continue;
      if(stat==='precision'&&/cura/i.test(tail))stat='healingAttack';
      else if(stat==='precision'&&/distância/i.test(tail))stat='rangedAttack';
      else if(stat==='precision'&&/corpo a corpo/i.test(tail))stat='meleeAttack';
      if(stat==='resistance'&&/contra.*(?:CC|controle)/i.test(tail))stat='ccResistance';
      if(stat==='dexterity'&&/defesa/i.test(tail))stat='defense';
      if(stat==='power'&&/dano\s*\/\s*cura/i.test(tail))stat='damagePower';
      if(stat==='damage'&&/Ataque[s]? Básico[s]?/i.test(sentence))stat='basicDamage';
      else if(stat==='damage'&&/corpo a corpo/i.test(sentence))stat='meleeDamage';
      else if(stat==='damage'&&/distância/i.test(sentence))stat='rangedDamage';
      if(stat==='healing'&&/alvo único/i.test(sentence))stat='healingSingle';
      else if(stat==='healing'&&/em área/i.test(sentence))stat='healingArea';
      const value=num(match[1].replace(/\s/g,'').replace(',','.'));
      out[stat]=num(out[stat])+value;
      if(['life','power','precision','dexterity','resistance'].includes(stat)){
        const list=tail.match(/^\s*((?:(?:,|e)\s*(?:Vida|Poder|Precisão|Destreza|Resistência)\s*)+)/i)?.[1]||'';
        for(const [key,,name]of ATTRS)if(list.toLocaleLowerCase().includes(name.toLocaleLowerCase()))out[key]=num(out[key])+value;
      }
    }
  }
  return Object.entries(out).filter(([,value])=>value).map(([stat,value])=>({stat,value}));
}
function customBonusConfig(entry,kind){
  const inferred=!Array.isArray(entry.sheetBonuses);
  const rows=inferred?inferSheetBonuses(entry,kind):entry.sheetBonuses;
  const mods={};for(const row of rows)if(BONUS_EDITABLE.includes(row.stat))mods[row.stat]=num(mods[row.stat])+num(row.value);
  const conditional=/\b(?:se|quando|enquanto|após|durante)\b|até o|ao (?:usar|receber|sofrer|atingir)|por \d+ rodadas/i.test(entry.description||'');
  const mode=entry.bonusActivation||((kind==='passive'||/Passiva/i.test(entry.action||''))&&!conditional?'always':'manual');
  return {mods,mode,rows,inferred};
}
function customBonusEntries(h=hero()){
  return [...(h.passives||[]).map(entry=>({entry,kind:'passive',key:'passive:'+entry.id})),...(h.abilities||[]).map(entry=>({entry,kind:'ability',key:'ability:'+entry.id})),...(h.ultimate?[{entry:h.ultimate,kind:'ultimate',key:'ultimate'}]:[])];
}
function bonusRecords(){
  const h=hero(),records=[];
  const push=(key,name,origin,definitions)=>definitions?.forEach((def,i)=>records.push({...def,id:key+':'+i,name,origin}));
  for(const name of new Set(h.selectedPerks||[]))push('perk:'+name,name,'Perk',PERK_BONUSES[name]);
  const branch=TREE_DATA[h.role]?.[h.selectedTree],owned=new Set(h.purchasedNodes||[]);
  if(branch)for(const section of branch.sections)for(const node of section.nodes)if(owned.has(node.name))push('tree:'+h.role+':'+h.selectedTree+':'+node.name,node.name,'Árvore',TREE_BONUSES[h.selectedTree]?.[node.name]);
  for(const {entry,kind,key}of customBonusEntries(h)){
    const cfg=customBonusConfig(entry,kind);
    if(Object.values(cfg.mods).some(v=>v))records.push({...cfg,id:key,name:entry.name||'Sem nome',origin:kind==='passive'?'Passiva':kind==='ultimate'?'Ultimate':'Habilidade',label:cfg.mode==='manual'?'Ative enquanto o efeito estiver em você; encerre ao terminar':''});
  }
  return records;
}
function addBonusMods(target,mods){for(const [k,v]of Object.entries(mods||{})){if(k==='hpScale')target[k]=(target[k]??1)*num(v,1);else if(k==='reductionMult')target[k]=Math.max(target[k]||0,num(v));else target[k]=num(target[k])+num(v)}return target}
function bonusHpForMods(mods){
  const h=hero(),m=ensureMechanics(h),f=m.formulas.hp,attr=m.attributeMap.life||'life';
  const life=Math.max(0,num(h.attrs?.[attr])+num(mods[attr]));
  const hp=(f.useRoleBase?(ROLE_META[h.role]||ROLE_META.DPS).baseHp:num(f.base))+life*num(f.mult,50)+num(f.flat)+num(mods.hp);
  return Math.max(1,mods.hpScale===undefined?Math.round(hp):Math.ceil(hp*mods.hpScale));
}
function bonusCondition(when,c){
  const ratio=c.hp/c.maxHp;
  return when==='hp50'?ratio<=.5:when==='hp25'?ratio<=.25:when==='hp30'?ratio<=.3:when==='hp50alive'?ratio>=.01&&ratio<=.5:when==='hp30alive'?c.hp>0&&ratio<=.3:when==='hp50plus'?ratio>=.5:when==='max400'?c.maxHp>=400:when==='maxUnder400'?c.maxHp<400:true;
}
function sheetBonusState(){
  const h=hero(),toggles=bonusSettings(h),records=bonusRecords(),mods={};
  // Avalia condições de HP após os bônus permanentes, sem recursão com maxHp().
  for(const r of records){r.active=r.mode==='always'||r.mode==='manual'&&!!toggles[r.id];if(r.active&&typeof r.mods!=='function')addBonusMods(mods,r.mods)}
  const max=bonusHpForMods(mods),ctx={maxHp:max,hp:clamp(h.hpCurrent==null?max:num(h.hpCurrent),0,max)};
  for(const r of records){
    if(r.mode==='auto')r.active=bonusCondition(r.when,ctx);
    r.resolvedMods=typeof r.mods==='function'?r.mods(ctx):r.mods;
    if(r.active&&(r.mode==='auto'||typeof r.mods==='function'))addBonusMods(mods,r.resolvedMods);
  }
  return {mods,records,context:ctx};
}
function sheetBonus(stat){return num(sheetBonusState().mods[stat])}
function bonusIsMelee(a){return /corpo\s*a\s*corpo|melee|adjacente|toque/i.test(a?.range||'')}
function bonusIsRanged(a){return !bonusIsMelee(a)&&/curto|médio|medio|longo|distância|\d+\s*m\b/i.test(a?.range||'')}
function bonusIsHealing(a){return a?.type==='Cura'}
function bonusIsArea(a){return /área|area|raio|cone|linha|todos|aliados|alvos|explosão/i.test(a?.target||'')}
function sheetAttackBonus(a=hero().basicAttacks?.[0]){
  const m=sheetBonusState().mods;return roundSmart(mechAttr('precision')+num(m.attack)+(bonusIsHealing(a)?num(m.healingAttack)+(bonusIsArea(a)?0:num(m.healingSingleAttack)):bonusIsMelee(a)?num(m.meleeAttack):bonusIsRanged(a)?num(m.rangedAttack):0));
}
function sheetDefenseBonus(){return roundSmart(mechAttr('dexterity')+sheetBonus('defense')+sheetBonus('rangedDefense'))}
function sheetInitiativeBonus(){return roundSmart(mechAttr('dexterity')+sheetBonus('initiative'))}
function sheetOutputBonus(a,basic=false){
  const m=sheetBonusState().mods,mult=num(ensureMechanics().formulas.damage.mult,5);
  let value=num(m.output);
  if(bonusIsHealing(a))return value+num(m.healing)+(bonusIsArea(a)?num(m.healingArea):num(m.healingSingle));
  value+=num(m.damage)+(bonusIsMelee(a)?num(m.meleeDamage)+num(m.meleePower)*mult:bonusIsRanged(a)?num(m.rangedDamage):0);
  if(basic){
    value+=num(m.basicDamage)+num(m.basicPower)*mult;
    if(perkSelected('Projéteis Otimizados')){
      const chosen=hero().perkAttackTarget,attacks=hero().basicAttacks||[],target=attacks.find(x=>x.id===chosen)||attacks[0];
      if(a.id!==target?.id)value-=5;
    }
  }
  return roundSmart(value);
}
function sheetProficiencyBonus(name){const m=sheetBonusState().mods;return /percep[çc][aã]o/i.test(name)?num(m.perception):/medicina|tratamento/i.test(name)?num(m.medicine):/cobertura|posicionamento/i.test(name)?num(m.positioning):0}

function bonusSourceControl(key){
  const list=sheetBonusState().records.filter(r=>r.id.startsWith(key+':'));
  return list.map(r=>`<div class="bonus-source-note ${r.active?'is-active':''}"><span>${esc(bonusFormat(r.resolvedMods))}${r.label?`<small>${esc(r.label)}</small>`:''}</span>${r.mode==='manual'?`<button type="button" class="btn small ${r.active?'role':''}" data-bonus-toggle="${esc(r.id)}" aria-pressed="${r.active}">${r.active?'Desativar':'Ativar efeito'}</button>`:`<b>${r.mode==='auto'?(r.active?'Condição ativa':'Aguardando condição'):'Automático'}</b>`}</div>`).join('');
}
function bonusEditorHtml(entry,kind){
  const key=kind==='ultimate'?'ultimate':kind+':'+entry.id,cfg=customBonusConfig(entry,kind),active=sheetBonusState().records.find(r=>r.id===key)?.active;
  return `<details class="bonus-editor" data-bonus-editor="${esc(key)}"><summary>Bônus na ficha <span>${cfg.rows.length?esc(bonusFormat(cfg.mods)):'Configurar atributos e valores'}</span></summary><div class="bonus-editor-body"><p class="helper">Bônus aplicados a este agente. Efeitos em aliados e inimigos ficam na descrição.</p><div class="bonus-editor-toolbar"><label class="field"><span>Aplicar</span><select class="input" data-bonus-mode="${esc(key)}"><option value="always" ${cfg.mode==='always'?'selected':''}>Sempre / passivo</option><option value="manual" ${cfg.mode==='manual'?'selected':''}>Enquanto ativado</option><option value="off" ${cfg.mode==='off'?'selected':''}>Não aplicar</option></select></label>${cfg.mode==='manual'&&cfg.rows.length?`<button type="button" class="btn small ${active?'role':''}" data-bonus-toggle="${esc(key)}" aria-pressed="${!!active}">${active?'Desativar bônus':'Ativar bônus'}</button>`:''}</div><div class="bonus-rows">${cfg.rows.map((row,i)=>`<div class="bonus-edit-row"><select class="input" aria-label="Valor afetado" data-bonus-stat="${esc(key)}" data-bonus-index="${i}">${BONUS_EDITABLE.map(k=>`<option value="${k}" ${k===row.stat?'selected':''}>${BONUS_LABELS[k]}</option>`).join('')}</select><input class="input" type="number" step="0.5" value="${num(row.value)}" aria-label="Quantidade do bônus" data-bonus-value="${esc(key)}" data-bonus-index="${i}"><button type="button" class="btn small danger" aria-label="Remover bônus" data-bonus-delete="${esc(key)}" data-bonus-index="${i}">×</button></div>`).join('')}</div><div class="bonus-editor-actions"><button type="button" class="btn small" data-bonus-add="${esc(key)}">+ Bônus</button><button type="button" class="btn small" data-bonus-detect="${esc(key)}">Ler descrição</button><small class="helper">${cfg.inferred?'Bônus simples reconhecidos na descrição. Confira regras e condições.':'Bônus configurados manualmente.'}</small></div>${cfg.mode==='manual'?'<p class="helper">“Usar” ativa estes bônus. Desative quando a duração ou condição terminar. Ativar novamente não acumula.</p>':''}</div></details>`;
}
function renderBonusSummary(){
  const box=document.getElementById('bonusSummary');if(!box)return;
  const wasOpen=box.querySelector('details')?.open,{records,mods}=sheetBonusState();
  box.innerHTML=`<details class="bonus-summary" ${wasOpen?'open':''}><summary><b>Bônus automáticos</b><span>${records.filter(r=>r.active).length} ativos${records.some(r=>r.mode==='manual')?' • gerenciar efeitos':''}</span></summary><div class="bonus-summary-body"><p class="helper">Os totais já incluem os bônus. Efeitos por HP acompanham a barra de vida; ative os demais somente quando a condição descrita ocorrer.</p>${records.length?records.map(r=>`<div class="bonus-summary-row ${r.active?'is-active':''}"><div><strong>${esc(r.name)}</strong><small>${r.origin}${r.label?' • '+esc(r.label):''}</small><span>${esc(bonusFormat(r.resolvedMods))}</span></div>${r.mode==='manual'?`<button type="button" class="btn small ${r.active?'role':''}" data-bonus-toggle="${esc(r.id)}" aria-pressed="${r.active}">${r.active?'Desativar':'Ativar'}</button>`:`<b class="bonus-state">${r.active?'Aplicado':'Condição inativa'}</b>`}</div>`).join(''):'<p class="helper">Adquira perks ou nós da árvore. Para habilidades e passivas próprias, abra “Bônus na ficha” no cartão.</p>'}${mods.healingReceived?`<p class="helper">Cura recebida: ${bonusSigned(mods.healingReceived)} por cura. Some ao valor recebido ao editar o HP.</p>`:''}${mods.ccResistance?`<p class="helper">Contra CC: Resistência +${roundSmart(mechAttr('resistance')+num(mods.ccResistance))}.</p>`:''}</div></details>`;
  bindSheetBonusControls(box);
}
function refreshSheetBonusTotals(){
  syncCurrentToMax();renderAttributes();renderDerived();renderResources();renderRollHints();renderProficiencies();renderBonusSummary();save();
}
function bindSheetBonusControls(root=document){
  root.querySelectorAll('[data-bonus-toggle]').forEach(button=>button.onclick=event=>{
    event.stopPropagation();const key=button.dataset.bonusToggle,toggles=bonusSettings();toggles[key]=!toggles[key];
    recalcAgent();renderPassives();renderPerks();renderTree();flushSheetSave();
  });
  const edit=(key,change)=>{
    const found=customBonusEntries().find(x=>x.key===key);if(!found)return;
    const {entry,kind}=found;if(!Array.isArray(entry.sheetBonuses))entry.sheetBonuses=inferSheetBonuses(entry,kind);
    change(entry,kind);recalcAgent();renderPassives();flushSheetSave();
    document.querySelectorAll('[data-bonus-editor]').forEach(el=>{if(el.dataset.bonusEditor===key)el.open=true});
  };
  root.querySelectorAll('[data-bonus-mode]').forEach(el=>el.onchange=()=>edit(el.dataset.bonusMode,entry=>entry.bonusActivation=el.value));
  root.querySelectorAll('[data-bonus-add]').forEach(el=>el.onclick=()=>edit(el.dataset.bonusAdd,entry=>entry.sheetBonuses.push({stat:'power',value:1})));
  root.querySelectorAll('[data-bonus-detect]').forEach(el=>el.onclick=()=>edit(el.dataset.bonusDetect,(entry,kind)=>entry.sheetBonuses=inferSheetBonuses(entry,kind)));
  root.querySelectorAll('[data-bonus-stat]').forEach(el=>el.onchange=()=>edit(el.dataset.bonusStat,entry=>entry.sheetBonuses[num(el.dataset.bonusIndex)].stat=el.value));
  root.querySelectorAll('[data-bonus-value]').forEach(el=>el.onchange=()=>edit(el.dataset.bonusValue,entry=>entry.sheetBonuses[num(el.dataset.bonusIndex)].value=num(el.value)));
  root.querySelectorAll('[data-bonus-delete]').forEach(el=>el.onclick=()=>edit(el.dataset.bonusDelete,entry=>entry.sheetBonuses.splice(num(el.dataset.bonusIndex),1)));
  root.querySelectorAll('[data-perk-attack-target]').forEach(el=>el.onchange=()=>{hero().perkAttackTarget=el.value;recalcAgent()});
}
function activateAbilityBonuses(entry,ultimate=false){
  const key=ultimate?'ultimate':'ability:'+entry.id,cfg=customBonusConfig(entry,ultimate?'ultimate':'ability');
  if(cfg.mode==='manual'&&Object.values(cfg.mods).some(v=>v))bonusSettings()[key]=true;
  if(ultimate&&perkSelected('Matriz de Sinergia'))bonusSettings()['perk:Matriz de Sinergia:0']=true;
}
