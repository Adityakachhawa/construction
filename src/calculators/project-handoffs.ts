import { dimensionRows } from './dimension-rows';
import type { CalculatorInputMap, CalculatorOutputMap, UnitSystem } from './_types';

export function projectHandoffs(slug: string, inputs: CalculatorInputMap, results: CalculatorOutputMap, unit: UnitSystem) {
  const links: {href:string; label:string}[] = [];
  const add = (calculator: string, label: string, values: CalculatorInputMap) => {
    const params = new URLSearchParams({ unit });
    for (const [key, value] of Object.entries(values)) params.set(key, String(value));
    links.push({href:'/calculators/' + calculator + '/?' + params, label});
  };
  if (slug === 'fence-post-calculator' && results.posts <= 500) {
    add('post-hole-calculator', 'Estimate concrete for these ' + results.posts + ' holes', {num_holes: results.posts});
  }
  if (slug === 'roof-pitch-calculator') add('rafter-calculator', 'Use these roof measurements in Rafter', inputs);
  if (slug === 'roof-pitch-calculator' || slug === 'rafter-calculator') {
    add('roofing-calculator', 'Use this pitch for shingle quantities', {pitch:'custom', custom_pitch:results.pitch_ratio});
    add('metal-roofing-calculator', 'Use this pitch for metal panels', {pitch:'custom', custom_pitch:results.pitch_ratio});
  }
  if (slug === 'stud-calculator') {
    const unitKey = unit === 'metric' ? 'm' : 'ft';
    const suffixes = unit === 'metric' ? ['m'] : ['ft','in'];
    const drywall: CalculatorInputMap = {num_walls:1};
    const insulation: CalculatorInputMap = {};
    for (const suffix of suffixes) {
      drywall['wall_height_' + suffix] = inputs['height_' + suffix];
      drywall['wall_width_' + suffix] = inputs['length_' + suffix];
      insulation['length_' + suffix] = inputs['length_' + suffix];
      insulation['width_' + suffix] = inputs['height_' + suffix];
    }
    const opening = (name: string) => Number(inputs['opening_' + name + '_' + unitKey]) + (unit === 'imperial' ? Number(inputs['opening_' + name + '_in'] || 0) / 12 : 0);
    const width = opening('width'), height = opening('height');
    const positioned = dimensionRows(inputs['stud_openings_' + unitKey]);
    const openingWidth = positioned.length ? positioned.reduce((sum, [, w]) => sum + w, 0) : width * Number(inputs.openings);
    if (openingWidth > 0 && height > 0) {
      drywall['sections_' + unitKey] = insulation['sections_' + unitKey] = '-' + openingWidth + 'x' + height;
    }
    add('drywall-calculator','Estimate drywall for this wall',drywall);
    add('insulation-calculator','Estimate insulation for this wall',insulation);
  }
  if (slug === 'concrete-block-calculator') {
    const values = Object.fromEntries(Object.entries(inputs).filter(([key]) => /^(length_|height_|opening_area_)/.test(key)));
    add('mortar-calculator', 'Use this net wall area in Mortar', {...values, unit_type:'3/8in_block'});
  }
  if (slug === 'flooring-calculator' && results.area_sqft > 0) {
    const key = unit === 'metric' ? 'area_sqm' : 'area_sqft';
    const tile: CalculatorInputMap = { [key]: results[key] };
    for (const side of ['length','width']) {
      const dimension = 'tile_' + side + (unit === 'metric' ? '_mm':'_in');
      if (Number(inputs[dimension]) > 0) tile[dimension] = inputs[dimension];
    }
    add('grout-calculator', 'Estimate tile grout for this floor area', tile);
  }
  if (['concrete-slab-calculator','concrete-driveway-calculator','concrete-column-calculator','concrete-footing-calculator','deck-footing-calculator'].includes(slug)) {
    const volume = results.net_volume ?? (unit === 'metric' ? results.cubic_meters : results.cubic_feet);
    if (volume > 0) add('concrete-bags-calculator', 'Choose a bag yield for this net pour volume', { [unit === 'metric' ? 'pour_m3':'pour_ft3']:volume });
  }
  return links;
}
