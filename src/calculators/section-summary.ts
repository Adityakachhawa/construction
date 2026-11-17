import type { CalculatorInputMap, UnitSystem } from './_types';
import { dimensionRows } from './dimension-rows';
import { rectangleAreas } from './project-sections';

export function renderSections(container: HTMLElement, inputs: CalculatorInputMap, unit: UnitSystem) {
  const metric = unit === 'metric';
  const suffix = metric ? '_m' : '_ft';
  const lengthUnit = metric ? 'm' : 'ft';
  const text = String(inputs['sections' + suffix] || '');
  const list = document.createElement('ol');
  const format = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 4 });
  const row = (label: string) => {
    const item = document.createElement('li');
    item.textContent = (list.childElementCount + 1) + ". " + label;
    list.append(item);
    return item;
  };
  const areas = rectangleAreas(text);
  if (text) {
    text.split(',').forEach((part, index) => {
      const area = areas[index];
      const item = row((area < 0 ? 'Opening ' : 'Added rectangle ') + part.trim().replace(/^[-+]/, '') + ' = ' + format(area) + ' ' + lengthUnit + '²');
      const [length,width] = part.trim().replace(/^[-+]/,'').split(/[xX]/).map(Number);
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden','true');
      Object.assign(icon.style, { display:'inline-block', marginInlineStart:'.5rem', verticalAlign:'middle',
        width: Math.max(2,40 * length / Math.max(length,width)) + 'px', height:Math.max(2,40 * width / Math.max(length,width)) + 'px',
        border: '1px ' + (area < 0 ? 'dashed' : 'solid') + ' currentColor' });
      item.append(icon);
    });
  }
  for (const [l,w,d] of dimensionRows(inputs['extra_parts'+suffix])) {
    const volume = d === undefined ? Math.PI*l*l*w/4 : l*w*d;
    row('Additional section volume: ' + format(volume) + ' ' + lengthUnit + '³');
  }
  for (const [l,h] of dimensionRows(inputs['wall_parts'+suffix])) {
    row('Wall section: ' + format(l*h) + ' ' + lengthUnit + '²');
  }
  for (const [t,w,l,q] of dimensionRows(inputs['stock_list'+suffix])) {
    const bf = t*w*l*q/(metric ? 12*25.4**2*0.3048 : 12);
    row(q + ' pieces · ' + format(bf) + ' board feet before waste');
  }
  container.replaceChildren(list);
  container.hidden = !list.childElementCount;
}
