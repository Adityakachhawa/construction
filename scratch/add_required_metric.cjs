const fs = require('fs');
function addRequired(file, id) {
  const content = fs.readFileSync(file, 'utf8');
  const blocks = content.split(/(id:\s*['"])/);
  let result = blocks[0];
  for (let i = 1; i < blocks.length; i += 2) {
    const idStr = blocks[i];
    const blockContent = blocks[i+1];
    if (blockContent.startsWith(id + "'") || blockContent.startsWith(id + '"')) {
      if (!blockContent.includes('required:')) {
        const newContent = blockContent.replace(/defaultValue:\s*[^,]+,/, match => match + '\n      required: true,');
        result += idStr + newContent;
      } else {
        result += idStr + blockContent;
      }
    } else {
      result += idStr + blockContent;
    }
  }
  fs.writeFileSync(file, result);
}
addRequired('src/calculators/french-drain-calculator.ts', 'pipe_diameter_mm');
addRequired('src/calculators/insulation-calculator.ts', 'r_value_si');
addRequired('src/calculators/grout-calculator.ts', 'tile_depth_mm');
addRequired('src/calculators/post-hole-calculator.ts', 'post_width_mm');
addRequired('src/calculators/lumber-calculator.ts', 'thickness_mm');
addRequired('src/calculators/concrete-slab-rebar-calculator.ts', 'thickness_mm');
addRequired('src/calculators/concrete-driveway-calculator.ts', 'thickness_mm');
addRequired('src/calculators/asphalt-calculator.ts', 'thickness_mm');
