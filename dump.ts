import { calculatorRegistry } from './src/data/registry';
import fs from 'fs';

const dump: any = {};
calculatorRegistry.forEach(calc => {
  dump[calc.slug] = {
    inputs: calc.inputs.filter(i => i.onlyIn !== 'metric').map(i => i.id),
    outputs: calc.outputs.map(i => i.id)
  };
});
fs.writeFileSync('C:\\Users\\Aditya Kachhawa\\.gemini\\antigravity-ide\\brain\\4ec8521f-cd80-47e1-ac91-1a3f26f8ed14\\scratch\\dump.json', JSON.stringify(dump, null, 2));
