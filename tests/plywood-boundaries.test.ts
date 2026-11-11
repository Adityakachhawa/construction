import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formula} from '../src/calculators/plywood-calculator';
for(const length of [8,10,12]) for(const unit of ['imperial','metric'] as const) for(const [delta,expected] of [[-1e-7,1],[0,1],[1e-7,2]]) {
 test(`plywood 4x${length} ${unit} boundary ${delta}`,()=>{
  const dimensions=unit==='imperial'?{length_ft:length*(1+delta),width_ft:4}:{length_m:length*0.3048*(1+delta),width_m:1.2192};
  const out=formula({...dimensions,sheet_size:`4x${length}`,waste_pct:0},unit);
  assert.equal(out.sheets_net,expected);assert.equal(out.sheets_waste,expected);
  assert.equal(out.covered_sqft,expected*4*length);
 });
}
test('plywood waste is applied before purchase ceiling',()=>{
 for(const unit of ['imperial','metric'] as const){
  const dims=unit==='imperial'?{length_ft:8,width_ft:4}:{length_m:2.4384,width_m:1.2192};
  assert.equal(formula({...dims,waste_pct:10,sheet_size:'4x8'},unit).sheets_waste,2);
 }
});
