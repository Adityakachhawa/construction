import type { CalculatorInputMap, InputField } from './_types';
import { ceilQuantity } from './rounding';
const numberField = (id: string, label: string, unit: string): InputField => ({id, label, unit, type:'number', defaultValue:'', advanced:true, min:0, helpText:'Use the selected product specification; no default is assumed.'});
export const blockMortarInputs: InputField[] = /* @__PURE__ */ (() => [
 {id:'mortar_mode',label:'Mortar calculation method',type:'select',defaultValue:'none',advanced:true,options:[{value:'none',label:'No product specifications yet'},{value:'coverage',label:'Manufacturer blocks per bag'},{value:'yield',label:'Mixed yield and verified consumption per block'}],helpText:'Mortar only, not core grout or tile grout. Coverage must match the entered bag and masonry conditions. Advanced dimensions use mm and volumes use liters in both unit systems.'},
 {...numberField('mortar_bag_mass','Selected bag mass',''), helpText:'Coverage or mixed yield must be for this bag mass. Changing mass does not automatically rescale your supplied coverage.'},
 {id:'mortar_bag_unit',label:'Bag mass unit',type:'select',defaultValue:'',advanced:true,options:[{value:'',label:'Select unit'},{value:'lb',label:'lb'},{value:'kg',label:'kg'}]},
 numberField('mortar_block_length','Actual block length','mm'),numberField('mortar_block_height','Actual block height','mm'),numberField('mortar_block_width','Actual block width','mm'),numberField('mortar_joint','Mortar joint thickness','mm'),
 {id:'mortar_bedding',label:'Bedding used for supplied coverage',type:'select',defaultValue:'',advanced:true,options:[{value:'',label:'Select bedding'},{value:'face-shell',label:'Face-shell bedding'},{value:'full',label:'Full bedding'},{value:'specified',label:'Other documented bedding'}],helpText:'Block counts retain nominal 8x16-inch imperial or 200x400-mm metric faces. Use product data matching that module. Actual dimensions and bedding record coverage conditions; they do not recalculate blocks or infer mortar volume.'},
 numberField('mortar_blocks_per_bag','Manufacturer coverage (coverage method)','blocks/bag'),
 numberField('mortar_yield_l','Verified mixed yield (yield method)','L/bag'),
 numberField('mortar_per_block_l','Verified consumption for these joints/bedding (yield method)','L/block'),
 {id:'mortar_waste_pct',label:'Additional mortar allowance',type:'number',unit:'%',defaultValue:0,min:0,max:100,advanced:true,helpText:'0 means no additional allowance. Coverage is applied to the block order, which already includes block waste. Avoid counting supplier waste twice.'},
])();
/** No coverage is inferred from bag mass, block size or bedding. */
export function blockMortar(blocks: number, inputs: CalculatorInputMap) {
 const positive=(key:string)=>Number.isFinite(Number(inputs[key])) && Number(inputs[key])>0;
 const missing={mortar_bags:0,mortar_ready:0};
 if(!Number.isFinite(blocks)||blocks<0||!['coverage','yield'].includes(String(inputs.mortar_mode))) return missing;
 if(!['lb','kg'].includes(String(inputs.mortar_bag_unit))||!['face-shell','full','specified'].includes(String(inputs.mortar_bedding))) return missing;
 if(!['mortar_bag_mass','mortar_block_length','mortar_block_height','mortar_block_width','mortar_joint'].every(positive))return missing;
 const waste=inputs.mortar_waste_pct===''?0:Number(inputs.mortar_waste_pct??0);
 if(!Number.isFinite(waste)||waste<0||waste>100)return missing;
 let demand: number;
 if(inputs.mortar_mode==='coverage'){
  if(!positive('mortar_blocks_per_bag'))return missing;
  demand=blocks/Number(inputs.mortar_blocks_per_bag);
 }else{
  if(!positive('mortar_yield_l')||!positive('mortar_per_block_l'))return missing;
  demand=blocks*Number(inputs.mortar_per_block_l)/Number(inputs.mortar_yield_l);
 }
 demand*=1+waste/100;
 if(!Number.isFinite(demand)||demand>Number.MAX_SAFE_INTEGER)return missing;
 return {mortar_bags:ceilQuantity(demand),mortar_ready:1};
}
