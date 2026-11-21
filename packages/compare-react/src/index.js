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
  const [phoneSide, setPhoneSide] = useState('right');
  // 두 문서를 한 스크롤 영역(desk)에 나란히 → 좌우가 한 장처럼 함께 움직인다
  const lM = useRef(), rM = useRef(), xM = useRef(), desk = useRef(), bar = useRef(), listEl = useRef();
  const ctrlRef = useRef(null), modeRef = useRef(mode), dirty = useRef(true), tbRef = useRef(null);
  modeRef.current = mode;

  useEffect(() => {
    const c = createCompare({ ...options, left: lM.current, right: rM.current, leftScroller: desk.current, rightScroller: desk.current, page, watch: true, locale });
    ctrlRef.current = c;
    c.on('update', () => { dirty.current = true; if (modeRef.current === 'redline') { c.renderRedline(xM.current); dirty.current = false; } onUpdate?.(c); });
    c.on('focus', (ch) => onFocus?.(ch));
    const tb = toolbar ? mountToolbar(bar.current, c, { locale, labels, modes: true, mode: modeRef.current, onMode: setMode, nonce: options.nonce }) : null;
    tbRef.current = tb;
    const cl = list ? mountChangeList(listEl.current, c, { locale, labels, nonce: options.nonce }) : null;
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
  const head = (side, badge, cls, label) => h('button', {
    type: 'button', className: 'sgc-pane-head', 'aria-pressed': phoneSide === side ? 'true' : 'false', onClick: () => setPhoneSide(side),
  }, h('span', { className: `sgc-badge ${cls}` }, badge), label);

  return h('div', { className: 'sgc-viewer', 'data-mode': mode, style: { '--sgc-height': height } },
    toolbar ? h('div', { ref: bar }) : null,
    h('div', { className: 'sgc-body', style: list ? undefined : { gridTemplateColumns: '1fr' } },
      h('div', { className: 'sgc-panes sgc-panes--one' },
        h('section', { className: 'sgc-pane sgc-both', hidden: red },
          h('div', { className: 'sgc-heads', role: 'group' },
            head('left', ko ? '이전' : 'Before', 'sgc-badge-old', leftLabel),
            head('right', ko ? '새 버전' : 'After', 'sgc-badge-new', rightLabel)),
          h('div', { ref: desk, className: 'sgc-shared', 'data-phone': phoneSide, tabIndex: 0 },
            h('div', { className: 'sgc-col sgc-col--left' }, h('div', { ref: lM, className: 'sgc-doc' }, renderDoc?.(left, 'left'))),
            h('div', { className: 'sgc-col sgc-col--right' }, h('div', { ref: rM, className: 'sgc-doc' }, renderDoc?.(right, 'right'))))),
        // 한 장 보기 칸은 모듈이 직접 채운다 (React 가 손대지 않게 자식 없음)
        h('section', { className: 'sgc-pane', hidden: !red },
          h('header', { className: 'sgc-pane-head' }, `${leftLabel} → ${rightLabel}`),
          h('div', { style: { flex: 1, minHeight: 0, overflow: 'auto' } }, h('div', { ref: xM, className: 'sgc-doc' })))),
      list ? h('aside', { ref: listEl }) : null));
});

export * from '@silvergate/compare-dom';
