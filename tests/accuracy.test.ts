import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatorRegistry } from '../src/data/registry';
import type { CalculatorInputMap, UnitSystem } from '../src/calculators/_types';

// Expected answers use geometry, exact unit definitions and explicitly stated
// estimation assumptions. They are not snapshots of calculator outputs.
type Example = [string, CalculatorInputMap, Record<string, number>, CalculatorInputMap, Record<string, number>];
const examples: Example[] = [
 ['concrete-slab', {length_ft:3,width_ft:3,thickness:12}, {cubic_feet:9,bags_80lb:15,bags_60lb:20}, {length_m:1,width_m:1,thickness_mm:1000},{cubic_meters:1,bags_80lb:59}],
 ['gravel',{length_ft:3,width_ft:3,depth:36,density:1.4},{cubic_yards:1,tons:1.4},{length_m:1,width_m:1,depth_mm:1000,density:1.52},{cubic_meters:1,tons:1.52}],
 ['mulch',{length_ft:3,width_ft:3,depth:36},{cubic_yards:1,bags:14},{length_m:1,width_m:1,depth_mm:1000},{cubic_meters:1,bags:18}],
 ['sand',{length_ft:3,width_ft:3,depth:36,density:1.35},{tons:1.35},{length_m:1,width_m:1,depth_mm:1000,density:1.46},{tons:1.46}],
 ['fence-post',{fence_length_ft:50,post_spacing_ft:8,gates:0},{sections:7,posts:8},{fence_length_m:15.24,post_spacing_m:2.4384,gates:0},{sections:7,posts:8}],
 ['deck-footing',{deck_length_ft:12,deck_width_ft:16,footing_spacing_ft:8,footing_diameter:12,footing_depth:36},{footings:9,cubic_feet:21.21,bags:36},{deck_length_m:3,deck_width_m:4,footing_spacing_m:2,footing_diameter_mm:1000,footing_depth_mm:1000},{footings:9,cubic_meters:7.069}],
 ['retaining-wall',{wall_length_ft:10,wall_height_ft:3,block_length:16,block_height:8},{courses:5,blocks:44},{wall_length_m:3,wall_height_m:0.9,block_length_mm:400,block_height_mm:200},{courses:5,blocks:44}],
 ['paver-base',{length_ft:3,width_ft:3,base_depth:12,sand_depth:4},{gravel_cubic_feet:9,sand_cubic_feet:3},{length_m:3,width_m:2,base_depth_mm:100,sand_depth_mm:50},{gravel_cubic_meters:0.6,sand_cubic_meters:0.3}],
 ['rebar',{length_ft:10,width_ft:10,spacing:12,waste_pct:0,rebar_size:'4'},{grid_bars:22,linear_ft:220,weight_lbs:147},{length_m:3,width_m:3,spacing_mm:300,waste_pct:0,rebar_size:'4'},{grid_bars:22,linear_m:66,weight_kg:65.6}],
 ['drywall',{wall_height_ft:10,wall_width_ft:10,num_walls:1,sheet_size:'4x8'},{sheets_net:4,sheets_with_waste:4,compound_gallons:1.1,tape_linear_ft:50},{wall_height_m:3.048,wall_width_m:3.048,num_walls:1,sheet_size:'4x8'},{sheets_net:4,compound_liters:4.2,tape_linear_m:15}],
 ['asphalt',{length_ft:3,width_ft:3,thickness:36,density:2.025},{tons:2.025},{length_m:1,width_m:1,thickness_mm:1000,density:2.4},{tons:2.4}],
 ['flooring',{length_ft:10,width_ft:10,waste_pct:10,box_coverage:20},{area_sqft:100,boxes:6},{length_m:10,width_m:10,waste_pct:10,box_coverage_m2:20},{area_sqm:100,boxes:6}],
 ['concrete-column',{diameter_in:12,height_ft:10,columns:1},{cubic_feet:7.854,bags:14},{diameter_mm:1000,height_m:1,columns:1},{cubic_meters:0.785,bags:47}],
 ['topsoil',{length_ft:3,width_ft:3,depth:36,density:1.1},{tons:1.1},{length_m:1,width_m:1,depth_mm:1000,density:1.2},{tons:1.2}],
 ['aggregate',{length_ft:3,width_ft:3,depth:36,density:1.5},{tons:1.5},{length_m:1,width_m:1,depth_mm:1000,density:1.63},{tons:1.63}],
 ['concrete-block',{length_ft:16,height_ft:8,waste_pct:0},{blocks:144,mortar_bags:0,mortar_ready:0},{length_m:4,height_m:2,waste_pct:0},{blocks:100,mortar_bags:0,mortar_ready:0}],
 ['concrete-driveway',{length_ft:3,width_ft:3,thickness:36,cost_per_yard:150},{cubic_yards:1,cost:150},{length_m:1,width_m:1,thickness_mm:1000,cost_per_m3:200},{cubic_meters:1,cost:200}],
 ['concrete-footing',{length_ft:1,width_ft:1,depth_ft:1,count:100},{cubic_feet:100,cubic_yards:3.704},{length_m:0.1,width_m:0.1,depth_m:0.1,count:100},{cubic_meters:0.1}],
 ['plywood',{length_ft:8,width_ft:8,waste_pct:0,sheet_size:'4x8'},{sheets_net:2,sheets_waste:2},{length_m:2,width_m:2,waste_pct:0,sheet_size:'4x8'},{sheets_net:2,sheets_waste:2}],
 ['stud',{length_ft:12,height_ft:8,spacing:'16',openings:0},{field_studs:10,total_studs:14},{length_m:4,height_m:2.4,spacing:'400',openings:0},{field_studs:11,total_studs:15}],
 ['roof-pitch',{rise_ft:3,run_ft:4},{pitch_ratio:9,slope_pct:75,angle_deg:36.87,rafter_length_ft:5},{rise_m:3,run_m:4},{pitch_ratio:9,rafter_length_m:5}],
 ['roofing',{length_ft:10,width_ft:10,pitch:'9',waste_pct:0},{roof_area_sqft:125,squares:1.25,bundles:4},{length_m:10,width_m:10,pitch:'9',waste_pct:0},{roof_area_sqm:125,bundles:41}],
 ['rafter',{rise_ft:3,run_ft:4,overhang_ft:4},{rafter_length_ft:5,overhang_rafter_ft:5,total_rafter_ft:10},{rise_m:3,run_m:4,overhang_m:4},{rafter_length_m:5,total_rafter_m:10}],
 ['metal-roofing',{length_ft:12,width_ft:16,pitch:'9',panel_cover_in:36,panel_length_ft:10,waste_pct:0},{panels:8,panel_cols:4,panel_rows:1,roof_area_sqft:240},{length_m:12,width_m:16,pitch:'9',panel_cover_mm:1000,panel_length_m:10,waste_pct:0},{panels:24,panel_rows:1,roof_area_sqm:240}],
 ['lumber',{lumber_size:'custom',thickness_in:2,width_in:4,length_ft:12,quantity:3,waste_pct:0,cost_per_board:10},{board_feet:24,total_boards:3,cost:30},{thickness_mm:50.8,width_mm:101.6,length_m:3.6576,quantity:3,waste_pct:0},{board_feet:24,total_boards:3}],
 ['stair',{total_rise_ft:9,riser_height_in:7.5,tread_depth_in:10},{risers:15,treads:14,actual_riser_in:7.2,total_run_ft:11.67},{total_rise_m:2.7,riser_height_mm:180,tread_depth_mm:250},{risers:15,treads:14,actual_riser_mm:180,total_run_m:3.5}],
 ['siding',{height_ft:10,width_ft:10,walls:1,window_area_sqft:10,door_area_sqft:10,panel_coverage_sqft:20,waste_pct:0},{net_area_sqft:80,panels:4},{height_m:10,width_m:10,walls:1,window_area_sqm:10,door_area_sqm:10,panel_coverage_sqm:20,waste_pct:0},{net_area_sqm:80,panels:4}],
 ['board-foot',{thickness_in:2,width_in:4,length_ft:12,quantity:3},{board_feet:24,volume_cuft:2},{thickness_mm:50.8,width_mm:101.6,length_m:3.6576,quantity:3},{board_feet:24,volume_cuft:2}],
 ['excavation',{length_ft:3,width_ft:3,depth_ft:3,swell_pct:20,truck_capacity:1,cost_per_unit:100},{expanded_yards:1.2,truckloads:2,cost:120},{length_m:1,width_m:1,depth_m:1,swell_pct:20,truck_capacity:1,cost_per_unit:100},{expanded_m3:1.2,truckloads:2,cost:120}],
 ['square-footage',{shape:'rectangle',length_ft:10,width_ft:5},{area_sqft:50,perimeter:30},{shape:'rectangle',length_m:10,width_m:5},{area_sqm:50,perimeter_m:30}],
 ['french-drain',{length_ft:10,width_ft:1,depth_ft:1,gravel_pct:90,waste_pct:10},{gravel_cuft:9.9,pipe_length_ft:11,fabric_sqft:33},{length_m:10,width_m:1,depth_m:1,gravel_pct:90,waste_pct:10},{gravel_cum:9.9,pipe_length_m:11,fabric_sqm:33}],
 ['concrete-bags',{length_ft:3,width_ft:3,depth_ft:3,bag_size:'80lb',waste_pct:0},{net_bags:45,bags_required:45},{length_m:1,width_m:1,depth_mm:1000,bag_size:'80lb',waste_pct:0},{net_bags:59}],
 ['insulation',{length_ft:10,width_ft:10,coverage_sqft:40,waste_pct:0},{net_rolls:3,rolls_required:3},{length_m:10,width_m:10,coverage_sqm:40,waste_pct:0},{net_rolls:3,rolls_required:3}],
 ['mortar',{length_ft:10,height_ft:10,unit_type:'custom',custom_joint_factor:0.03,bag_size:'custom',custom_yield:0.5,waste_pct:0},{mortar_cuft:3,net_bags:6},{length_m:3.048,height_m:3.048,unit_type:'custom',custom_joint_factor:0.03,bag_size:'custom',custom_yield:0.5,waste_pct:0},{mortar_cuft:3}],
 ['grout',{area_sqft:100,tile_length_in:12,tile_width_in:12,joint_width_in:0.125,tile_depth_in:0.25,waste_pct:0},{grout_cuft:0.043,net_bags:1},{area_sqm:9.290304,tile_length_mm:304.8,tile_width_mm:304.8,joint_width_mm:3.175,tile_depth_mm:6.35,waste_pct:0},{grout_cuft:0.043}],
 ['post-hole',{diameter_in:12,depth_ft:2,post_width_in:3.5,gravel_depth_in:0,num_holes:1,bag_size:'80lb',waste_pct:0,cost_per_bag:7},{excavation_cuft:1.57,concrete_cuft:1.4,bags_required:3,cost:21},{diameter_mm:304.8,depth_m:0.6096,post_width_mm:88.9,gravel_depth_mm:0,num_holes:1,bag_size:'80lb',waste_pct:0},{concrete_cuft:1.4,bags_required:3}],
 ['concrete-slab-rebar',{length_ft:10,width_ft:10,thickness:12,spacing:12,rebar_size:'4',waste_pct:0},{cubic_feet:100,rebar_grid_bars:22,rebar_linear_ft:220},{length_m:3,width_m:3,thickness_mm:100,spacing_mm:300,rebar_size:'4',waste_pct:0},{cubic_meters:0.9,rebar_grid_bars:22,rebar_linear_m:66}],
];
export const knownAnswerSlugs = examples.map(([name])=>`${name}-calculator`);
test('Every registered calculator has independent imperial AND metric examples',()=> {
 assert.deepEqual(new Set(knownAnswerSlugs),new Set(calculatorRegistry.map(c=>c.slug)));
});
for (const [name, imperial, expectedI, metric, expectedM] of examples) {
 for (const [unit, inputs, expected] of [['imperial',imperial,expectedI],['metric',metric,expectedM]] as const) {
  test(`${name}: independent ${unit} construction example`,()=> {
   const config=calculatorRegistry.find(c=>c.slug===`${name}-calculator`)!;
   const result=config.formula(inputs,unit);
   for(const [key,value] of Object.entries(expected)) {
    assert.ok(Math.abs(result[key]-value)<=0.00051,`${name}/${unit}/${key}: expected ${value}, got ${result[key]}`);
   }
  });
 }
}

const calc=(slug:string,inputs:CalculatorInputMap,unit:UnitSystem='imperial')=>calculatorRegistry.find(c=>c.slug===slug+'-calculator')!.formula(inputs,unit);
test('No material undercount from premature volume/area rounding',()=> {
 assert.equal(calc('concrete-slab',{length_ft:1,width_ft:1,thickness:7.20012}).bags_80lb,2);
 assert.equal(calc('mulch',{length_ft:1,width_ft:1,depth:24.00012}).bags,2);
 assert.equal(calc('flooring',{length_ft:2.00001,width_ft:10,waste_pct:0,box_coverage:20}).boxes,2);
 assert.equal(calc('plywood',{length_ft:4.00001,width_ft:8,waste_pct:0,sheet_size:'4x8'}).sheets_net,2);
 assert.equal(calc('insulation',{length_ft:4.00001,width_ft:10,waste_pct:0,coverage_sqft:40}).net_rolls,2);
 assert.equal(calc('roofing',{length_ft:10.00001,width_ft:10,pitch:'0',waste_pct:0}).bundles,4);
 assert.equal(calc('excavation',{length_ft:3.00001,width_ft:3,depth_ft:3,swell_pct:0,truck_capacity:1}).truckloads,2);
 assert.equal(calc('siding',{height_ft:10,width_ft:10.00001,walls:1,window_area_sqft:0,door_area_sqft:0,waste_pct:0,panel_coverage_sqft:100}).panels,2);
});
for (const [shape,inputs,area,perimeter] of [
 ['square',{side_ft:3},9,12],['triangle',{base_ft:6,height_ft:4},12,16],['circle',{radius_ft:1},3.14,6.28],
] as const) test(`Square footage ${shape} geometry`,()=> {
 const out=calc('square-footage',{shape,...inputs}); assert.equal(out.area_sqft,area);assert.equal(out.perimeter,perimeter);
});
for (const [size,yieldFt] of [['40lb',0.3],['50lb',0.375],['60lb',0.45],['80lb',0.6],['custom',0.5]] as const) {
 test(`Concrete bag yield ${size}: independent 27 ft3`,()=> {
  assert.equal(calc('concrete-bags',{length_ft:3,width_ft:3,depth_ft:3,waste_pct:0,bag_size:size,custom_yield_cuft:0.5}).net_bags,Math.ceil(27/yieldFt));
 });
}
