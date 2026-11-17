import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formula as stairs } from '../src/calculators/stair-calculator';
import { formula as rafter } from '../src/calculators/rafter-calculator';
import { formula as fence } from '../src/calculators/fence-post-calculator';
import { formula as rebar } from '../src/calculators/rebar-calculator';
import { formula as slabRebar } from '../src/calculators/concrete-slab-rebar-calculator';
import { formula as metal } from '../src/calculators/metal-roofing-calculator';
import { formula as flooring, flooringCalculator } from '../src/calculators/flooring-calculator';
import { formula as slab } from '../src/calculators/concrete-slab';
import { validateInputs } from '../src/calculators/validation';

test('stair going, pitch and heights from measured available run', () => {
  const imperial = stairs({total_rise_ft:9, available_run_in:140}, 'imperial');
  assert.equal(imperial.effective_tread, 10);
  assert.equal(imperial.stair_angle_deg, 35.75);
  const metric = stairs({total_rise_m:2.7432, riser_height_mm:190.5, available_run_mm:3556}, 'metric');
  assert.equal(metric.effective_tread, 254);
  assert.equal(metric.stair_angle_deg, 35.75);
});

test('centered ridge correction uses horizontal run; totals round once', () => {
  assert.equal(rafter({building_width_ft:24,ridge_thickness_in:1.5,pitch_method:'pitch',given_pitch:6}, 'imperial').rafter_length_ft, 13.35);
  assert.equal(rafter({overhang_ft:1}, 'imperial').total_rafter_ft, 14.53);
});

test('specified gate splits the fence into independently spaced runs', () => {
  const result = fence({fence_length_ft:100,post_spacing_ft:8,gate_layout_ft:'24x4'}, 'imperial');
  assert.equal(result.sections,12);
  assert.equal(result.posts,14);
});

test('both rebar calculators use independent direction counts', () => {
  for (const calc of [rebar,slabRebar]) {
    const grid = calc({length_ft:10,width_ft:8,spacing:12,cross_spacing_in:24}, 'imperial');
    assert.equal(grid.rows,11);
    assert.equal(grid.columns,5);
  }
});

test('metal end lap can require another panel row on a single slope', () => {
  const panels = metal({length_ft:6,width_ft:24,roof_shape:'shed',pitch:'0',panel_length_ft:12,panel_cover_in:36,end_lap_in:6}, 'imperial');
  assert.equal(panels.panel_rows,3);
  assert.equal(panels.panels,6);
});

test('rooms and openings combined before box rounding or concrete depth', () => {
  assert.equal(flooring({length_m:2,width_m:2,sections_m:'2x3, -1x1',box_coverage_m2:3,waste_pct:0}, 'metric').boxes,3);
  assert.equal(slab({length_ft:4,width_ft:4,sections_ft:'2x3, -1x1',thickness:6}, 'imperial').cubic_feet,10.5);
});

test('invalid rectangles and excess deductions are reported', () => {
  const fields = flooringCalculator.inputs;
  const defaults = Object.fromEntries(fields.filter(f=>f.onlyIn !== 'metric').map(f=>[f.id,f.defaultValue]));
  for(const sections_ft of ['2x', '-100x100', '2x0']) {
    assert.ok(validateInputs(fields,{...defaults,sections_ft},'imperial').errors.sections_ft);
  }
});
import { formula as studs } from '../src/calculators/stud-calculator';
import { formula as retaining } from '../src/calculators/retaining-wall-calculator';
import { formula as wood } from '../src/calculators/board-foot-calculator';
import { formula as drain } from '../src/calculators/french-drain-calculator';
import { formula as bags } from '../src/calculators/concrete-bags-calculator';

test('positioned opening displaces centers strictly inside its rough width', () => {
  const wall = studs({length_ft:12, spacing:'16', stud_openings_ft:'2x3'}, 'imperial');
  assert.equal(wall.field_studs,8);
});

test('additional retaining wall section is rounded to courses independently', () => {
  const wall = retaining({wall_length_ft:4,wall_height_ft:1,block_length:12,block_height:6,wall_parts_ft:'2x2'},'imperial');
  assert.equal(wall.blocks,18);
});

test('mixed stock and supplier rate keep dimensions and piece price separate', () => {
  const stock = wood({width_in:12, thickness_in:1, length_ft:4, quantity:2,stock_list_ft:'2x6x8x3',price_mbf:1000},'imperial');
  assert.equal(stock.total_quantity,5);
  assert.equal(stock.board_feet,32);
  assert.equal(stock.price_per_piece,4);
});

test('pipe displacement includes every segment once', () => {
  const material = drain({length_m:2,width_m:1,depth_m:1,extra_parts_m:'1x2x1',gravel_method:'pipe',pipe_diameter_mm:200,waste_pct:0},'metric');
  assert.equal(material.gravel_cum,3.906);
  assert.equal(material.pipe_length_m,3);
});

test('known pour preserves purchase boundary', () => {
  const order = bags({pour_ft3:6,bag_size:'80lb',waste_pct:0},'imperial');
  assert.equal(order.net_bags,10);
});
import { formula as footings } from '../src/calculators/deck-footing-calculator';
import { formula as siding } from '../src/calculators/siding-calculator';
import { projectHandoffs } from '../src/calculators/project-handoffs';

test('deck plan coordinates take priority and retain exact pour for bag transfer', () => {
  const result = footings({plan_points_ft:'0x0, 2x1, 4x0',plan_footings:9,footing_diameter:12,footing_depth:12},'imperial');
  assert.equal(result.footings,3);
  assert.equal(result.net_volume,3*Math.PI/4);
  const [link] = projectHandoffs('deck-footing-calculator',{},result,'imperial');
  assert.equal(Number(new URL(link.href,'https://buildbymath.com').searchParams.get('pour_ft3')),result.net_volume);
});

test('siding last course handles a partial course and an exact multiple', () => {
  assert.equal(siding({height_ft:9,exposure_in:5},'imperial').last_course,3);
  assert.equal(siding({height_m:2,exposure_mm:100},'metric').last_course,100);
});

test('flooring passes product dimensions and net tile area', () => {
  const [link] = projectHandoffs('flooring-calculator',{tile_length_mm:600,tile_width_mm:300},{area_sqft:108,area_sqm:10},'metric');
  const params = new URL(link.href,'https://buildbymath.com').searchParams;
  assert.equal(params.get('tile_width_mm'),'300');
  assert.equal(params.get('tile_length_mm'),'600');
  assert.equal(params.get('area_sqm'),'10');
});
