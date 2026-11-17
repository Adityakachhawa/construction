/** Only independently orderable quantities belong in the shopping list. */
const purchases: Record<string, string> = {
  aggregate: 'cubic_yards', asphalt: 'tons', 'board-foot': 'board_feet',
  'concrete-bags': 'bags_required', 'concrete-block': 'blocks mortar_bags',
  'concrete-column': 'bags', 'concrete-driveway': 'cubic_yards', 'concrete-footing': 'cubic_yards',
  'concrete-slab': 'cubic_yards', 'concrete-slab-rebar': 'cubic_yards rebar_linear_ft',
  'deck-footing': 'bags', drywall: 'sheets_with_waste compound_gallons tape_linear_ft',
  'fence-post': 'posts', flooring: 'boxes', 'french-drain': 'gravel_cuyd pipe_length_ft fabric_sqft',
  gravel: 'cubic_yards', insulation: 'rolls_required', lumber: 'total_boards',
  'metal-roofing': 'panels fasteners', mulch: 'bags', 'paver-base': 'gravel_cubic_yards sand_cubic_yards',
  plywood: 'sheets_waste', 'post-hole': 'bags_required', rebar: 'linear_ft',
  'retaining-wall': 'blocks gravel_cubic_yards backfill_cubic_yards', roofing: 'bundles underlayment_sqft',
  sand: 'cubic_yards', siding: 'panels', topsoil: 'cubic_yards',
};

const metricPurchases: Record<string, string> = {
  cubic_yards: 'cubic_meters', compound_gallons: 'compound_liters', tape_linear_ft: 'tape_linear_m',
  gravel_cuyd: 'gravel_cum', pipe_length_ft: 'pipe_length_m', fabric_sqft: 'fabric_sqm',
  gravel_cubic_yards: 'gravel_cubic_meters', sand_cubic_yards: 'sand_cubic_meters',
  backfill_cubic_yards: 'backfill_cubic_meters', underlayment_sqft: 'underlayment_sqm', linear_ft: 'linear_m',
};

export function purchaseOutputs(slug: string, metric: boolean, customBag: boolean): Set<string> {
  const name = slug.replace(/-calculator$/, '');
  const ids = purchases[name]?.split(' ') ?? [];
  if (customBag && (name === 'mortar' || name === 'grout')) ids.push('bags_required');
  return new Set(ids.map(id => metric ? metricPurchases[id] ?? id : id));
}

export function isMeasurementSheet(slug: string) {
  return ['rafter', 'roof-pitch', 'stair', 'square-footage', 'stud'].includes(slug.replace(/-calculator$/, ''));
}
