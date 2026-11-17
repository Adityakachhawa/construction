import type { CalculatorInputMap, CalculatorOutputMap, UnitSystem } from './_types';

const ns = 'http://www.w3.org/2000/svg';
const fill = { concrete: '#c5d3d9', sand: '#edd7a5', gravel: '#beafa0', wood: '#d6ae7c', area: '#d5e8e4' };

export function renderMeasurementView(container: HTMLElement, slug: string, inputs: CalculatorInputMap, results: CalculatorOutputMap, unit: UnitSystem) {
  const metric = unit === 'metric';
  const large = metric ? 'm' : 'ft';
  const small = metric ? 'mm' : 'in';
  const perUnit = metric ? 1000 : 12;
  const length = (key: string) => metric ? Number(inputs[key + '_m']) : Number(inputs[key + '_ft']) + Number(inputs[key + '_in'] || 0) / 12;
  const fine = (key: string) => Number(metric ? inputs[key + '_mm'] : inputs[key + '_in'] ?? inputs[key]);
  const fmt = (n: number) => n.toLocaleString('en-US', { maximumSignificantDigits: 5 });
  const name = slug.replace(/-calculator$/, '');
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox','0 0 300 128');
  svg.setAttribute('role','img');
  const notes: string[] = [];
  const note = (label: string, value: number, suffix: string) => notes.push(label + ': ' + fmt(value) + ' ' + suffix);
  function shape(tag: 'rect' | 'circle' | 'path', attrs: Record<string,string | number>, color: string) {
    const el = document.createElementNS(ns, tag);
    for (const [key,value] of Object.entries(attrs)) el.setAttribute(key,String(value));
    el.setAttribute('fill',color);
    el.setAttribute('stroke','#294f60');
    el.setAttribute('stroke-width','1.2');
    svg.append(el);
  }
  const box = (x:number,y:number,width:number,height:number,color:string) => shape('rect',{x,y,width,height},color);
  // A common scale on both axes preserves proportions. Text stays outside the drawing at extreme ratios.
  function frame(w:number,h:number) {
    const scale = Math.min(220/w,88/h);
    return {x:(300-w*scale)/2,y:(128-h*scale)/2,w:w*scale,h:h*scale,scale};
  }
  function rectangle(w:number,h:number,color = fill.area) {
    const f=frame(w,h);
    box(f.x,f.y,f.w,f.h,color);
    return f;
  }
  function annotation(x: number, y: number, value: string, vertical = false) {
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('font-size', '10');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#244858');
    if (vertical) text.setAttribute('transform', `rotate(-90 ${x} ${y})`);
    text.textContent = value;
    svg.append(text);
  }
  const dimension = (n: number, suffix = large) => fmt(n) + ' ' + suffix;
  let title = 'First rectangle · top view';
  let detail = '';
  const knownVolume = Number(inputs[metric ? 'pour_m3' : 'pour_ft3']);
  if (name === 'concrete-bags' && knownVolume > 0) {
    container.textContent = 'Known net pour volume: ' + fmt(knownVolume) + (metric ? ' m³' : ' ft³') + '. Dimensions are overridden; this volume has no unique shape.';
    return;
  }
  if (name === 'post-hole' || name === 'french-drain') {
    const hole = name === 'post-hole';
    const w = hole ? fine('diameter') : length('width') * perUnit;
    const depth = length('depth') * perUnit;
    const f = rectangle(w,depth,hole ? fill.concrete : fill.gravel);
    title = hole ? 'One hole · side section' : 'First trench · cross-section';
    note(hole ? 'Hole diameter' : 'Trench width',w,small);
    annotation(150,f.y-5,dimension(w,small));
    annotation(f.x-6,64,dimension(depth,small),true);
    note('Depth',depth,small);
    if (hole) {
      const gravel = fine('gravel_depth'), post = fine('post_width');
      if (gravel > depth || post * Math.SQRT2 > w) {
        container.textContent = 'Check the section dimensions: the gravel and the square post must fit inside the round hole.';
        return;
      }
      if (gravel > 0) box(f.x,f.y+f.h-gravel*f.scale,f.w,gravel*f.scale,fill.gravel);
      if (post > 0 && gravel < depth) box(150-post*f.scale/2,f.y,post*f.scale,(depth-gravel)*f.scale,fill.wood);
      note('Post width',post,small); note('Gravel base',gravel,small);
      detail='The center post and bottom gravel layer displace concrete. Quantities above include the entered hole count.';
    } else {
      const pipe = fine('pipe_diameter');
      if (pipe > w || pipe > depth) {
        container.textContent = 'The entered pipe diameter exceeds the first trench section. Check the pipe and trench dimensions.';
        return;
      }
      if (pipe > 0) shape('circle',{cx:150,cy:f.y+f.h-pipe*f.scale/2,r:pipe*f.scale/2},'#fff');
      note('Pipe outside diameter',pipe,small);
      detail = inputs.gravel_method === 'pipe' ? 'Gravel basis: trench volume less the outside pipe volume.' : 'Gravel basis: ' + fmt(Number(inputs.gravel_pct)) + '% of trench volume.';
      detail += ' Pipe position is illustrative.';
    }
  } else if (name === 'paver-base') {
    const sand = fine('sand_depth'), base = fine('base_depth');
    if (sand+base <= 0) {container.textContent='No layer depth entered.';return;}
    // Show a detail of the layers so even a wide patio has a legible sand band.
    const f={x:40,y:20,w:135,scale:88/(sand+base)};
    if (sand>0) box(f.x,f.y,f.w,sand*f.scale,fill.sand);
    if (base>0) box(f.x,f.y+sand*f.scale,f.w,base*f.scale,fill.gravel);
    annotation(233,42,'Sand '+dimension(sand,small));
    annotation(233,91,'Base '+dimension(base,small));
    title='Base layers · side section';
    note('Top · bedding sand',sand,small);note('Bottom · gravel base',base,small);
    detail='Across the paved width of '+fmt(length('width'))+' '+large+'.';
  } else if (name === 'lumber' || name === 'board-foot') {
    const qty=Number(inputs.quantity), len=length('length');
    title='First stock size · length and count';
    const count=Math.min(5,qty);
    for(let i=0;i<count;i++) box(45,64-count*8+i*16,210,12,fill.wood);
    annotation(150,15,dimension(len));
    notes.push(fmt(qty)+' × '+fmt(len)+' '+large+' = '+fmt(qty*len)+' linear '+large);
    if(name==='board-foot'){note('Face width',fine('width'),small);note('Thickness',fine('thickness'),small);}
    detail='Schematic shows up to five pieces. '+(name==='lumber'?'This line is before waste; the result includes the allowance and any additional stock.':'Additional stock rows are counted separately.');
  } else if (name==='concrete-column') {
    const w=fine('diameter'),h=length('height');
    const f=rectangle(w,h*perUnit,fill.concrete);
    annotation(150,f.y-5,dimension(w,small));
    annotation(f.x-6,64,dimension(h),true);
    title='One column · side view';
    note('Diameter',w,small);note('Height',h,large);note('Count',Number(inputs.columns),'columns');
  } else {
    const wall=['siding','concrete-block','mortar','retaining-wall'].includes(name);
    const prefix=name==='retaining-wall'?'wall_':'';
    const selected=name==='square-footage'?String(inputs.shape):'rectangle';
    if(selected==='circle'){
      shape('circle',{cx:150,cy:64,r:44},fill.area);
      shape('path',{d:'M150 64h44'},'none');
      annotation(172,57,dimension(length('radius')));
      title='Circle · top view';note('Radius',length('radius'),large);
    } else {
      const a=selected==='triangle'?'base':selected==='square'?'side':name==='siding'?'width':prefix+'length';
      const b=selected==='triangle'?'height':selected==='square'?'side':wall?prefix+'height':'width';
      const w=length(a), h=length(b);
      if (!(w>0 && h>0)) {container.textContent='Enter the main dimensions to see the measurement view.';return;}
      const f=frame(w,h);
      if(selected==='triangle'){
        shape('path',{d:`M${f.x} ${f.y+f.h} L150 ${f.y} L${f.x+f.w} ${f.y+f.h} Z`},fill.area);
        shape('path',{d:`M150 ${f.y}v${f.h}`},'none');
        title='Triangle · base and perpendicular height';
      } else box(f.x,f.y,f.w,f.h,fill.area);
      if (wall) title='First wall · elevation';
      if (name==='roofing') title='Horizontal roof footprint';
      note(selected==='triangle'?'Base':selected==='square'?'Side':name==='siding'?'Width':'Length',w,large);
      if(selected!=='square')note(wall || selected==='triangle'?'Height':'Width',h,large);
      if(name==='concrete-slab'){
        const thick=fine('thickness');title='First slab · side section';
        svg.replaceChildren();const section=rectangle(w,thick/perUnit,fill.concrete);
        annotation(150,section.y-6,dimension(w));
        annotation(150,section.y+section.h+14,'Thickness '+dimension(thick,small));
        note('Thickness',thick,small);
      } else if ('thickness_mm' in inputs || 'thickness' in inputs) note('Thickness',fine('thickness'),small);
      else if ('depth_m' in inputs || 'depth_ft' in inputs || 'depth_mm' in inputs || 'depth' in inputs) {
        const useLarge=metric?'depth_m' in inputs:'depth_ft' in inputs;
        note('Depth',useLarge?length('depth'):fine('depth'),useLarge?large:small);
      }
      if (name !== 'concrete-slab') {
        annotation(150,f.y+f.h+14,dimension(w));
        annotation(f.x-7,64,dimension(h),true);
      }
      if (name==='concrete-footing') note('Count',Number(inputs.count),'footings');
      if (name==='roofing') note('Slope multiplier',results.pitch_factor,'×');
    }
  }
  const heading=document.createElement('p'), caption=document.createElement('p');
  heading.textContent=title;caption.textContent=notes.join(' · ');
  svg.setAttribute('aria-label',title+'. '+caption.textContent);
  container.replaceChildren(heading,svg,caption);
  if(detail){const explanation=document.createElement('p');explanation.textContent=detail;container.append(explanation);}
}
