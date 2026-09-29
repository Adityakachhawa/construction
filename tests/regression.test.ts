import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { formulaRegistry } from '../src/calculators/client-registry';

describe('Category B: Formula Regression Tests (Domain & Mathematical Correctness)', () => {
  const f = formulaRegistry;

  test('Concrete Slab Calculator (Math)', () => {
    const res = f['concrete-slab-calculator']({ length_ft: 10, width_ft: 10, thickness: 4 }, 'imperial');
    console.log('SLAB YARDS:', res['cubic_yards']);
    assert.ok(Math.abs(res['cubic_yards'] - 1.234) < 0.01);
  });

  test('Gravel Calculator (1.4 tons/yd3)', () => {
    const res = f['gravel-calculator']({ length_ft: 10, width_ft: 10, depth: 12 }, 'imperial');
    console.log('GRAVEL TONS:', res['tons']);
    assert.ok(Math.abs(res['tons'] - 5.185) < 0.01);
  });

  test('Mulch Calculator', () => {
    const res = f['mulch-calculator']({ length_ft: 10, width_ft: 10, depth: 3 }, 'imperial');
    assert.ok(Math.abs(res['cubic_yards'] - 0.926) < 0.01);
  });

  test('Sand Calculator (1.35 tons/yd3)', () => {
    const res = f['sand-calculator']({ length_ft: 10, width_ft: 10, depth: 12 }, 'imperial');
    assert.ok(Math.abs(res['tons'] - 5.0) < 0.01); 
  });

  test('Fence Post Calculator', () => {
    const res = f['fence-post-calculator']({ fence_length_ft: 100, post_spacing_ft: 8, gates: 2, post_depth: 24 }, 'imperial');
    assert.strictEqual(res['posts'], 16);
  });

  test('Deck Footing Calculator', () => {
    const res = f['deck-footing-calculator']({ deck_length_ft: 10, deck_width_ft: 10, footing_spacing_ft: 8, footing_depth: 36, footing_diameter: 12 }, 'imperial');
    assert.ok(res['footings'] >= 2);
  });

  test('Retaining Wall Calculator', () => {
    const res = f['retaining-wall-calculator']({ wall_length_ft: 10, wall_height_ft: 3, block_length: 16, block_height: 8, block_depth: 8 }, 'imperial');
    assert.strictEqual(res['blocks'], 44);
  });

  test('Paver Base Calculator', () => {
    const res = f['paver-base-calculator']({ length_ft: 10, width_ft: 10, base_depth: 6, sand_depth: 1 }, 'imperial');
    assert.ok(Math.abs(res['gravel_cubic_yards'] - 1.85) < 0.05);
  });

  test('Rebar Calculator', () => {
    const res = f['rebar-calculator']({ length_ft: 10, width_ft: 10, spacing: 18, waste_pct: 0 }, 'imperial');
    assert.ok(res['linear_ft'] > 100); 
  });

  test('Drywall Calculator', () => {
    const res = f['drywall-calculator']({ wall_height_ft: 10, wall_width_ft: 10, num_walls: 4, sheet_size: '32' }, 'imperial');
    assert.strictEqual(res['sheets_net'], 13);
  });

  test('Asphalt Calculator (2.025 tons/yd3)', () => {
    const res = f['asphalt-calculator']({ length_ft: 10, width_ft: 10, thickness: 2 }, 'imperial');
    assert.ok(Math.abs(res['tons'] - 1.25) < 0.05);
  });

  test('Flooring Calculator', () => {
    const res = f['flooring-calculator']({ length_ft: 10, width_ft: 10, box_coverage: 20 }, 'imperial');
    assert.strictEqual(res['boxes'], 6); // 100 sqft + waste -> 6 boxes usually
  });

  test('Concrete Column Calculator', () => {
    const res = f['concrete-column-calculator']({ diameter_in: 12, height_ft: 10, columns: 1 }, 'imperial');
    assert.ok(Math.abs(res['cubic_feet'] - 7.854) < 0.01);
  });

  test('Topsoil Calculator', () => {
    const res = f['topsoil-calculator']({ length_ft: 10, width_ft: 10, depth: 6 }, 'imperial');
    assert.ok(Math.abs(res['cubic_yards'] - 1.85) < 0.05); 
  });

  test('Aggregate Calculator', () => {
    const res = f['aggregate-calculator']({ length_ft: 10, width_ft: 10, depth: 12 }, 'imperial');
    assert.ok(typeof res['tons'] === 'number' && res['tons'] > 0);
  });

  test('Concrete Block Calculator', () => {
    const res = f['concrete-block-calculator']({ length_ft: 10, height_ft: 3, waste_pct: 0 }, 'imperial');
    assert.strictEqual(res['blocks'], 34); // approx 34 blocks per 30 sq ft
  });

  test('Concrete Driveway Calculator', () => {
    const res = f['concrete-driveway-calculator']({ length_ft: 10, width_ft: 10, thickness: 4 }, 'imperial');
    assert.ok(Math.abs(res['cubic_yards'] - 1.234) < 0.01);
  });

  test('Concrete Footing Calculator', () => {
    const res = f['concrete-footing-calculator']({ length_ft: 10, width_ft: 1, depth_ft: 1, depth_in: 0, count: 1 }, 'imperial');
    assert.strictEqual(res['cubic_feet'], 10);
  });

  test('Plywood Calculator', () => {
    const res = f['plywood-calculator']({ length_ft: 10, width_ft: 10, sheet_size: '32', waste_pct: 0 }, 'imperial');
    assert.strictEqual(res['sheets_net'], 4);
  });

  test('Stud Calculator', () => {
    const res = f['stud-calculator']({ length_ft: 10, height_ft: 8, spacing: 16 }, 'imperial');
    assert.ok(res['total_studs'] >= 8);
  });

  test('Roof Pitch Calculator', () => {
    const res = f['roof-pitch-calculator']({ rise_ft: 0, rise_in: 6, run_ft: 12, run_in: 0 }, 'imperial');
    assert.ok(typeof res['angle_deg'] === 'number' && res['angle_deg'] > 0);
  });

  test('Roofing Calculator', () => {
    const res = f['roofing-calculator']({ length_ft: 10, width_ft: 10, pitch: '6', waste_pct: 0 }, 'imperial');
    assert.ok(Math.abs(res['roof_area_sqft'] - 111.8) < 0.1);
  });

  test('Rafter Calculator', () => {
    const res = f['rafter-calculator']({ rise_ft: 6, run_ft: 12, overhang_ft: 0 }, 'imperial');
    assert.ok(Math.abs(res['rafter_length_ft'] - 13.416) < 0.1);
  });

  test('Metal Roofing Calculator', () => {
    const res = f['metal-roofing-calculator']({ length_ft: 10, width_ft: 10, pitch: '6', panel_cover_in: 36, waste_pct: 0 }, 'imperial');
    assert.ok(Math.abs(res['roof_area_sqft'] - 111.8) < 0.1);
  });

  test('Lumber Calculator', () => {
    const res = f['lumber-calculator']({ lumber_size: 'custom', thickness_in: 2, width_in: 4, length_ft: 10, quantity: 10, waste_pct: 0 }, 'imperial');
    assert.ok(Math.abs(res['board_feet'] - 66.66) < 0.1);
  });

  test('Stair Calculator', () => {
    const res = f['stair-calculator']({ total_rise_ft: 9, total_rise_in: 0 }, 'imperial');
    assert.strictEqual(res['risers'], 15);
  });

  test('Siding Calculator', () => {
    const res = f['siding-calculator']({ width_ft: 10, height_ft: 10, walls: 1 }, 'imperial');
    assert.strictEqual(res['gross_area_sqft'], 100);
  });

  test('Board Foot Calculator', () => {
    const res = f['board-foot-calculator']({ thickness_in: 2, width_in: 4, length_ft: 12, quantity: 1 }, 'imperial');
    assert.ok(Math.abs(res['board_feet'] - 8) < 0.01);
  });

  test('Excavation Calculator', () => {
    const res = f['excavation-calculator']({ length_ft: 10, width_ft: 10, depth_ft: 1, swell_pct: 20 }, 'imperial');
    assert.ok(Math.abs(res['expanded_yards'] - 4.44) < 0.01);
  });

  test('Square Footage Calculator', () => {
    const res = f['square-footage-calculator']({ shape: 'rectangle', length_ft: 10, width_ft: 10 }, 'imperial');
    assert.strictEqual(res['area_sqft'], 100);
  });

  test('French Drain Calculator', () => {
    const res = f['french-drain-calculator']({ length_ft: 100, width_ft: 1, depth_ft: 1, pipe_diameter_in: 4, waste_pct: 10 }, 'imperial');
    assert.strictEqual(res['pipe_length_ft'], 110);
  });

  test('Concrete Bags Calculator', () => {
    const res = f['concrete-bags-calculator']({ length_ft: 3, width_ft: 3, depth_ft: 3, depth_in: 0, bag_size: '80lb', waste_pct: 0 }, 'imperial');
    assert.strictEqual(res['net_bags'], 45); 
  });

  test('Insulation Calculator', () => {
    const res = f['insulation-calculator']({ length_ft: 10, width_ft: 10, coverage_sqft: 40 }, 'imperial');
    assert.strictEqual(res['area_sqft'], 100);
  });

  test('Mortar Calculator (Domain Assumption)', () => {
    const res = f['mortar-calculator']({ length_ft: 10, height_ft: 10 }, 'imperial');
    assert.ok(res['mortar_cuft'] > 0);
  });

  test('Grout Calculator (Domain Assumption)', () => {
    const res = f['grout-calculator']({ area_sqft: 100, tile_length_in: 12, tile_width_in: 12, joint_width_in: 0.125, tile_depth_in: 0.25 }, 'imperial');
    assert.ok(res['grout_cuft'] > 0);
  });

  test('Post Hole Calculator', () => {
    const res = f['post-hole-calculator']({ diameter_in: 12, depth_ft: 2, depth_in: 0, num_holes: 1 }, 'imperial');
    assert.ok(typeof res['concrete_cuft'] === 'number' && res['concrete_cuft'] > 0);
  });

  test('Concrete Slab + Rebar Calculator', () => {
    const res = f['concrete-slab-rebar-calculator']({ length_ft: 10, width_ft: 10, thickness: 4, spacing: 18 }, 'imperial');
    assert.ok(Math.abs(res['cubic_yards'] - 1.234) < 0.01);
  });
});
