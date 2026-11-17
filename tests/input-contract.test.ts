import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorRegistry } from '../src/data/registry';
import { validateInputs, integerFields } from '../src/calculators/validation';

for (const calc of calculatorRegistry) for (const unit of calc.unitSystems) {
 const fields=calc.inputs.filter(f=>!f.onlyIn||f.onlyIn===unit);
 const defaults=Object.fromEntries(fields.map(f=>[f.id,f.defaultValue]));
 test(`${calc.slug}/${unit}: defaults, every select mode, field limits and invalid inputs`,()=> {
  assert.equal(validateInputs(fields,defaults,unit).valid,true);
  const finite=(input:Record<string,number|string>)=> {
   const result=calc.formula(input,unit);
   for(const output of calc.outputs) assert.ok(Number.isFinite(result[output.id]), `${output.id} missing/nonfinite`);
  };
  finite(defaults);
  for (const field of fields) {
   if (field.advanced) continue; // Independent material validity is covered by block-material.test.ts.
   const check=(v:unknown)=>validateInputs(fields,{...defaults,[field.id]:v},unit);
   if (field.type==='rectangles' || field.type==='pairs' || field.type==='dimensions') {
    assert.ok(check('invalid').errors[field.id]);
    assert.ok(!check('').errors[field.id]);
    finite({...defaults,[field.id]:field.columns ? Array(field.columns).fill(1).join('x') : '1x2'});
   } else if (field.type==='select') {
    for(const option of field.options??[]) finite({...defaults,[field.id]:option.value});
    assert.ok(check('not-an-option').errors[field.id]);
   } else {
    for(const invalid of [-1,NaN,Infinity,-Infinity,'invalid',Number.MAX_VALUE]) assert.ok(check(invalid).errors[field.id],`${field.id} accepts ${invalid}`);
    if(field.required) for(const missing of ['',undefined,null]) assert.ok(check(missing).errors[field.id]);
    else assert.ok(!check('').errors[field.id]);
    if(field.min!==undefined) {
     assert.ok(check(field.min-1).errors[field.id]);
     finite({...defaults,[field.id]:field.min});
    }
    if(field.max!==undefined) {
     assert.ok(check(field.max+1).errors[field.id]);
     finite({...defaults,[field.id]:field.max});
    }
    const fractional=(field.min??0)+0.125;
    if(integerFields.has(field.id)) assert.ok(check(fractional).errors[field.id]);
    else finite({...defaults,[field.id]:fractional});
    // Zero is either a valid optional/min-zero quantity or explicitly rejected.
    if((field.min??0)>0) assert.ok(check(0).errors[field.id]);
    else finite({...defaults,[field.id]:0});
   }
  }
 });
}
