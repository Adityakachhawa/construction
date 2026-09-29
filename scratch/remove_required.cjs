const fs = require('fs');
function removeRequired(file, id) {
  const content = fs.readFileSync(file, 'utf8');
  const blocks = content.split(/(id:\s*['"])/);
  let result = blocks[0];
  for (let i = 1; i < blocks.length; i += 2) {
    const idStr = blocks[i];
    const blockContent = blocks[i+1];
    if (blockContent.startsWith(id + "'") || blockContent.startsWith(id + '"')) {
      const newContent = blockContent.replace(/required:\s*true,?\s*\n?/g, '');
      result += idStr + newContent;
    } else {
      result += idStr + blockContent;
    }
  }
  fs.writeFileSync(file, result);
}
removeRequired('src/calculators/flooring-calculator.ts', 'waste_pct');
removeRequired('src/calculators/concrete-bags-calculator.ts', 'depth_in');
