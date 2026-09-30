export interface RebarSize {
  id: string;
  name: string;
  diameter_in: number;
  weight_lb_per_ft: number;
  metric_name: string;
  diameter_mm: number;
  weight_kg_per_m: number;
}

export const REBAR_SIZES: Record<string, RebarSize> = {
  '3': {
    id: '3',
    name: '#3 (3/8")',
    diameter_in: 0.375,
    weight_lb_per_ft: 0.376,
    metric_name: 'No. 10',
    diameter_mm: 9.5,
    weight_kg_per_m: 0.560,
  },
  '4': {
    id: '4',
    name: '#4 (1/2")',
    diameter_in: 0.500,
    weight_lb_per_ft: 0.668,
    metric_name: 'No. 13',
    diameter_mm: 12.7,
    weight_kg_per_m: 0.994,
  },
  '5': {
    id: '5',
    name: '#5 (5/8")',
    diameter_in: 0.625,
    weight_lb_per_ft: 1.043,
    metric_name: 'No. 16',
    diameter_mm: 15.9,
    weight_kg_per_m: 1.552,
  },
};

export const REBAR_SIZE_OPTIONS_IMPERIAL = Object.values(REBAR_SIZES).map(s => ({
  value: s.id,
  label: `${s.name} - ${s.weight_lb_per_ft.toFixed(3)} lb/ft`,
}));

export const REBAR_SIZE_OPTIONS_METRIC = Object.values(REBAR_SIZES).map(s => ({
  value: s.id,
  label: `${s.metric_name} (${s.diameter_mm.toFixed(1)} mm) - ${s.weight_kg_per_m.toFixed(3)} kg/m`,
}));
