(function(){
'use strict';
const C=window.GMCore;
const damage=(name,value,kind='skill',fields={})=>C.ability(name,kind,{cost:0,mode:'fixed',amount:value,output:'Dano',rollMode:kind==='basic'?'attack':'save',...fields});
const special=(name,effect,fields={})=>C.ability(name,'skill',{cost:0,mode:'none',output:'Utilidade',rollMode:'description',effect,...fields});
const passive=(name,effect,fields={})=>C.ability(name,'passive',{cost:0,mode:'none',rollMode:'description',effect,...fields});
const model=(key,name,grade,role,attributes,overrides,image,summary,abilities,notes)=>({key,name,faction:'Setor Nulo',grade,role,tier:0,stats:Object.fromEntries(C.ATTRS.map(([k],i)=>[k,attributes[i]])),overrides,portrait:'assets/gm/'+image+'.webp',portraitFit:'contain',summary,abilities,notes});

const models=[
model('nullsector-nulltrooper','Nulltrooper — Tropa Básica','Lacaio','DPS',[0,5,3,1,0],{hp:35,movement:10},'nulltrooper',
 'Fodder / minion de enxame. Avança, atira e pressiona os heróis sem recorrer a táticas avançadas.',[
 damage('Canhão de Braço',25,'basic',{action:'Ação Padrão',range:'Curto/Médio — aproximadamente 18m',target:'1 herói',rollMode:'attack',
  effect:'Teste de Ataque: 1d20 + 3.\nDano: 25.\nO Nulltrooper atira se já houver um alvo em alcance.'})
],
 'FUNÇÃO\nFodder / minion de enxame.\n\nCOMPORTAMENTO\n• Avança em linha reta até o herói mais próximo.\n• Se já tiver alvo em alcance, atira com o Canhão de Braço.\n• Não procura cobertura nem usa táticas avançadas: apenas avança e pressiona.\n\nVALORES FIXOS\n35 HP e 10m de Movimento, independentemente das fórmulas normais dos atributos.'),

model('nullsector-nulltrooper-elite','Nulltrooper de Elite — Tropa Avançada','Elite','DPS',[0,10,6,2,0],{hp:70,movement:20},'nulltrooper-elite',
 'Elite de enxame / pressão pesada. Marcha à frente dos Nulltroopers comuns e prioriza alvos frágeis.',[
 damage('Canhão de Braço Pesado',50,'basic',{action:'Ação Padrão',range:'Curto/Médio — aproximadamente 18m',target:'1 herói',rollMode:'attack',
  effect:'Teste de Ataque: 1d20 + 6.\nDano: 50.'})
],
 'FUNÇÃO\nElite de enxame / pressão pesada.\n\nCOMPORTAMENTO\n• Avança em grupo à frente dos Nulltroopers comuns.\n• Prioriza alvos frágeis, especialmente Suportes e DPS com pouca Vida.\n• Não usa cobertura avançada: marcha, atira e pressiona.\n\nVALORES FIXOS\n70 HP e 20m de Movimento.'),

model('nullsector-charger','Charger — Unidade de Assalto Pesado','Elite','Tanque',[5,8,4,2,3],{hp:500,movement:null},'charger',
 'Assalto pesado da linha de frente. Abre caminho com a Investida Brutal e pune grupos com foguetes.',[
 damage('Metralhadora de Braço',40,'basic',{action:'Ação Padrão',range:'À distância',target:'1 ou 2 alvos',rollMode:'attack',attacksPerAction:2,
  effect:'Faz 2 ataques à distância por ação, contra o mesmo alvo ou alvos diferentes.\nCada tiro usa 1d20 + 4 para acertar e causa 40 de dano.\nFaça uma rolagem de ataque para cada tiro.'}),
 damage('Investida Brutal — Charge',60,'skill',{action:'Ação Padrão',range:'Até 15m em linha reta',target:'Primeiro alvo no caminho',rollMode:'save',saveType:'Resistência',saveDt:18,
  effect:'O Charger move até 15m em linha reta.\nO primeiro alvo no caminho faz 1d20 + Resistência contra DT 18.\n\nFALHA\nSofre 60 de dano, fica Derrubado e é empurrado 6m.\n\nSUCESSO\nSofre 30 de dano e não fica Derrubado.'}),
 damage('Slam de Foguetes',45,'skill',{action:'Ação Padrão — permanece parado',range:'Ponto alvo; alcance não especificado',target:'Área de 9m de raio',rollMode:'save',saveType:'Destreza',saveDt:20,attacksPerAction:'1d6',
  effect:'O Charger permanece parado e dispara 1d6 foguetes ao redor do ponto alvo, em uma área de 9m de raio.\nAlvos na área fazem 1d20 + Destreza contra DT 20.\nFalha: 45 de dano.\nSucesso: metade do dano.\nA quantidade de foguetes é determinada por 1d6.'}),
 passive('Casco Autorreparador',
  '1 vez por combate, ao cair a 0 HP:\n• Entra em estado invulnerável até o fim do turno atual.\n• No início do próximo turno do Charger, recupera 80 HP e volta a agir normalmente.',{usage:'1 vez por combate',range:'Pessoal',target:'Você'})
],
 'COMPORTAMENTO\n• Corre em direção aos heróis na linha de frente.\n• Tenta abrir o combate com Investida Brutal.\n• Usa Slam de Foguetes quando houver 2 ou mais heróis agrupados.\n• Mantém pressão com a Metralhadora de Braço em quem permanecer de pé.\n\nREFERÊNCIA\nHP fixo: 500. Redução de Dano: 6. Movimento: 15m. Acerto: +4. Resistência contra CC: 1d20 + 3.'),

model('nullsector-or-unit','OR Unit — Plataforma de Cerco Pesado','Chefe','Tanque',[9,8,4,2,6],{hp:null,movement:null},'or-unit',
 'Boss de cerco com canhão de fusão, calor, fortificação e barreira frontal. Ao chegar a 300 HP, entra no Modo Cerco.',[
 damage('Canhão de Fusão OR',40,'basic',{action:'Ação Padrão',range:'Médio/Longo — aproximadamente 24m',target:'Mesmo alvo ou alvos diferentes',rollMode:'attack',attackBonus:2,attacksPerAction:'X',
  effect:'Faz X disparos por ação; X é definido pelo GM. Pode mirar no mesmo alvo ou em alvos diferentes.\nCada disparo usa 1d20 + 6 para acertar e causa 40 de dano.\n\nCALOR\nCada disparo gera 10 de Calor.\nAo atingir 100 de Calor, a OR Unit fica Atordoada por 1 rodada e deve fazer um teste de Resistência contra DT 20 para se livrar do Superaquecimento.\nSe não atirar por 1 rodada, perde 25 de Calor.\n\nMODO CERCO\nCom Poder 10, o dano deste ataque passa a 50.'}),
 damage('Lança de Energia — Javelin',50,'basic',{action:'Ação Padrão',range:'Corpo a corpo / curto — até 6m',target:'1 alvo',rollMode:'attack',
  effect:'Pode arremessar ou espetar a lança.\nTeste de Ataque: 1d20 + 4.\nDano: 50. O alvo é empurrado 6m.\n\nCOLISÃO\nSe bater em uma parede ou obstáculo, o alvo faz 1d20 + Resistência contra DT 18.\nFalha: fica Atordoado por 1 rodada.\n\nMODO CERCO\nO dano deste ataque passa a 60.'}),
 special('Fortificar',
  'Até o início do próximo turno da OR Unit:\n• A Redução de Dano passa a 20.\n• Recebe Vantagem em testes de Resistência: rola 2d20 e fica com o melhor.\n• Fica imune a empurrões, derrubões e Atordoado.\n• O Movimento é reduzido para 10m.',
  {action:'Ação Padrão',range:'Pessoal',target:'Você',cooldownRounds:3,usage:'Dura até o início do próximo turno'}),
 special('Barreira Null',
  'Cria uma barreira frontal de energia com aproximadamente 6m de largura e 200 HP.\nBloqueia ataques à distância vindos de frente.\nSó pode existir 1 barreira por vez.\nQuando ela é destruída, começa a recarga de 3 rodadas.\n\nINDISPONÍVEL NO MODO CERCO\nDepois de entrar na Fase 2, a OR Unit não pode mais usar Barreira Null.',
  {output:'Escudo',mode:'fixed',amount:200,action:'Ação Padrão',range:'Frontal — parede de aproximadamente 6m',target:'Barreira frontal',cooldownRounds:3,usage:'Recarga começa quando a barreira é destruída'}),
 passive('Núcleo de Cerco — Fase 2',
  'Quando a OR Unit chegar a 300 HP ou menos pela primeira vez no combate, entra em Modo Cerco até o fim da luta.\n\nATRIBUTOS DA FASE 2\n• Poder: 10. O dano base aumenta em 10 nos ataques.\n• Resistência: 4. Redução de Dano: 8.\n• Não pode mais usar Barreira Null.\n• Ganha Bombardeio de Javelins como uma nova ação, 1 vez por rodada.\n\nOs valores de cada ação da Fase 2 estão descritos em seus efeitos.',{range:'Pessoal',target:'Você',usage:'Ativa uma vez, ao chegar a 300 HP ou menos'}),
 damage('Bombardeio de Javelins — Modo Cerco',45,'skill',{action:'Nova ação da Fase 2',range:'Cone de 12m à frente',target:'Todos os alvos no cone',rollMode:'save',saveType:'Destreza',saveDt:18,usage:'Somente na Fase 2 • 1 vez por rodada',
  effect:'Disponível somente depois que Núcleo de Cerco ativar o Modo Cerco.\nAlvos no cone fazem 1d20 + Destreza contra DT 18.\nFalha: 45 de dano.\nSucesso: 22 de dano.\nPode usar esta nova ação 1 vez por rodada.'})
],
 'REFERÊNCIA INICIAL\nHP: 150 + 9 × 50 = 600. Redução de Dano: 12. Movimento: 15m.\nAcerto geral: +4. O Canhão de Fusão usa +6.\nResistência contra CC: 1d20 + 6. DT base: 18.\n\nCOMPORTAMENTO — FASE 1 (600 A 301 HP)\nMantém distância média, usando Barreira Null e Canhão de Fusão.\nUsa Lança de Energia se alguém se aproximar demais.\n\nCOMPORTAMENTO — FASE 2 (300 HP OU MENOS)\nAvança como um mini-boss berserker.\nPrioriza Bombardeio de Javelins e Javelin contra grupos. Usa Fortificar quando for focada.\n\nCONTROLE DE COMBATE\nAcompanhe manualmente o Calor, a barreira, as recargas e a entrada permanente no Modo Cerco.\nA quantidade X de disparos do Canhão de Fusão não foi definida na ficha original; fica a critério do GM.'),

model('nullsector-slicer','Slicer — Unidade Devoradora de Carga','Lacaio','DPS',[0,10,0,10,0],{hp:25,movement:18},'slicer',
 'Demolidor de objetivo / devorador de escudo. Ignora heróis e avança até a carga para começar a cortá-la.',[
 damage('Feixe Cortante — Objetivo',50,'basic',{action:'Ação Padrão',range:'Adjacente ao objetivo',target:'Carga, TS-1, portal, mega-canhão ou outro objetivo',rollMode:'automatic',
  effect:'Se estiver adjacente à carga ou objetivo, causa 50 de dano por rodada ao objetivo.\nNão faz rolagem de ataque: basta encostar para começar a cortar.\nSe o Slicer estiver Derrubado, não causa dano à carga enquanto permanecer no chão.'}),
 damage('Feixe Cortante — Escudo / Barreira',100,'basic',{action:'Ação Padrão',range:'Adjacente ao escudo ou barreira',target:'Escudo ou barreira',rollMode:'automatic',
  effect:'Quando o Feixe Cortante estiver cortando um Escudo ou Barreira, causa 100 de dano ao escudo.\nIgnora a Redução de Dano do escudo.\nNão exige rolagem de ataque. Este valor é a versão do feixe contra escudos, não um ataque extra por ação.'}),
 passive('Corpo de Bloqueio',
  'Se um herói se colocar entre o Slicer e o Objetivo, em corpo a corpo e na linha do feixe, o dano vai para o herói em vez da carga.\nO herói sofre 50 de dano; o valor não é dobrado contra ele.\nO Slicer continua focando o mesmo ponto até ser destruído ou empurrado.',{range:'Corpo a corpo — linha do feixe',target:'Herói que bloquear o feixe'}),
 passive('Derrubado por Dano',
  'Sempre que sofrer qualquer dano, o Slicer faz 1d20 + Resistência (0) contra DT 15.\nFalha: fica Derrubado até o fim do próximo turno e para de causar dano à carga enquanto estiver no chão.',{range:'Pessoal',target:'Você',rollMode:'save',saveType:'Resistência',saveDt:15,usage:'Sempre que sofrer qualquer dano'})
],
 'FUNÇÃO\nDemolidor de Objetivo / Devorador de Escudo.\n\nCOMPORTAMENTO\n• Ignora heróis por padrão: corre em uma linha quase reta até a Carga ou Objetivo.\n• Só muda o foco se for empurrado para longe da carga ou se um herói se colocar entre ele e o objetivo.\n• Nunca recua e nunca procura cobertura.\n• Avança, encosta e derrete o objetivo.\n\nREFERÊNCIA\nHP fixo: 25. Movimento fixo: 18m.\nPrecisão 0: não faz ataques normais contra heróis. O Feixe Cortante não exige teste de acerto.'),

model('nullsector-titan','Titan — Arma de Cerco Colossal','Chefe','Tanque',[10,10,5,1,8],{hp:2000,movement:12},'titan',
 'Boss secreto colossal. Surge apenas se a Carga / TS-1 for destruída e pode levar a missão a um desfecho catastrófico.',[
 passive('Gatilho de Aparição — Boss Secreto',
  'Só aparece se a Carga ou TS-1 for destruída.\nSurge descendo do céu ou saindo do omnium no começo da próxima rodada.\nTamanho Colossal: ocupa uma área grande, aproximadamente 3 × 3 casas.',{range:'Especial',target:'Arena',usage:'Apenas após a destruição da Carga / TS-1'}),
 passive('Armadura Titânica',
  'Ignora qualquer dano final menor que 50.\nÉ imune a Empurrão, Derrubar e Atordoar que não sejam causados por Ultimate ou por efeitos Anti-Boss.',{range:'Pessoal',target:'Você'}),
 damage('Lançadores de Granadas de Pulso',40,'skill',{action:'Ação Padrão — Área',range:'Até 24m',target:'3 pontos no chão, cada um com raio de 3m',rollMode:'save',saveType:'Destreza',saveDt:18,
  effect:'Escolhe 3 pontos no chão, cada um com uma área de 3m de raio.\nCriaturas em cada área fazem 1d20 + Destreza contra DT 18.\nFalha: 40 de dano.\nSucesso: 20 de dano.'}),
 damage('Mísseis Hellsiege',60,'skill',{action:'Ação Padrão',range:'Até 40m',target:'2 grandes áreas, cada uma com raio de 6m',rollMode:'save',saveType:'Destreza',saveDt:20,cooldownRounds:2,
  effect:'Escolhe 2 grandes áreas de 6m de raio.\nCriaturas em cada área fazem 1d20 + Destreza contra DT 20.\nFalha: 60 de dano e Derrubado.\nSucesso: 30 de dano.\n\nFASE 2\nGanha +1 uso desta habilidade e pode utilizá-la em rodadas seguidas.'}),
 damage('Canhão de Energia de Braço',70,'basic',{action:'Ação Padrão — feixe em linha',range:'Linha de 30m de comprimento e 3m de largura',target:'Alvos na linha',rollMode:'attack',
  effect:'Faz 1d20 + 5 contra 1d20 + Destreza dos alvos na linha.\nCausa 70 de dano de energia.\nSe atingir Escudo ou Barreira, o escudo recebe +30 de dano extra, totalizando 100 antes de outros modificadores.'}),
 damage('Feixe de Núcleo — Peito',150,'skill',{action:'Ação Padrão — carrega antes de disparar',range:'Linha de 40m de comprimento e 4m de largura',target:'Alvos na linha',rollMode:'save',saveType:'Resistência',saveDt:20,cooldownRounds:3,
  effect:'No primeiro turno, o Titan carrega o núcleo, que brilha em seu peito.\nNo próximo turno, dispara e mantém um feixe em linha reta de 40m, com 4m de largura.\nAlvos na linha fazem 1d20 + Resistência contra DT 20.\nFalha: 150 de dano.\nSucesso: 75 de dano.\nOs jogadores podem tentar sair da linha durante o turno de carga.'}),
 damage('Sistema de Drones Defensivos',20,'skill',{action:'Reação',range:'Contra-fogo no atacante',target:'Atacante que acertou à distância',rollMode:'automatic',usage:'1 vez por rodada',
  effect:'Quando sofrer um ataque à distância que acerte, pode usar esta Reação 1 vez por rodada:\n• Reduz o dano recebido em mais 20, além da Redução de Dano normal.\n• O atacante sofre 20 de dano devido ao contra-fogo dos drones.'}),
 passive('Fase 2 — Núcleo Exposto',
  'Quando o Titan cair para 450 HP ou menos:\n• Poder sobe para 12: +10 de dano nos ataques.\n• Resistência cai para 6: Redução de Dano passa a 12.\n• Ganha +1 uso de Mísseis Hellsiege e pode usá-los em rodadas seguidas.\n• As placas de armadura se abrem e o peito fica ainda mais brilhante.',{range:'Pessoal',target:'Você',usage:'Ativa ao chegar a 450 HP ou menos'}),
 passive('Fase Final — Protocolo de Aniquilação',
  'Ao chegar a 150 HP ou menos, ativa uma contagem de 3 rodadas.\nAo final de cada turno do Titan, todos os heróis no mapa sofrem 30 de dano automático de tremores e destroços.\nSe não for destruído até o fim da 3ª rodada, dispara um mega-feixe de núcleo em tudo ao redor: cidade destruída / missão falhou.\nO Mestre decide se isso significa game over ou se os heróis conseguem fugir nos últimos segundos.',{range:'Todo o mapa',target:'Todos os heróis',usage:'Ativa em 150 HP ou menos • contagem de 3 rodadas'})
],
 'BOSS SECRETO — GATILHO DE APARIÇÃO\nSó aparece se a Carga / TS-1 for destruída. Surge no começo da próxima rodada, descendo do céu ou saindo do omnium.\n\nREFERÊNCIA INICIAL\nHP fixo: 2.000. Redução de Dano: 16. Movimento fixo: 12m.\nAcerto: 1d20 + 5. Resistência contra CC: 1d20 + 8.\nTamanho Colossal: aproximadamente 3 × 3 casas.\n\nCOMPORTAMENTO\n• Prioriza agrupamentos de heróis com Granadas e Mísseis.\n• Usa Canhão de Energia para derreter Tanques e escudos.\n• Usa Feixe de Núcleo quando houver linhas de visão longas.\n• Sempre caminha na direção da maior concentração de heróis ou da antiga Carga, para dramatizar.\n\nFASES\n450 HP ou menos: Núcleo Exposto. Poder 12, Resistência 6, Redução 12 e +1 uso de Mísseis Hellsiege.\n150 HP ou menos: inicia Protocolo de Aniquilação, com prazo de 3 rodadas.\n\nCONTROLE DO GM\nAcompanhe recargas, o turno de carga do feixe, a Reação dos drones e a contagem final. O desfecho da aniquilação é uma decisão narrativa do Mestre.')
];
// Mantém os modelos anteriores e coloca as fichas da campanha primeiro na facção.
const firstNull=C.TEMPLATES.findIndex(t=>t.faction==='Setor Nulo');
for(let i=models.length-1;i>=0;i--){const prior=C.TEMPLATES.findIndex(t=>t.key===models[i].key);if(prior>=0)C.TEMPLATES.splice(prior,1)}
C.TEMPLATES.splice(firstNull<0?C.TEMPLATES.length:firstNull,0,...models);
})();
