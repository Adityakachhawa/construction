export type UnitSystem = 'imperial' | 'metric';

export type InputType = 'number' | 'select' | 'radio';

export interface SelectOption {
  value: string;
  label: string;
}

export interface InputField {
  id: string;
  label: string;
  type: InputType;
  unit?: string;
  unitMetric?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
  defaultValue: number | string;
  defaultValueMetric?: number | string;
  required?: boolean;
  helpText?: string;
  /** Only render this field when the given unit system is active */
  onlyIn?: UnitSystem;
  /** ID of the field to visually group with (ft+in pairs) */
  groupWith?: string;
}

export interface OutputField {
  id: string;
  label: string;
  unit?: string;
  unitMetric?: string;
  format: 'number' | 'currency' | 'area' | 'volume' | 'weight' | 'length';
  primary?: boolean;
  description?: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  /** Longer on-page intro paragraph — falls back to description if absent */
  intro?: string;
  h1: string;
  focusKeyword: string;
  ogImage?: string;
}

export interface SchemaConfig {
  appType: string;
  features: string[];
}

export type ProgrammaticType = 'location' | 'material' | 'preset';

export interface ProgrammaticConfig {
  type: ProgrammaticType;
  locations?: string[];
  presets?: Record<string, Record<string, number | string>>;
  contentStrategy: string;
}

export type CalculatorInputMap = Record<string, number | string>;
export type CalculatorOutputMap = Record<string, number>;

export interface FormulaStep {
  label: string;
  formula: string;
  description?: string;
}

export interface CalculatorFaqItem {
  question: string;
  answer: string;
}

// Imported here to keep _types.ts self-contained for formula modules.
// The actual slug union is defined in data/categories.ts.
import type { CategorySlug } from '../data/categories';

export interface CalculatorConfig {
  slug: string;
  name: string;
  category: CategorySlug;
  description: string;
  inputs: InputField[];
  outputs: OutputField[];
  formula: (inputs: CalculatorInputMap, unitSystem: UnitSystem) => CalculatorOutputMap;
  unitSystems: UnitSystem[];
  relatedCalculators: string[];
  seo: SeoConfig;
  schema: SchemaConfig;
  formulaSteps?: FormulaStep[];
  faq?: CalculatorFaqItem[];
  programmatic?: ProgrammaticConfig;
  /** Show the "order extra" callout on the results panel. Omit or false to hide. */
  orderCallout?: { hint?: string } | true;
  /** Default price per primary unit shown in the cost estimate widget. 0 = empty. */
  defaultPricePerUnit?: number;
  /** ISO date string — when the calculator was last reviewed/updated */
  lastUpdated?: string;
}
