const fs = require('fs');

let l = fs.readFileSync('D:/construction/src/calculators/lumber-calculator.ts', 'utf8');
l = l.replace(/defaultValue: 3\.5,\s*onlyIn: 'imperial',/g, "defaultValue: 3.5,\n        required: true,\n        onlyIn: 'imperial',");
l = l.replace(/defaultValue: 89,\s*onlyIn: 'metric',/g, "defaultValue: 89,\n        required: true,\n        onlyIn: 'metric',");
fs.writeFileSync('D:/construction/src/calculators/lumber-calculator.ts', l);

let r = fs.readFileSync('D:/construction/src/calculators/retaining-wall-calculator.ts', 'utf8');
r = r.replace(/id: 'gravel_depth_mm',\s*label: 'Gravel Depth',\s*type: 'number',\s*unit: 'mm',\s*min: 0,\s*max: 600,\s*step: 25,\s*defaultValue: 150,\s*required: true,\s*onlyIn: 'metric',/g, "id: 'gravel_depth_mm',\n        label: 'Gravel Depth',\n        type: 'number',\n        unit: 'mm',\n        min: 0,\n        max: 600,\n        step: 25,\n        defaultValue: 150,\n        onlyIn: 'metric',");
fs.writeFileSync('D:/construction/src/calculators/retaining-wall-calculator.ts', r);

console.log('Fixed lumber and retaining wall');
