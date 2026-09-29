const fs = require('fs');

let r = fs.readFileSync('D:/construction/src/calculators/retaining-wall-calculator.ts', 'utf8');
r = r.replace(/id: 'gravel_depth_mm',\s*label: 'Gravel Base Depth',\s*type: 'number',\s*unit: 'mm',\s*min: 50,\s*max: 600,\s*step: 25,\s*defaultValue: 150,\s*defaultValueMetric: 150,\s*required: true,\s*onlyIn: 'metric',/g, "id: 'gravel_depth_mm',\n        label: 'Gravel Base Depth',\n        type: 'number',\n        unit: 'mm',\n        min: 50,\n        max: 600,\n        step: 25,\n        defaultValue: 150,\n        defaultValueMetric: 150,\n        onlyIn: 'metric',");
fs.writeFileSync('D:/construction/src/calculators/retaining-wall-calculator.ts', r);

console.log('Fixed retaining wall');
