import { snapWholeQuantity } from './rounding';
import { renderMeasurementView } from './measurement-view';
import { dimensionRows } from './dimension-rows';
import { fenceRuns } from './fence-runs';
import type { CalculatorInputMap, CalculatorOutputMap, UnitSystem } from './_types';

export const layoutCalculators = [
  'fence-post-calculator', 'stair-calculator', 'rafter-calculator', 'roof-pitch-calculator',
  'rebar-calculator', 'concrete-slab-rebar-calculator', 'metal-roofing-calculator',
  'stud-calculator', 'deck-footing-calculator', 'grout-calculator', 'plywood-calculator', 'drywall-calculator',
];

export function renderLayout(container: HTMLElement, slug: string, inputs: CalculatorInputMap, results: CalculatorOutputMap, unit: UnitSystem) {
  if (!layoutCalculators.includes(slug)) {
    renderMeasurementView(container, slug, inputs, results, unit);
    return;
  }
  const metric = unit === 'metric';
  const measure = (name: string) => metric ? Number(inputs[name + '_m']) :
    Number(inputs[name + '_ft']) + Number(inputs[name + '_in'] || 0) / 12;
  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 3 });
  const lengthUnit = metric ? 'm' : 'ft';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 300 125');
  svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img');
  const smallUnit = metric ? 'mm' : 'in';
  function label(x: number, y: number, value: string) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#244858');
    text.textContent = value;
    svg.append(text);
  }
  function dimension(value: number, unit = lengthUnit) {
    return fmt(value) + ' ' + unit;
  }
  let legend = '';
  let height = 150;
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
    path.setAttribute('stroke', 'currentColor');
    svg.append(path);
  };
  const summary = document.createElement('p');
  const detail = document.createElement('p');
  const marks: string[] = [];
  if (slug === 'fence-post-calculator') {
    const projectRuns = fenceRuns(inputs, unit, measure('fence_length'), measure('post_spacing'));
    if (!projectRuns.length && Number(inputs.gates)) {
      container.textContent = 'Post marks require the locations of gate openings. The post count above includes the entered gates.';
      return;
    }
    const length = measure('fence_length');
    legend = 'Fence run: ' + dimension(length);
    const count = results.sections;
    const fixed = inputs.spacing_method === 'fixed';
    const spacing = fixed ? measure('post_spacing') : length / count;
    summary.textContent = `${count} sections · ${fmt(spacing)} ${lengthUnit} spacing. Marks are measured from the first post.`;
    for (const run of projectRuns.length ? projectRuns : [{start:0, end:length, sections:count}]) {
      line(10 + 280 * run.start / length, 70, 10 + 280 * run.end / length, 70);
      const interval = fixed ? measure('post_spacing') : (run.end - run.start) / (run.sections || 1);
      for (let i = 0; i <= run.sections && marks.length < 301; i++) {
      const distance = Math.min(run.start + i * interval, run.end);
      const x = 10 + distance / length * 280;
      line(x,52,x,78);
      marks.push(fmt(distance));
      }
    }
    if (projectRuns.length) summary.textContent = count + ' fence sections. Gate openings are excluded from spacing.';
    detail.textContent = marks.join(' · ') + ' ' + lengthUnit + (count > 300 ? ' (first 301 marks shown)' : '');
  } else if (slug === 'stud-calculator') {
    const length = measure('length');
    const step = Number(inputs.spacing) / (metric ? 1000 : 12);
    legend = 'Wall: ' + dimension(length) + ' · Centers: ' + dimension(Number(inputs.spacing), smallUnit);
    const openings = dimensionRows(inputs[metric ? 'stud_openings_m' : 'stud_openings_ft']);
    line(10,60,290,60);
    for (let i = 0; i <= Math.min(500, Math.floor(length / step)); i++) {
      const pos = i * step;
      if (openings.some(([start,w]) => pos > start && pos < start+w)) continue;
      const x = 10 + 280 * pos/length;
      line(x,48,x,72);
    }
    for (const [start,w] of openings) {
      const left=10+280*start/length, right=10+280*(start+w)/length;
      line(left,40,left,80); line(left,40,right,40); line(right,40,right,80);
    }
    summary.textContent = 'Stud centers from wall start. Enter opening positions to show interrupted centers. Drawing shows up to 501 centers.';
  } else if (slug === 'deck-footing-calculator') {
    const diameter = Number(inputs[metric ? 'footing_diameter_mm' : 'footing_diameter']);
    const depth = Number(inputs[metric ? 'footing_depth_mm' : 'footing_depth']);
    legend = 'Deck: ' + dimension(measure('deck_length')) + ' × ' + dimension(measure('deck_width'));
    detail.textContent = 'One footing: diameter ' + dimension(diameter, smallUnit) + ' · depth ' + dimension(depth, smallUnit) + '.';
    // Keep the section below the plan so hole depth cannot be read as plan spacing.
    height = 224;
    const scale = Math.min(64 / diameter, 50 / depth);
    const right = 14 + diameter * scale, bottom = 163 + depth * scale;
    line(14, 163, right, 163); line(right, 163, right, bottom);
    line(right, bottom, 14, bottom); line(14, bottom, 14, 163);
    label(90, 178, 'Diameter: ' + dimension(diameter, smallUnit));
    label(90, 198, 'Depth: ' + dimension(depth, smallUnit));
    const points = dimensionRows(inputs[metric ? 'plan_points_m' : 'plan_points_ft']);
    if (points.length) {
      for (const [x,y] of points) {
        const px = 12 + 276*x/measure('deck_length'), py = 10 + 100*y/measure('deck_width');
        line(px-3,py,px+3,py); line(px,py-3,px,py+3);
      }
      summary.textContent = 'Your plan positions · ' + points.length + ' footings from the entered offsets.';
    } else if (Number(inputs.plan_footings)) {
      summary.textContent = results.footings + ' footings from plan. Use their positions on the approved drawing.';
      container.replaceChildren(summary, detail);
      return;
    } else {
      const step = measure('footing_spacing');
      const nx = Math.ceil(measure('deck_length') / step) + 1, ny = Math.ceil(measure('deck_width') / step) + 1;
      summary.textContent = 'Estimated grid · ' + nx + ' by ' + ny + ' support positions. Use your approved plan for construction.';
      for (let x=0;x<Math.min(80,nx);x++) for (let y=0;y<Math.min(80,ny);y++) {
        const px = 12 + 276*x/(nx-1), py = 10 + 105*y/(ny-1);
        line(px-1,py,px+1,py);
      }
    }
  } else if (slug === 'grout-calculator') {
    const suffix = metric ? '_mm' : '_in';
    const w = Number(inputs['tile_length'+suffix]), h = Number(inputs['tile_width'+suffix]), joint = Number(inputs['joint_width'+suffix]);
    legend = 'Tile: ' + fmt(w) + ' × ' + dimension(h, smallUnit) + ' · Joint: ' + dimension(joint, smallUnit);
    const scale = Math.min(270 / (2*w+joint),105 / (2*h+joint));
    for (let x=0;x<2;x++) for(let y=0;y<2;y++) {
      const left = 10 + x*(w+joint)*scale, top = 8+y*(h+joint)*scale;
      const right = left+w*scale, bottom=top+h*scale;
      line(left,top,right,top); line(right,top,right,bottom); line(right,bottom,left,bottom); line(left,bottom,left,top);
    }
    summary.textContent = 'Repeating tile and joint geometry. Joint width: '+fmt(joint)+(metric?' mm':' in')+'.';
  } else if (slug === 'plywood-calculator' || slug === 'drywall-calculator') {
    const drywall = slug === 'drywall-calculator';
    const w = measure(drywall?'wall_width':'length'), h = measure(drywall?'wall_height':'width');
    legend = 'First rectangle: ' + dimension(w) + ' × ' + dimension(h);
    const size = String(inputs.sheet_size).split('x').map(Number);
    const a = metric ? (drywall ? 1.2 : 1.2192) : size[0];
    const b = metric ? (drywall ? ({8:2.44,10:3.05,12:3.66}[size[1] as 8|10|12]) : size[1]*0.3048) : size[1];
    const scale = Math.min(275/w,105/h);
    const rotated = inputs.sheet_orientation === 'rotated';
    const sw = rotated ? a:b, sh=rotated ? b:a;
    const across = snapWholeQuantity(w / sw), down = snapWholeQuantity(h / sh);
    const columns = Math.ceil(across), rows = Math.ceil(down);
    const edgeW = (across - Math.floor(across)) * sw;
    const edgeH = (down - Math.floor(down)) * sh;
    function shade(x: number, y: number, width: number, height: number, color: string) {
      if (width <= 0 || height <= 0) return;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(10 + x*scale));
      rect.setAttribute('y', String(8 + y*scale));
      rect.setAttribute('width', String(width*scale));
      rect.setAttribute('height', String(height*scale));
      rect.setAttribute('fill', color);
      svg.prepend(rect);
    }
    if (!drywall) {
      if (edgeW > 0) shade(w-edgeW,0,edgeW,h,'#f0cc89');
      if (edgeH > 0) shade(0,h-edgeH,w-edgeW,edgeH,'#f0cc89');
      shade(0,0,w,h,'#e0e9ed');
    }
    for (let x=0;x < Math.min(150,columns);x++) line(10+x*sw*scale,8,10+x*sw*scale,8+h*scale);
    for (let y=0;y < Math.min(150,rows);y++) line(10,8+y*sh*scale,10+w*scale,8+y*sh*scale);
    line(10+w*scale,8,10+w*scale,8+h*scale); line(10,8+h*scale,10+w*scale,8+h*scale);
    summary.textContent = 'First rectangle: '+columns+' columns × '+rows+' rows before openings or offcut reuse. Order quantity above uses combined area and waste.';
    if (!drywall) {
      const pieces = dimensionRows(inputs[metric ? 'offcuts_m' : 'offcuts_ft']).map(([w,h],index) => ({w,h,index:index+1}));
      summary.textContent += ' Gray: full sheets. Amber: edge cuts. Green: matched offcuts.';
      const assignments: string[] = [];
      const match = (column:number, row:number) => {
        const needW = column === columns - 1 && edgeW ? edgeW : sw;
        const needH = row === rows - 1 && edgeH ? edgeH : sh;
        if (needW >= sw && needH >= sh) return;
        const fit = pieces.findIndex(piece => snapWholeQuantity(piece.w / needW) >= 1 && snapWholeQuantity(piece.h / needH) >= 1);
        if (fit < 0) return;
        const [piece] = pieces.splice(fit,1);
        const patch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        patch.setAttribute('x', String(10+column*sw*scale));
        patch.setAttribute('y', String(8+row*sh*scale));
        patch.setAttribute('width', String(needW*scale));
        patch.setAttribute('height', String(needH*scale));
        patch.setAttribute('fill', '#a5d5b3');
        patch.setAttribute('stroke', '#315e46');
        patch.setAttribute('stroke-dasharray', '3 2');
        svg.append(patch);
        assignments.push('Offcut '+piece.index+' fits row '+(row+1)+', column '+(column+1)+' ('+fmt(needW)+' × '+fmt(needH)+' '+lengthUnit+')');
      };
      for (let row=0;row<rows && pieces.length;row++) match(columns-1,row);
      for (let col=0;col<columns-1 && pieces.length;col++) match(col,rows-1);
      if (inputs[metric ? 'offcuts_m':'offcuts_ft']) detail.textContent = (assignments.join('. ') || 'No matching edge pieces') + '. First rectangle only. Keep entered orientation and confirm edge support and usable trimmed dimensions. Each offcut is assigned once.';
    }
  } else if (slug === 'stair-calculator') {
    const count = results.treads;
    const rise = measure('total_rise');
    // Imperial total rise uses paired feet and inches.
    const run = metric ? results.total_run_m : results.total_run_ft;
    const scale = Math.min(275 / (run || 1), 106 / (rise || 1));
    legend = 'Total rise: ' + dimension(rise) + ' · Run: ' + dimension(run);
    const going = results.effective_tread;
    const risePerStep = metric ? rise * 1000 / results.risers : rise * 12 / results.risers;
    for (let i = 0; i < Math.min(results.risers,300); i++) {
      const x = 10 + i * run * scale / (count || 1);
      const y = 115 - i * rise * scale / results.risers;
      const nextY = y - rise * scale / results.risers;
      line(x,y,x,nextY);
      if (i < count) {
        line(x,nextY,x + run * scale / count,nextY);
        marks.push(fmt((i+1) * risePerStep));
      }
    }
    summary.textContent = `${results.risers} risers · ${count} treads · going ${fmt(going)} ${metric ? 'mm' : 'in'}.`;
    detail.textContent = 'Tread heights above lower floor (' + (metric ? 'mm' : 'in') + '): ' + marks.join(' · ');
  } else if (slug === 'rafter-calculator' || slug === 'roof-pitch-calculator') {
    const run = results.effective_run ?? measure('run');
    const rise = results.effective_rise ?? 0;
    const slope = run > 0 ? rise / run : 0;
    legend = 'Run: ' + dimension(run) + ' · Rise: ' + dimension(rise);
    const tail = slug === 'rafter-calculator' ? measure('overhang') : 0;
    const scale = Math.min(275 / (run + tail || 1), 105 / ((run + tail) * slope || 1));
    const wall = 10 + tail * scale;
    const ridge = wall + run * scale;
    const wallY = 115 - tail * slope * scale;
    line(10,115,ridge,115 - (run + tail) * slope * scale);
    line(wall,wallY,ridge,wallY);
    line(ridge,wallY,ridge,wallY - run * slope * scale);
    summary.textContent = `Run ${fmt(run)} ${lengthUnit} · horizontal overhang ${fmt(tail)} ${lengthUnit} · pitch ${fmt(results.pitch_ratio)}:12.`;
  } else {
    const metal = slug === 'metal-roofing-calculator';
    const across = metal ? results.panel_cols : results.rows;
    const down = metal ? results.panel_rows : results.columns;
    if (!across || !down) { container.replaceChildren(); return; }
    const inset = Number(metric ? inputs.edge_inset_mm : inputs.edge_inset_in) / (metric ? 1000 : 12) || 0;
    const width = measure('width') - 2 * inset, length = measure('length') - 2 * inset;
    legend = metal
      ? 'Panel cover: ' + dimension(Number(inputs[metric ? 'panel_cover_mm' : 'panel_cover_in']), smallUnit)
      : 'Grid: ' + dimension(length) + ' × ' + dimension(width);
    const spacing = Number(metric ? inputs.spacing_mm : inputs.spacing) / (metric ? 1000 : 12);
    const cross = Number(metric ? inputs.cross_spacing_mm : inputs.cross_spacing_in) / (metric ? 1000 : 12) || spacing;
    for (let i=0; i < Math.min(across + Number(metal), 200); i++) {
      const x = 12 + 276 * (metal ? i / across : i * spacing / length);
      line(x,10,x,115);
    }
    for (let i=0; i < Math.min(down + Number(metal), 200); i++) {
      const y = 10 + 105 * (metal ? i / down : i * cross / width);
      line(12,y,288,y);
    }
    summary.textContent = metal ? `One roof face: ${across} columns × ${down} panel rows. Schematic layout.` :
      `${across} bars across the width (${fmt(width)} ${lengthUnit} each) and ${down} along the length (${fmt(length)} ${lengthUnit} each). Grid starts at the entered inset with a remainder at the far edge. Stock and lap lengths depend on the project plan.`;
    if (across >= 200 || down >= 200) detail.textContent = 'Drawing limited to 200 lines per direction.';
  }
  svg.setAttribute('viewBox', '0 0 300 ' + height);
  svg.setAttribute('aria-label', legend + '. ' + summary.textContent);
  label(10, 141, legend);
  container.replaceChildren(summary, svg, detail);
}
