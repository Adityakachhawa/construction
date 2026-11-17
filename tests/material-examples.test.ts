import type {CalculatorInputMap} from '../src/calculators/_types';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {formula} from '../src/calculators/mortar-calculator';
for(const unit of ['imperial','metric'] as const)test(`documented illustrative mortar example ${unit}`,()=>{
 const dimensions:CalculatorInputMap=unit==='imperial'?{length_ft:10,height_ft:10}:{length_m:3.048,height_m:3.048};
 for(const waste_pct of [0,15]){
  const out=formula({...dimensions,unit_type:'custom',custom_joint_factor:0.025,bag_size:'custom',custom_yield:0.6,waste_pct},unit);
  // 100 x .025 = 2.5; x 1.15 = 2.875. Both / .6 are above 4 and below 5.
  assert.equal(out.bags_required,5);
 }
});
