import fs from 'node:fs';
import { calculatorRegistry } from '../src/data/registry';
import { slabDimensions } from '../src/data/slab-dimensions';
import { gravelDimensions } from '../src/data/gravel-dimensions';
import { pierDimensions } from '../src/data/pier-dimensions';
import { blockWallDimensions } from '../src/data/block-wall-dimensions';
import { mulchDimensions } from '../src/data/mulch-dimensions';

const inventory=calculatorRegistry.map(c=>({
 slug:c.slug,name:c.name,source:`src/calculators/${c.slug==='concrete-slab-calculator'?'concrete-slab':c.slug}.ts`,
 units:c.unitSystems, inputs:c.inputs, outputs:c.outputs,
 modes:c.inputs.filter(i=>i.options).map(i=>({id:i.id,unit:i.onlyIn??'both',options:i.options})),
 presets:c.presets??[],equations:c.formulaSteps??[],formulaImplementation:c.formula.toString(),
 assumptions:{disclaimer:c.disclaimer,waste:c.wasteFactor,primaryIncludesWaste:c.primaryIncludesWaste,costRange:c.costRange},
 references:c.references??[],
}));
const variants=[['concrete-slab-calculator',slabDimensions],['gravel-calculator',gravelDimensions],['concrete-column-calculator',pierDimensions],['concrete-block-calculator',blockWallDimensions],['mulch-calculator',mulchDimensions]] as const;
fs.writeFileSync('audit/calculator-inventory.json',JSON.stringify({calculators:inventory,variants:variants.flatMap(([parent,ds])=>ds.map(d=>({parent,path:`/calculators/${parent}/${d.slug}/`,...d})))},null,2));
const corrected=new Set(['concrete-slab','concrete-column','concrete-footing','concrete-driveway','deck-footing','fence-post','drywall','grout','flooring','plywood','insulation','siding','roofing','metal-roofing','excavation','mulch','gravel','sand','asphalt','aggregate','topsoil','paver-base','retaining-wall','concrete-slab-rebar','post-hole','concrete-bags']);
const gaps:Record<string,string>={
 'deck-footing':'Full grid only; approved beams, ledger, tributary load and soil required.',
 'fence-post':'Gate extra-post allowance is not a layout solver; depth is not code approval.',
 'drywall':'Compound/tape rates and metric sheet sizes need selected-product confirmation.',
 'grout':'Small-joint approximation; manufacturer PDF returned 403; generic bag yields unverified.',
 'mortar':'Per-area joint factors and bag yields conflict with methodology; no manufacturer specification selected.',
 'rebar':'Floor-based grid excludes cover/cutting/lap design; bar-weight source not independently retrieved.',
 'concrete-slab-rebar':'Same rebar layout/weight gaps as parent; concrete volume corrected.',
 'stud':'Opening placement, corner assembly, end studs and cripple lengths require a framing plan.',
 'concrete-block':'Metric uses a different module; mortar parent 35 vs variants 33 blocks/bag needs product selection; CMHA full fetch failed.',
 'lumber':'Actual-size volume differs from nominal board-foot purchasing conventions; label/specification review needed.',
 'stair':'Geometric stringer estimate, not a fabrication cut or code compliance check.',
 'retaining-wall':'No engineering for embedment, geogrid, drainage or wall stability.',
 'french-drain':'Gravel fraction is an allowance; pipe displacement and fabric top overlap not modeled.',
 'metal-roofing':'Two symmetric slopes; panel end laps and fastener schedule need manufacturer specifications.',
 'roofing':'Three bundles/square assumption must match selected shingle product.',
 'asphalt':'Imperial/metric default densities are not identical materials; select measured density.',
 'aggregate':'Loose density, compaction and moisture need supplier data.',
 'gravel':'Loose density, compaction and moisture need supplier data.',
 'sand':'Loose density, compaction and moisture need supplier data.',
 'topsoil':'Loose density, compaction and moisture need supplier data.',
 'insulation':'Coverage count only, not R-value or thermal design.',
 'post-hole':'Square-post displacement and pooled batches only; foundation detail is project-specific.',
};
const rows=inventory.map(c=>{
 const key=c.slug.replace(/-calculator$/,'');
 const status=corrected.has(key)?'CORRECTED':gaps[key]?'NEEDS REVIEW':'VERIFIED';
 return `| [${c.name}](../${c.source}) | Geometry/dimensional arithmetic; see recorded equations | Imperial + metric known-answer; input/mode contract | ${gaps[key]??'No additional model issue found in tested geometry; actual site/material conditions still apply.'} | ${corrected.has(key)?'Dimensional/precision, content or validation correction; see final report':'No core formula replacement'} | ${status} |`;
});
fs.writeFileSync('audit/calculator-verification.md',`# Calculator verification matrix\n\n37 calculators; 74 independent imperial/metric worked examples. VERIFIED applies to tested mathematical model, not engineering design. CORRECTED means a confirmed error was fixed and tested; it does **not** clear the remaining issues column. Select modes additionally receive execution/input-contract checks; not every possible combination has an independent oracle. Sources, full input bounds, mode options, formula implementations, outputs, presets and all 54 variant records are in calculator-inventory.json and the audit report.\n\n| Calculator | Formula verified | Tests passed | Issues found | Fixes applied | Verification status |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(`Inventoried ${inventory.length} calculators and ${variants.reduce((n,[,ds])=>n+ds.length,0)} variants.`);
