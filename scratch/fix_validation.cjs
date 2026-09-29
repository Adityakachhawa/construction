const fs = require('fs');

let content = fs.readFileSync('D:/construction/tests/calculators.test.ts', 'utf8');
content = content.replace("input.id === 'gravel_depth_in';", "input.id === 'gravel_depth_in' ||\n                input.id === 'gravel_depth_mm';");
fs.writeFileSync('D:/construction/tests/calculators.test.ts', content);

let lumber = fs.readFileSync('D:/construction/src/calculators/lumber-calculator.ts', 'utf8');
lumber = lumber.replace(/id: 'width_in',\n\s+label: 'Width',\n\s+type: 'number',\n\s+unit: 'in',\n\s+min: 0,\n\s+step: 0\.1,\n\s+onlyIn: 'imperial',/g, "id: 'width_in',\n      label: 'Width',\n      type: 'number',\n      unit: 'in',\n      min: 0,\n      step: 0.1,\n      required: true,\n      onlyIn: 'imperial',");
lumber = lumber.replace(/id: 'width_mm',\n\s+label: 'Width',\n\s+type: 'number',\n\s+unit: 'mm',\n\s+min: 0,\n\s+step: 1,\n\s+onlyIn: 'metric',/g, "id: 'width_mm',\n      label: 'Width',\n      type: 'number',\n      unit: 'mm',\n      min: 0,\n      step: 1,\n      required: true,\n      onlyIn: 'metric',");
fs.writeFileSync('D:/construction/src/calculators/lumber-calculator.ts', lumber);
console.log('Fixed');
