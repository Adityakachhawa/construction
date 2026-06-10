export interface MaterialCost {
  id: string;
  name: string;
  unit: string;
  unitMetric: string;
  priceUSD: number;
  pricePerUnit: string;
  notes?: string;
}

export interface ConcreteMix {
  id: string;
  name: string;
  psi: number;
  bagWeightLbs: number;
  cubicFtPerBag: number;
  pricePerBag: number;
  useCase: string;
}

export const concreteMixes: ConcreteMix[] = [
  {
    id: 'standard-mix',
    name: 'Standard Mix (3000 PSI)',
    psi: 3000,
    bagWeightLbs: 80,
    cubicFtPerBag: 0.6,
    pricePerBag: 6.5,
    useCase: 'General slabs, sidewalks, patios',
  },
  {
    id: 'high-strength',
    name: 'High-Strength Mix (4000 PSI)',
    psi: 4000,
    bagWeightLbs: 80,
    cubicFtPerBag: 0.6,
    pricePerBag: 8.0,
    useCase: 'Footings, columns, structural supports',
  },
  {
    id: 'fast-setting',
    name: 'Fast-Setting Mix',
    psi: 4000,
    bagWeightLbs: 50,
    cubicFtPerBag: 0.375,
    pricePerBag: 7.5,
    useCase: 'Fence posts, mailboxes, quick pours',
  },
  {
    id: 'fiber-reinforced',
    name: 'Fiber-Reinforced Mix',
    psi: 4000,
    bagWeightLbs: 80,
    cubicFtPerBag: 0.6,
    pricePerBag: 9.5,
    useCase: 'Driveways, garage floors, crack resistance',
  },
];

export const materialCosts: MaterialCost[] = [
  {
    id: 'concrete-ready-mix',
    name: 'Ready-Mix Concrete',
    unit: 'cubic yard',
    unitMetric: 'cubic meter',
    priceUSD: 155,
    pricePerUnit: 'per cubic yard',
    notes: 'Delivery minimums and short-load fees may apply',
  },
  {
    id: 'rebar-3',
    name: 'Rebar #3 (3/8")',
    unit: 'linear foot',
    unitMetric: 'meter',
    priceUSD: 0.45,
    pricePerUnit: 'per linear foot',
  },
  {
    id: 'rebar-4',
    name: 'Rebar #4 (1/2")',
    unit: 'linear foot',
    unitMetric: 'meter',
    priceUSD: 0.72,
    pricePerUnit: 'per linear foot',
  },
  {
    id: 'rebar-5',
    name: 'Rebar #5 (5/8")',
    unit: 'linear foot',
    unitMetric: 'meter',
    priceUSD: 1.1,
    pricePerUnit: 'per linear foot',
  },
  {
    id: 'gravel-base',
    name: 'Crushed Stone / Gravel Base',
    unit: 'cubic yard',
    unitMetric: 'cubic meter',
    priceUSD: 48,
    pricePerUnit: 'per cubic yard',
  },
  {
    id: 'pressure-treated-4x4',
    name: 'Pressure-Treated 4x4 Post',
    unit: 'linear foot',
    unitMetric: 'meter',
    priceUSD: 2.1,
    pricePerUnit: 'per linear foot',
  },
  {
    id: 'pressure-treated-6x6',
    name: 'Pressure-Treated 6x6 Post',
    unit: 'linear foot',
    unitMetric: 'meter',
    priceUSD: 4.2,
    pricePerUnit: 'per linear foot',
  },
];

export function getConcreteMixById(id: string): ConcreteMix | undefined {
  return concreteMixes.find((m) => m.id === id);
}

export function getMaterialCostById(id: string): MaterialCost | undefined {
  return materialCosts.find((m) => m.id === id);
}
