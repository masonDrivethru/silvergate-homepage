// @silvergate/compare-react — React 17+ 용. JSX 없이 쓰는 순수 JS
//
//   <SgCompare left={v1} right={v2} page=".page" renderDoc={(data) => <MyDocument doc={data} />} />
//
// 사용자의 문서 컴포넌트를 왼쪽·오른쪽에 그대로 그리고, 그려진 화면을 비교한다.
import { createElement as h, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { createCompare, mountToolbar, mountChangeList } from '@silvergate/compare-dom';

/** 레이아웃은 직접, 비교만: const ctrl = useCompare(leftRef, rightRef, { page: '.page' }) */
export function useCompare(leftRef, rightRef, options = {}) {
  const [ctrl, setCtrl] = useState(null);
  useEffect(() => {
    const c = createCompare({ watch: true, ...options, left: leftRef.current, right: rightRef.current });
    setCtrl(c);
    return () => c.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ctrl;
}

export const SgCompare = forwardRef(function SgCompare(props, ref) {
  const { left, right, renderDoc, leftLabel = '', rightLabel = '', locale = 'ko', labels, page = null, height = '80vh',
    options = {}, toolbar = true, list = true, onUpdate, onFocus } = props;
  const [mode, setMode] = useState(props.mode ?? 'side');
  const lM = useRef(), rM = useRef(), xM = useRef(), lS = useRef(), rS = useRef(), bar = useRef(), listEl = useRef();
  const ctrlRef = useRef(null), modeRef = useRef(mode), dirty = useRef(true), tbRef = useRef(null);
  modeRef.current = mode;

  useEffect(() => {
    const c = createCompare({ ...options, left: lM.current, right: rM.current, leftScroller: lS.current, rightScroller: rS.current, page, watch: true });
    ctrlRef.current = c;
    c.on('update', () => { dirty.current = true; if (modeRef.current === 'redline') { c.renderRedline(xM.current); dirty.current = false; } onUpdate?.(c); });
    c.on('focus', (ch) => onFocus?.(ch));
    const tb = toolbar ? mountToolbar(bar.current, c, { locale, labels, modes: true, mode: modeRef.current, onMode: setMode }) : null;
    tbRef.current = tb;
    const cl = list ? mountChangeList(listEl.current, c, { locale, labels }) : null;
    return () => { tb?.destroy(); cl?.destroy(); c.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (props.mode && props.mode !== mode) { setMode(props.mode); tbRef.current?.setMode(props.mode); } }, [props.mode]);
  useEffect(() => {
    if (mode === 'redline' && dirty.current && ctrlRef.current?.changes) { ctrlRef.current.renderRedline(xM.current); dirty.current = false; }
  }, [mode]);

  useImperativeHandle(ref, () => ({
    get controller() { return ctrlRef.current; },
    run: () => ctrlRef.current?.run(), next: () => ctrlRef.current?.next(), prev: () => ctrlRef.current?.prev(), goTo: (i) => ctrlRef.current?.goTo(i),
  }), []);

  const ko = locale !== 'en';
  const red = mode === 'redline';
  const pane = (side, label, badge, mRef, sRef, data, hidden) => h('section', { className: 'sgc-pane', hidden },
    h('header', { className: 'sgc-pane-head' }, h('span', { className: `sgc-badge sgc-badge-${side === 'left' ? 'old' : 'new'}` }, badge), label),
    h('div', { ref: sRef, style: { flex: 1, minHeight: 0, overflow: 'auto' } },
      // 한 장 보기 칸은 모듈이 직접 채운다 (React 가 손대지 않게 자식 없음)
      h('div', { ref: mRef, className: 'sgc-doc' }, side === 'merged' ? null : renderDoc?.(data, side))));

  return h('div', { className: 'sgc-viewer', 'data-mode': mode, style: { '--sgc-height': height } },
    toolbar ? h('div', { ref: bar }) : null,
    h('div', { className: 'sgc-body', style: list ? undefined : { gridTemplateColumns: '1fr' } },
      h('div', { className: 'sgc-panes' },
        pane('left', leftLabel, ko ? '이전' : 'Before', lM, lS, left, red),
        pane('right', rightLabel, ko ? '새 버전' : 'After', rM, rS, right, red),
        pane('merged', `${leftLabel} → ${rightLabel}`, ko ? '한 장 보기' : 'Redline', xM, undefined, undefined, !red)),
      list ? h('aside', { ref: listEl }) : null));
});

export * from '@silvergate/compare-dom';
