import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorRegistry } from '../src/data/registry';
import { slabDimensions, getThicknessTable } from '../src/data/slab-dimensions';
import { gravelDimensions, getGravelDepthTable } from '../src/data/gravel-dimensions';
import { pierDimensions, getPierDepthTable } from '../src/data/pier-dimensions';
import { mulchDimensions, getMulchDepthTable } from '../src/data/mulch-dimensions';
import { blockWallDimensions, getBlockWallMetrics } from '../src/data/block-wall-dimensions';

const formula=(slug:string)=>calculatorRegistry.find(c=>c.slug===slug+'-calculator')!.formula;
const near=(actual:number, expected:number,tolerance=0.0051)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
test('All 54 dimension-specific pages inventoried',()=>assert.equal(slabDimensions.length+gravelDimensions.length+pierDimensions.length+mulchDimensions.length+blockWallDimensions.length,54));
for(const d of slabDimensions) test(`slab variant ${d.slug}: all thicknesses, independent volumes and bags`,()=> {
 assert.equal(d.areaSqFt,d.length*d.width);
 for(const row of getThicknessTable(d.length,d.width)) {
  const ft3=d.length*d.width*row.thicknessInches/12;
  near(row.cuYds,ft3/27);
  assert.equal(row.bags80Raw,Math.ceil(ft3/0.6));
  assert.equal(row.bags60WithWaste,Math.ceil(ft3*1.1/0.45));
  const parent=formula('concrete-slab')({length_ft:d.length,width_ft:d.width,thickness:row.thicknessInches},'imperial');
  assert.equal(parent.bags_80lb,row.bags80Raw);
  assert.equal(parent.bags_80lb_order,row.bags80WithWaste);
 }
});
for(const d of gravelDimensions) test(`gravel variant ${d.slug}: all depths, stated 10% allowance`,()=> {
 assert.equal(d.areaSqFt,d.length*d.width);
 for(const row of getGravelDepthTable(d.length,d.width)) {
  const yd=d.areaSqFt*row.depthInches/324;
  near(row.cuYds,yd);near(row.tonsCrushedStone,yd*1.1*1.4,0.051);
  const parent=formula('gravel')({length_ft:d.length,width_ft:d.width,depth:row.depthInches,density:1.4},'imperial');
  near(parent.cubic_yards,yd);near(row.tonsCrushedStone,parent.tons*1.1,0.051);
 }
});
for(const d of pierDimensions) test(`pier variant ${d.slug}: all depths and 1/4/6/8 counts`,()=> {
 for(const row of getPierDepthTable(d.diameterInches)) {
  const ft3=Math.PI*(d.diameterInches/24)**2*row.depthInches/12;
  near(row.cuFtSingle,ft3);
  assert.equal(row.bags80Single,Math.ceil(ft3*1.1/0.6));
  assert.equal(row.bags80FourPiers,Math.ceil(ft3*4*1.1/0.6));
  assert.equal(row.bags60SixPiers,Math.ceil(ft3*6*1.1/0.45));
  assert.equal(row.bags80EightPiers,Math.ceil(ft3*8*1.1/0.6));
  const parent=formula('concrete-column')({diameter_in:d.diameterInches,height_ft:row.depthInches/12,columns:1},'imperial');
  near(parent.cubic_feet,ft3,0.00051);
  assert.equal(parent.bags,Math.ceil(ft3/0.6)); // Parent excludes waste; table explicitly includes 10%.
 }
});
for(const d of mulchDimensions) test(`mulch variant ${d.slug}: every depth, bags and illustrative cost`,()=> {
 assert.equal(d.areaSqFt,d.length*d.width);
 for(const row of getMulchDepthTable(d.areaSqFt)) {
  const ft3=d.areaSqFt*row.depthInches/12;
  near(row.cuFt,ft3);assert.equal(row.bags2cuft,Math.ceil(ft3/2));assert.equal(row.bags1_5cuft,Math.ceil(ft3/1.5));
  assert.equal(row.baggedCost,Math.round(Math.ceil(ft3/2)*4.25));
  const parent=formula('mulch')({length_ft:d.length,width_ft:d.width,depth:row.depthInches},'imperial');
  assert.equal(parent.bags,row.bags2cuft);
 }
});
for(const d of blockWallDimensions) test(`block variant ${d.slug}: module counts match parent; mortar assumption explicit`,()=> {
 const row=getBlockWallMetrics(d.height,d.length);
 const net=d.height*d.length*144/(8*16);
 assert.equal(row.totalBlocksWithWaste,Math.ceil(net*1.05));
 assert.equal(row.mortarBags,null);
 const parent=formula('concrete-block')({length_ft:d.length,height_ft:d.height,waste_pct:5},'imperial');
 assert.equal(parent.blocks,row.totalBlocksWithWaste);
 assert.equal(parent.mortar_ready,0); // No unsupported bag count without a product.
});
