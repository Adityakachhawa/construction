import { dimensionRows } from './dimension-rows';
import { rectangleAreas } from './project-sections';
import type { CalculatorInputMap, InputField, UnitSystem } from './_types';

export const integerFields = new Set(['quantity', 'columns', 'count', 'num_holes', 'num_walls', 'plan_footings', 'walls', 'gates', 'openings']);

/** Validate user input before calculation; raw formula functions accept trusted inputs. */
export function validateInputs(fields: InputField[], values: Record<string, unknown>, unit: UnitSystem) {
  const inputs: CalculatorInputMap = {};
  const errors: Record<string, string> = {};
  for (const field of fields.filter(f => !f.onlyIn || f.onlyIn === unit)) {
    const raw = values[field.id];
    // Optional material data cannot prevent the independent base quantity calculation.
    if (field.advanced) {
      inputs[field.id] = typeof raw === "number" || typeof raw === "string" ? raw : field.defaultValue;
      continue;
    }
    const empty = raw === undefined || raw === null || raw === '';
    if (empty && !field.required) {
      inputs[field.id] = field.defaultValue;
      continue;
    }
    if (field.type === 'dimensions') {
      const rows = dimensionRows(raw);
      if (String(raw).length > 500 || rows.some(row => row.length !== field.columns || row.some(n => !Number.isFinite(n) || n <= 0 || n > 100000))) errors[field.id] = 'Use the dimensions in the field label, separated by x.';
      else if (field.id.startsWith('stock_list') && rows.some(row => !Number.isInteger(row[3]))) errors[field.id] = 'Board count must be a whole number.';
      else inputs[field.id] = String(raw);
      continue;
    }
    if (field.type === 'pairs') {
      if (String(raw).length > 500 || !/^\s*\d+(?:\.\d+)?\s*[xX]\s*\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?\s*[xX]\s*\d+(?:\.\d+)?)*\s*$/.test(String(raw))) errors[field.id] = 'Enter each start x width in order.';
      else inputs[field.id] = String(raw);
      continue;
    }
    if (field.type === 'rectangles') {
      const areas = rectangleAreas(raw);
      if (String(raw).length > 500 || areas.some(area => !Number.isFinite(area))) errors[field.id] = 'Enter rectangles as 4x5, -2x3 using positive dimensions.';
      else inputs[field.id] = String(raw);
      continue;
    }
    if (field.type === 'select' || field.type === 'radio') {
      if (!field.options?.some(o => o.value === String(raw))) errors[field.id] = `${field.label}: choose a listed option.`;
      else inputs[field.id] = String(raw);
      continue;
    }
    const value = Number(raw);
    if (empty || !Number.isFinite(value)) errors[field.id] = `${field.label}: enter a finite number.`;
    else if (field.min !== undefined && value < field.min) errors[field.id] = `${field.label}: minimum ${field.min}.`;
    else if (field.max !== undefined && value > field.max) errors[field.id] = `${field.label}: maximum ${field.max}.`;
    else if (integerFields.has(field.id) && !Number.isInteger(value)) errors[field.id] = `${field.label}: enter a whole number.`;
    else inputs[field.id] = value;
  }
  // Post-hole geometric constraints: an actual square post must fit its cylinder.
  if ('post_width_in' in inputs || 'post_width_mm' in inputs) {
    const metric = unit === 'metric';
    const postId = metric ? 'post_width_mm' : 'post_width_in';
    const diameter = Number(inputs[metric ? 'diameter_mm' : 'diameter_in']);
    if (Number(inputs[postId]) * Math.SQRT2 >= diameter) errors[postId] = 'Post diagonal must be smaller than the hole diameter.';
    const gravelId = metric ? 'gravel_depth_mm' : 'gravel_depth_in';
    const depth = metric ? Number(inputs.depth_m) * 1000 : Number(inputs.depth_ft) * 12 + Number(inputs.depth_in ?? 0);
    if (Number(inputs[gravelId]) > depth) errors[gravelId] = 'Gravel base cannot exceed the hole depth.';
  }
  const sectionId = unit === 'imperial' ? 'sections_ft' : 'sections_m';
  if (inputs[sectionId]) {
    const dimension = (name: string) => unit === 'imperial'
      ? Number(inputs[name + '_ft'] ?? 0) + Number(inputs[name + '_in'] ?? 0) / 12
      : Number(inputs[name + '_m'] ?? 0);
    let base = dimension('length') * dimension('width');
    if ('num_walls' in inputs) base = dimension('wall_height') * dimension('wall_width') * Number(inputs.num_walls);
    if (inputs.shape === 'triangle') base = dimension('base') * dimension('height') / 2;
    if (inputs.shape === 'circle') base = Math.PI * dimension('radius') ** 2;
    if (inputs.shape === 'square') base = dimension('side') ** 2;
    if (base + rectangleAreas(inputs[sectionId]).reduce((sum, area) => sum + area, 0) < 0) errors[sectionId] = 'Opening area exceeds the combined area.';
  }
  const insetKey = unit === 'imperial' ? 'edge_inset_in' : 'edge_inset_mm';
  if (Number(inputs[insetKey]) > 0) {
    const dim = (key: string) => unit === 'imperial' ? Number(inputs[key + '_ft']) * 12 + Number(inputs[key + '_in'] || 0) : Number(inputs[key + '_m']) * 1000;
    if (2 * Number(inputs[insetKey]) >= Math.min(dim('length'),dim('width'))) errors[insetKey] = 'The two edge insets must leave a positive grid dimension.';
  }
  const gateKey = unit === 'metric' ? 'gate_layout_m' : 'gate_layout_ft';
  if (inputs[gateKey]) {
    const run = unit === 'metric' ? Number(inputs.fence_length_m) : Number(inputs.fence_length_ft) + Number(inputs.fence_length_in) / 12;
    let end = -1;
    for (const pair of String(inputs[gateKey]).split(',')) {
      const [start, width] = pair.trim().split(/[xX]/).map(Number);
      if (start <= end || width <= 0 || start + width > run) errors[gateKey] = 'Gate openings must be ordered, separated and inside the run.';
      end = start + width;
    }
  }
  const pointKey = unit === 'imperial' ? 'plan_points_ft' : 'plan_points_m';
  if (inputs[pointKey]) {
    const dim = (key: string) => unit === 'metric' ? Number(inputs[key + '_m']) : Number(inputs[key + '_ft']) + Number(inputs[key + '_in'] || 0)/12;
    const points = dimensionRows(inputs[pointKey]);
    if (new Set(points.map(point => point.join(','))).size !== points.length || points.some(([x,y]) => x > dim('deck_length') || y > dim('deck_width'))) errors[pointKey] = 'Enter distinct positions inside the deck footprint.';
  }
  const openingKey = unit === 'imperial' ? 'stud_openings_ft' : 'stud_openings_m';
  if (inputs[openingKey]) {
    const length = unit === 'imperial' ? Number(inputs.length_ft) + Number(inputs.length_in || 0)/12 : Number(inputs.length_m);
    let previousEnd = 0;
    for (const [start, width] of dimensionRows(inputs[openingKey])) {
      if (start < previousEnd || width <= 0 || start + width > length) errors[openingKey] = 'Openings must fit inside the wall in order without overlap.';
      previousEnd = start + width;
    }
  }
  if ('box_coverage' in inputs || 'box_coverage_m2' in inputs) {
    const metric = unit === 'metric';
    for (const side of ['length','width']) {
      const key = 'tile_' + side + (metric ? '_mm' : '_in');
      if (Number(inputs[key]) > 0 && Number(inputs[key]) < (metric ? 25 : 1)) errors[key] = 'Use a supported tile size or leave the optional dimension at zero.';
    }
  }
  const metricUnits = unit === 'metric';
  if ('ridge_thickness_in' in inputs || 'ridge_thickness_mm' in inputs) {
    const width = Number(metricUnits ? inputs.building_width_m : inputs.building_width_ft);
    const ridgeKey = metricUnits ? 'ridge_thickness_mm' : 'ridge_thickness_in';
    if (width > 0 && Number(inputs[ridgeKey]) >= width * (metricUnits ? 1000 : 12)) errors[ridgeKey] = 'Ridge thickness must be less than building width.';
  }
  if ('opening_area_ft' in inputs || 'opening_area_m' in inputs) {
    const length = metricUnits ? Number(inputs.length_m) : Number(inputs.length_ft) + Number(inputs.length_in || 0) / 12;
    const height = metricUnits ? Number(inputs.height_m) : Number(inputs.height_ft) + Number(inputs.height_in || 0) / 12;
    const key = metricUnits ? 'opening_area_m' : 'opening_area_ft';
    if (Number(inputs[key]) > length * height) errors[key] = 'Opening area exceeds gross wall area.';
  }
  if (inputs.gravel_method === 'pipe') {
    const metric = unit === 'metric';
    const pipe = metric ? Number(inputs.pipe_diameter_mm) / 1000 : Number(inputs.pipe_diameter_in) / 12;
    const width = metric ? Number(inputs.width_m) : Number(inputs.width_ft) + Number(inputs.width_in) / 12;
    const depth = metric ? Number(inputs.depth_m) : Number(inputs.depth_ft) + Number(inputs.depth_in) / 12;
    const other = dimensionRows(inputs[metric ? 'extra_parts_m':'extra_parts_ft']);
    if (pipe > Math.min(width, depth) || other.some(([,w,d]) => pipe > Math.min(w,d))) errors[metric ? 'pipe_diameter_mm' : 'pipe_diameter_in'] = 'Pipe outside diameter exceeds the trench width or depth.';
  }
  if ('roof_shape' in inputs) {
    const metric = unit === 'metric';
    const lapId = metric ? 'end_lap_mm' : 'end_lap_in';
    const length = metric ? Number(inputs.panel_length_m) * 1000 : Number(inputs.panel_length_ft) * 12 + Number(inputs.panel_length_in);
    if (Number(inputs[lapId]) >= length) errors[lapId] = 'End lap must be shorter than the panel.';
  }
  return { inputs, errors, valid: Object.keys(errors).length === 0 };
}
