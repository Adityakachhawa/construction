import type { CalculatorInputMap, InputField, UnitSystem } from './_types';

export const integerFields = new Set(['quantity', 'columns', 'count', 'num_holes', 'num_walls', 'walls', 'gates', 'openings']);

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
  return { inputs, errors, valid: Object.keys(errors).length === 0 };
}
