// 어댑터 확인용 (compare-vue · compare-react 를 실제 부품으로 사용)
import * as Vue from 'vue';
import { SgCompare as VueCompare } from '@silvergate/compare-vue';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SgCompare as ReactCompare } from '@silvergate/compare-react';

const D = window.SgDemoDocs;
const st = document.createElement('style'); st.textContent = D.CSS + '.sgc-doc{zoom:.6}'; document.head.appendChild(st);
const v3 = D.make(3, 30), v4 = D.make(4, 30);

// Vue
const vh = (t, p, k) => Vue.h(t, p, k);
const right = Vue.reactive(structuredClone(v4));
Vue.createApp({
  render: () => Vue.h(VueCompare, { left: v3, right, leftLabel: 'v3', rightLabel: 'v4', page: '.page', height: '600px', class: 'doc-root' },
    { doc: ({ data }) => Vue.h('div', null, D.render(vh, data)) }),
}).mount('#vue');
window.vueEdit = () => { right.pages[2].paras[0] += ' (추가 문장)'; };

// React
const rh = (t, p, k) => React.createElement(t, p, ...(Array.isArray(k) ? k : [k]));
const root = createRoot(document.getElementById('react'));
let rdoc = structuredClone(v4);
const draw = () => root.render(React.createElement(ReactCompare, { left: v3, right: rdoc, leftLabel: 'v3', rightLabel: 'v4', page: '.page', height: '600px',
  renderDoc: (data) => React.createElement('div', { className: 'doc-root' }, ...D.render(rh, data)) }));
draw();
window.reactEdit = () => { rdoc = structuredClone(rdoc); rdoc.pages[2].paras[0] += ' (추가 문장)'; draw(); };
