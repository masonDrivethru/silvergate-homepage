// @silvergate/compare-vue — Vue 3 용. 빌드 없이 쓰는 순수 JS (defineComponent + h)
//
//   <SgCompare :left="v1" :right="v2" page=".page">
//     <template #doc="{ data }"><MyDocument :doc="data" /></template>
//   </SgCompare>
//
// 사용자의 문서 컴포넌트를 왼쪽·오른쪽에 그대로 그리고, 그려진 화면을 비교한다. 문서 컴포넌트는 고칠 필요 없음.
import { defineComponent, h, ref, onMounted, onBeforeUnmount, watch, shallowRef, nextTick } from 'vue';
import { createCompare, mountToolbar, mountChangeList, getMessages } from '@silvergate/compare-dom';



export const SgCompare = defineComponent({
  name: 'SgCompare',
  props: {
    left: { default: undefined },
    right: { default: undefined },
    leftLabel: { type: String, default: '' },
    rightLabel: { type: String, default: '' },
    /** 'side' (좌우) | 'redline' (한 장) */
    mode: { type: String, default: 'side' },
    locale: { type: String, default: 'ko' },
    labels: { type: Object, default: undefined },
    /** 쪽 요소 선택자 (변경 목록에 "n쪽" 표시, 보이는 쪽만 높이 맞춤) */
    page: { type: String, default: null },
    height: { type: String, default: '80vh' },
    /** compare-dom 의 나머지 옵션 (attrs, ignore, keyAttrs, nonce ...) */
    options: { type: Object, default: () => ({}) },
    toolbar: { type: Boolean, default: true },
    list: { type: Boolean, default: true },
  },
  emits: ['update', 'focus', 'update:mode'],
  setup(props, { slots, emit, expose }) {
    // 두 문서를 한 스크롤 영역(desk)에 나란히 → 좌우가 한 장처럼 함께 움직인다
    const lMount = ref(), rMount = ref(), xMount = ref(), desk = ref(), bar = ref(), listEl = ref();
    const mode = ref(props.mode);
    const phoneSide = ref('right');
    const ctrl = shallowRef(null);
    let tb = null, cl = null, redlineDirty = true;

    const drawRedline = () => { if (ctrl.value && xMount.value) { ctrl.value.renderRedline(xMount.value); redlineDirty = false; } };
    const setMode = (m) => { mode.value = m; emit('update:mode', m); if (m === 'redline' && redlineDirty) nextTick(drawRedline); };
    watch(() => props.mode, (m) => { if (m !== mode.value) { setMode(m); tb?.setMode(m); } });

    onMounted(() => {
      const c = createCompare({
        ...props.options, left: lMount.value, right: rMount.value,
        leftScroller: desk.value, rightScroller: desk.value, page: props.page, watch: true, locale: props.locale,
      });
      c.on('update', () => { redlineDirty = true; if (mode.value === 'redline') drawRedline(); emit('update', c); });
      c.on('focus', (ch) => emit('focus', ch));
      if (props.toolbar) tb = mountToolbar(bar.value, c, { locale: props.locale, labels: props.labels, modes: true, mode: mode.value, onMode: setMode, nonce: props.options?.nonce });
      if (props.list) cl = mountChangeList(listEl.value, c, { locale: props.locale, labels: props.labels, nonce: props.options?.nonce });
      ctrl.value = c;
    });
    onBeforeUnmount(() => { tb?.destroy(); cl?.destroy(); ctrl.value?.destroy(); });

    expose({
      controller: ctrl,
      run: () => ctrl.value?.run(), next: () => ctrl.value?.next(), prev: () => ctrl.value?.prev(),
      goTo: (i) => ctrl.value?.goTo(i),
    });

    const msg = () => getMessages(props.locale, props.labels);
    const head = (side, badge, cls, label) => h('button', {
      type: 'button', class: 'sgc-pane-head', 'aria-pressed': phoneSide.value === side ? 'true' : 'false',
      onClick: () => { phoneSide.value = side; },
    }, [h('span', { class: `sgc-badge ${cls}` }, badge), label]);

    return () => {
      const red = mode.value === 'redline';
      return h('div', { class: 'sgc-viewer', 'data-mode': mode.value, style: { '--sgc-height': props.height } }, [
        props.toolbar ? h('div', { ref: bar }) : null,
        h('div', { class: 'sgc-body', style: props.list ? null : 'grid-template-columns:1fr' }, [
          h('div', { class: 'sgc-panes sgc-panes--one' }, [
            h('section', { class: 'sgc-pane sgc-both', hidden: red }, [
              h('div', { class: 'sgc-heads', role: 'group' }, [
                head('left', msg().before, 'sgc-badge-old', props.leftLabel),
                head('right', msg().after, 'sgc-badge-new', props.rightLabel),
              ]),
              h('div', { ref: desk, class: 'sgc-shared', 'data-phone': phoneSide.value, tabindex: '0' }, [
                h('div', { class: 'sgc-col sgc-col--left' }, [h('div', { ref: lMount, class: 'sgc-doc' }, slots.doc?.({ data: props.left, side: 'left' }))]),
                h('div', { class: 'sgc-col sgc-col--right' }, [h('div', { ref: rMount, class: 'sgc-doc' }, slots.doc?.({ data: props.right, side: 'right' }))]),
              ]),
            ]),
            h('section', { class: 'sgc-pane', hidden: !red }, [
              h('header', { class: 'sgc-pane-head' }, `${props.leftLabel} → ${props.rightLabel}`),
              h('div', { style: 'flex:1;min-height:0;overflow:auto' }, [h('div', { ref: xMount, class: 'sgc-doc' })]),
            ]),
          ]),
          props.list ? h('aside', { ref: listEl }) : null,
        ]),
      ]);
    };
  },
});

/**
 * 레이아웃은 직접 만들고 비교만 붙이고 싶을 때: 두 요소의 ref 를 넘긴다.
 *   const { controller } = useCompare(leftEl, rightEl, { page: '.page' })
 */
export function useCompare(leftRef, rightRef, options = {}) {
  const controller = shallowRef(null);
  onMounted(() => { controller.value = createCompare({ watch: true, ...options, left: leftRef.value, right: rightRef.value }); });
  onBeforeUnmount(() => controller.value?.destroy());
  return { controller };
}

export default { install(app) { app.component('SgCompare', SgCompare); } };
export * from '@silvergate/compare-dom';
