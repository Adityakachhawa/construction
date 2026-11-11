import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorRegistry } from '../src/data/registry';
import { ceilQuantity } from '../src/calculators/rounding';
import { convertLength, convertArea, convertVolumeCubicFt, convertWeight } from '../src/utils/format';
const config=(slug:string)=>calculatorRegistry.find(c=>c.slug===slug+'-calculator')!;
const number=(s:string)=>parseFloat(s.replaceAll(',',''));
test('Round-trip unit conversions and boundary ceilings',()=> {
 for(const convert of [convertLength,convertArea,convertVolumeCubicFt,convertWeight]) for(const value of [0,0.125,1,100,1e9]) assert.ok(Math.abs(convert(convert(value,'imperial','metric'),'metric','imperial')-value)<Math.max(1,value)*1e-14);
 assert.equal(ceilQuantity(27*1.1/0.3),99);
 assert.equal(ceilQuantity(1+1e-10),2);
 assert.equal(ceilQuantity(0),0);
 assert.equal(ceilQuantity(1e-20),1);
});
for(const name of ['fence-post','deck-footing','concrete-bags','concrete-block','gravel','sand','mulch','paver-base','roofing','stud']) {
 test(`${name}: every reference table row matches independently calculated quantities`,()=> {
  for(const row of config(name).referenceTable!.rows) {
   if(name==='fence-post') {
    const sections=Math.ceil(number(row[0])/number(row[1]));assert.equal(number(row[2]),sections+1);assert.equal(number(row[3]),sections);
   } else if(name==='deck-footing') {
    const [l,w]=row[0].match(/\d+/g)!.map(Number);const n=(Math.ceil(l/8)+1)*(Math.ceil(w/8)+1);const v=n*Math.PI*(number(row[1])/24)**2*3;
    assert.equal(number(row[2]),n);assert.equal(number(row[3]),Number((v/27).toFixed(2)));assert.equal(number(row[4]),Math.ceil(v/0.6));
   } else if(name==='concrete-bags') {
    for(const [i,yieldFt] of [0.3,0.375,0.45,0.6].entries()) assert.equal(number(row[i+2]),ceilQuantity(number(row[0])*27*1.1/yieldFt));
   } else if(name==='concrete-block') {
    const area=number(row[1]);assert.equal(number(row[3]),ceilQuantity(area*1.125*1.05));assert.equal(row[4],'Product required');
   } else if(['gravel','sand','mulch'].includes(name)) {
    const ft3=number(row[1])*number(row[2])/12;
    assert.ok(Math.abs(number(row[3])-ft3/27)<=0.0051);
    if(name==='mulch') assert.equal(number(row[4]),Math.ceil(ft3/2));
    else assert.ok(Math.abs(number(row[4])-ft3/27*(name==='gravel'?1.4:1.35))<=0.0051);
   } else if(name==='paver-base') {
    const area=number(row[1]);assert.ok(Math.abs(number(row[2])-area/81)<=0.0051);assert.equal(number(row[5]),Math.ceil(area/6));
   } else if(name==='roofing') {
    const area=number(row[0])*Math.hypot(1,number(row[1])/12);const squares=area*1.1/100;
    assert.equal(number(row[2]),Math.round(area));assert.equal(number(row[3]),Number(squares.toFixed(2)));assert.equal(number(row[4]),Math.ceil(squares*3));
   } else {
    const l=number(row[0]);for(const [i,spacing] of [[1,16],[3,24]]) {const n=Math.floor(l*12/spacing)+1;assert.equal(number(row[i]),n);assert.equal(number(row[i+1]),ceilQuantity((n+4)*1.1));}
   }
  }
 });
}
