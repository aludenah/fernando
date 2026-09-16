import katex from './vendor/katex/katex.mjs';
import {html} from './model.js';

const delimiters = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;

export function mathExpressions(value) {
  return [...String(value ?? '').matchAll(delimiters)].map(match => ({
    source: match[0], tex: match[1] ?? match[2], display: match[2] !== undefined, index: match.index,
  }));
}

// Prose is escaped, and imported TeX cannot create links, images or HTML.
// Each expression gets its own macro scope so one question cannot alter another.
export function math(value, {strict = false} = {}) {
  const text = String(value ?? '');
  let result = '', cursor = 0;
  for (const expression of mathExpressions(text)) {
    result += html(text.slice(cursor, expression.index));
    try {
      const rendered = katex.renderToString(expression.tex, {
        displayMode: expression.display, output: 'htmlAndMathml', throwOnError: true,
        trust: false, strict: 'error', maxSize: 20, maxExpand: 1000, macros: {},
      });
      result += `<span class="${expression.display ? 'math-display' : 'math-inline'}">${rendered}</span>`;
    } catch (error) {
      if (strict) throw error;
      result += `<span class="math-fallback">${html(expression.source)}</span>`;
    }
    cursor = expression.index + expression.source.length;
  }
  return result + html(text.slice(cursor));
}
