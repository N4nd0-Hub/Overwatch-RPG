'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const C=require('../gm-core.js');
global.window={GMCore:C};
require('../gm-null-sector.js');
require('../gm-characters.js');
const ramattra=()=>C.normalize(C.fromTemplate('character-ramattra'));
const action=(e,name)=>e.abilities.find(a=>a.name===name);

test('Ramattra has one 2× scale with 1200 HP, 80 damage and 20 reduction',()=>{
 const e=ramattra(),s=C.stats(e);
 assert.equal(e.sheetType,'character');assert.equal(e.tier,2);
 assert.equal(Object.values(e.stats).reduce((a,b)=>a+b,0),30);
 assert.deepEqual([s.hp,s.damage,s.reduction,s.movement,s.energy],[1200,80,20,17.5,12]);
 assert.equal(C.abilityValue(e,action(e,'Acelerador do Vazio')),80);
 assert.equal(C.resourceMax(e,'void-barrier'),600);
 assert.equal(C.resourceMax(e,'nemesis-armor'),200);
 assert.equal(C.abilityValue(e,action(e,'Vórtice Devorador')),40);
 assert.equal(C.abilityValue(e,action(e,'Aniquilação')),60);
});

test('automatic and fixed damage, healing and shields scale once; costs and DT stay explicit',()=>{
 const e=ramattra();
 assert.equal(C.abilityValue(e,C.ability('Auto','skill',{cost:3})),170);
 assert.equal(C.abilityValue(e,C.ability('Heal','skill',{output:'Cura',mode:'fixed',amount:25})),50);
 assert.equal(C.abilityValue(e,C.ability('Shield','skill',{output:'Escudo',mode:'fixed',amount:75})),150);
 assert.equal(C.abilityValue(e,C.ability('CC','skill',{output:'Controle',cost:2})),20);
 assert.equal(action(e,'Vórtice Devorador').saveDt,18);
 assert.equal(action(e,'Aniquilação').cost,10);
});

test('Nemesis deducts energy, adds armor and changes damage without changing base allocation',()=>{
 const e=ramattra();e.sheetState.energy=12;const original=C.clone(e.stats);
 assert.ok(C.abilityBlocked(e,action(e,'Agressão')));
 C.useAbility(e,action(e,'Forma Nêmesis'));
 assert.equal(e.sheetState.energy,9);assert.equal(e.sheetState.resources['nemesis-armor'],200);
 assert.equal(C.stats(e).damage,120);assert.equal(C.stats(e).reduction,28);
 assert.equal(C.abilityValue(e,action(e,'Agressão')),120);
 assert.equal(C.abilityBlocked(e,action(e,'Agressão')),'');
 assert.ok(C.abilityBlocked(e,action(e,'Acelerador do Vazio')));
 assert.throws(()=>C.useAbility(e,action(e,'Forma Nêmesis')),/Recarga|ativo/);
 assert.deepEqual(e.stats,original);
 C.toggleEffect(e,'nemesis',false);assert.equal(C.stats(e).damage,80);assert.equal(e.sheetState.resources['nemesis-armor'],0);
});

test('Block expires, restores movement, and cannot be used outside Nemesis',()=>{
 const e=ramattra();e.sheetState.energy=12;
 assert.throws(()=>C.useAbility(e,action(e,'Bloqueio')),/Requer/);
 C.useAbility(e,action(e,'Forma Nêmesis'));C.useAbility(e,action(e,'Bloqueio'));
 assert.equal(C.stats(e).reduction,68);assert.equal(C.stats(e).movement,10);
 assert.ok(C.abilityBlocked(e,action(e,'Agressão')));
 C.nextCharacterRound(e);assert.equal(C.stats(e).reduction,28);assert.equal(C.stats(e).movement,17.5);
 assert.equal(e.sheetState.energy,11);
});

test('barrier use restores the scaled resource and tracks its cooldown',()=>{
 const e=ramattra();e.sheetState.energy=12;const barrier=action(e,'Barreira do Vazio');
 C.useAbility(e,barrier);assert.equal(e.sheetState.energy,9);assert.equal(e.sheetState.resources['void-barrier'],600);
 assert.throws(()=>C.useAbility(e,barrier),/Recarga/);
 C.nextCharacterRound(e);C.nextCharacterRound(e);C.nextCharacterRound(e);
 assert.equal(e.sheetState.cooldowns[barrier.id],undefined);
 assert.equal(e.sheetState.energy,12);
});

test('insufficient energy leaves resources, effects and energy unchanged',()=>{
 const e=ramattra();e.sheetState.hp=1200;e.sheetState.energy=2;const before=C.clone(e);
 assert.throws(()=>C.useAbility(e,action(e,'Forma Nêmesis')),/Energia insuficiente/);
 assert.deepEqual(e,before);
});

test('Annihilation activates Nemesis, refreshes its duration and ends with its parent',()=>{
 const e=ramattra();C.toggleEffect(e,'nemesis',true);e.sheetState.durations.nemesis=1;e.sheetState.energy=12;
 C.useAbility(e,action(e,'Aniquilação'));
 assert.deepEqual(e.sheetState.activeEffects,['nemesis','annihilation']);assert.equal(e.sheetState.energy,2);
 assert.equal(e.sheetState.durations.nemesis,3);
 C.nextCharacterRound(e);C.nextCharacterRound(e);assert.ok(e.sheetState.activeEffects.includes('annihilation'));
 C.nextCharacterRound(e);assert.deepEqual(e.sheetState.activeEffects,[]);assert.equal(C.stats(e).damage,80);
});

test('basic attack generates energy once per action and respects the cap',()=>{
 const e=ramattra(),a=action(e,'Acelerador do Vazio');e.sheetState.energy=11;
 C.useAbility(e,a);C.useAbility(e,a);assert.equal(e.sheetState.energy,12);
});

test('encounter copies have independent HP, energy, armor, effects and cooldowns',()=>{
 const e=ramattra();e.sheetState.energy=12;C.useAbility(e,action(e,'Forma Nêmesis'));
 const one=C.spawn(e),two=C.spawn(e,2);one.energy=12;
 assert.deepEqual(one.snapshot.sheetState.activeEffects,[]);
 C.useAbility(one.snapshot,action(one.snapshot,'Forma Nêmesis'),one);
 one.hp=775;one.snapshot.sheetState.resources['nemesis-armor']=50;
 assert.equal(one.energy,9);assert.equal(two.energy,0);assert.equal(two.hp,1200);
 assert.deepEqual(two.snapshot.sheetState.activeEffects,[]);
 assert.equal(e.sheetState.resources['nemesis-armor'],200);
 const restored=C.normalizeState({enemies:[e],encounter:{entries:[one,two]}});
 assert.equal(restored.encounter.entries[0].hp,775);assert.equal(C.stats(restored.encounter.entries[0].snapshot).damage,120);
 assert.equal(restored.encounter.entries[0].snapshot.sheetState.resources['nemesis-armor'],50);
});

test('JSON and encrypted-vault payload normalization retain character mechanics',()=>{
 const e=ramattra();e.sheetState.energy=12;C.useAbility(e,action(e,'Forma Nêmesis'));
 const restored=C.normalize(JSON.parse(JSON.stringify(e)));
 assert.deepEqual(C.stats(restored),C.stats(e));assert.deepEqual(restored.profile,e.profile);
 assert.deepEqual(restored.resources,e.resources);assert.deepEqual(restored.effects,e.effects);
 assert.equal(action(restored,'Agressão').requiresEffect,'nemesis');assert.equal(C.abilityValue(restored,action(restored,'Agressão')),120);
 assert.equal(C.abilityText(restored,action(restored,'Aniquilação')).includes('60 de dano'),true);
});

test('legacy and all six fixed campaign templates preserve their values',()=>{
 const expected={nulltrooper:[35,10,25,3,0],'nulltrooper-elite':[70,20,50,6,0],charger:[500,15,40,4,6],'or-unit':[600,15,40,4,12],slicer:[25,18,50,0,0],titan:[2000,12,50,5,16]};
 for(const [key,values] of Object.entries(expected)){const e=C.normalize(C.fromTemplate('nullsector-'+key)),s=C.stats(e);assert.deepEqual([s.hp,s.movement,s.damage,s.attack,s.reduction],values,key)}
 const or=C.fromTemplate('nullsector-or-unit');assert.equal(C.attackValue(or,or.abilities[0]),6);assert.equal(or.abilities[0].attacksPerAction,'X');
 const old=C.normalize({name:'Old soldier',stats:{life:2,power:3,precision:3,dexterity:2,resistance:1},abilities:[]});assert.deepEqual([C.stats(old).hp,C.stats(old).damage],[150,15]);
 assert.equal(new Set(C.TEMPLATES.map(t=>t.key)).size,19);
});

test('player JSON imports become editable character sheets without implicit doubling',()=>{
 const e=C.fromHero({name:'NPC player',role:'Tanque',attrs:{life:6,power:6,precision:3,dexterity:3,resistance:2},perks:[{name:'Perk da campanha'}],basicAttacks:[{name:'Golpe',baseMode:'auto'}]});
 assert.equal(e.sheetType,'character');assert.equal(C.stats(e).hp,450);assert.equal(C.stats(e).damage,30);assert.match(e.profile.perks,/Perk da campanha/);
});

test('character HTML escapes user text and rejects unsafe image schemes',()=>{
 const context={window:{GMCore:C},document:{baseURI:'https://example.test/gm.html'},URL};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../gm-character-sheet.js'),'utf8'),context);
 const e=ramattra();e.name='<script>alert(1)</script>';e.portrait='javascript:alert(1)';e.profile.biography='<img src=x onerror=alert(1)>';
 for(const tab of ['summary','combat','notes']){const html=context.window.GMCharacterSheet.render(e,{tab,readonly:true});assert.ok(!html.includes('<script>'));assert.ok(!html.includes('src="javascript:'));assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;script&gt;'))}
});
