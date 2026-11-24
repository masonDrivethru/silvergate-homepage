// @silvergate/compare-dom 타입

/** 비교할 화면: 요소 · 문서 · 같은 도메인 iframe */
export type Source = Element | Document | HTMLIFrameElement;

export interface CompareOptions {
  /** 이전 버전 화면 */
  left: Source;
  /** 새 버전 화면 */
  right: Source;
  /** 스크롤 영역 (없으면 가장 가까운 스크롤 조상 또는 창) */
  leftScroller?: Element;
  rightScroller?: Element;
  /** 쪽 요소 선택자. 변경 목록에 "n쪽" 표시 + 스크롤 맞춤을 쪽 단위로 가볍게. 예) '.page' */
  page?: string | null;
  /**
   * 없는 것처럼 건너뛸 감싸개 선택자 (안쪽 내용만 비교). 기본 = page.
   * 쪽 나누기가 버전마다 달라도(앞에 단계가 추가돼 뒤가 다음 쪽으로 밀려도) 내용끼리 비교됨. 끄려면 ''
   */
  flatten?: string;
  /** 비교할 속성. 기본 ['src','href','alt','colspan','rowspan','type'] (+ 입력칸 값은 항상) */
  attrs?: string[];
  /** 비교에서 뺄 요소 선택자 (data-sgc-ignore 속성도 빠짐) */
  ignore?: string;
  /** 스크롤 맞춤 기준점 선택자 */
  anchors?: string;
  /** 항목 짝을 맞출 키 속성. 기본 ['data-sgc-key', 'data-key'] */
  keyAttrs?: string[];
  /** 비교 계산을 Web Worker 에서. 'auto' = 큰 문서만 (기본) */
  worker?: boolean | 'auto';
  /** 화면이 다시 그려지면(React·Vue 갱신, 입력) 자동으로 다시 비교. 기본 false */
  watch?: boolean;
  /** watch 때 기다리는 시간 (ms). 기본 300 */
  debounce?: number;
  /** 좌우 스크롤 맞춤. 기본 true */
  syncScroll?: boolean;
  /** 좌우 높이 맞추기 (추가·삭제 자리에 빈 칸, 수정으로 높이가 다르면 여백). 기본 true. 쪽 문서는 보이는 쪽만 그때그때 */
  align?: boolean;
  /** 빈 칸 문구 언어. 기본 'ko' */
  locale?: 'ko' | 'en' | string;
  /** 'one' (기본): 스크롤 맞춤 중에는 오른쪽 스크롤바만 보임. 'both': 늘 양쪽 */
  scrollbars?: 'one' | 'both';
  /** 만들자마자 비교. 기본 true */
  auto?: boolean;
  /**
   * 쪽 건너뛰기: 화면 밖 쪽을 브라우저가 그리지 않게 모듈이 걸어 준다 (page 가 있을 때). 기본 false.
   * 쪽 하나하나가 무거운 수천 쪽 문서에서 스크롤이 끊길 때만 켠다 (가벼운 쪽에는 오히려 손해).
   * true = 켬, 'auto' = 쪽이 20장 이상일 때만. 고객 CSS 에 이미 있으면 손대지 않고, 모양이 달라지면 스스로 되돌림.
   * 가장 좋은 방법은 화면 CSS 에 처음부터 넣는 것 (docs/04-문서-작성-요령.md)
   */
  virtualize?: boolean | 'auto';
  /** 문서 안에 든 iframe(같은 도메인)의 안쪽 내용도 비교. 기본 true */
  frames?: boolean;
  /** 눈에 안 보이는(display:none) 요소는 비교에서 뺌 (접힌 탭·숨긴 영역). 기본 false */
  visibleOnly?: boolean;
  /** 보안 정책(CSP)이 엄격한 사이트: 모듈이 넣는 <style> 에 붙일 nonce */
  nonce?: string;
  /** 엔진(compare-core) 규칙 덮어쓰기 (고급) */
  rules?: Record<string, unknown>;
}

export type ChangeType = 'added' | 'modified' | 'deleted' | 'moved';

export interface ChangeItem {
  index: number;
  type: ChangeType;
  /** text = 글자 수정, attr = 속성·태그·입력값, node = 덩어리 추가/삭제, moved = 순서 */
  what: 'text' | 'attr' | 'node' | 'moved' | 'column';
  /** what = 'column' 일 때 같은 열의 나머지 칸 */
  extra?: Array<{ node: Node; gap: ChangeItem['gap'] }>;
  count?: number;
  path: string;
  /** 왼쪽·오른쪽 실제 DOM 노드 (없는 쪽은 null) */
  left: Node | null;
  right: Node | null;
  diffs: Array<[-1 | 0 | 1, string]> | null;
  /** 한쪽에만 있을 때 반대쪽 빈자리 */
  gap: { side: 'left' | 'right'; node: Node; end: boolean } | null;
  page: { left: number | null; right: number | null };
  attr?: string;
  before: unknown;
  after: unknown;
  text: { diffs?: Array<[-1 | 0 | 1, string]>; context?: string; attr?: string; before?: unknown; after?: unknown };
}

export interface Timing { snapshot: number; compare: number; paint: number; total: number; nodes: number; worker: boolean }

export interface CompareController {
  readonly changes: ChangeItem[];
  readonly visibleChanges: ChangeItem[];
  readonly stats: Record<ChangeType, number>;
  readonly timing: Timing | null;
  readonly current: number;
  readonly running: boolean;
  readonly error: unknown;
  readonly filter: ChangeType | null;
  syncScroll: boolean;
  /** 두 문서가 한 스크롤 영역 안에 있음 (leftScroller 와 rightScroller 가 같음) — 가장 자연스러운 스크롤 */
  readonly sharedScroll: boolean;
  run(): Promise<void>;
  goTo(index: number, opt?: { smooth?: boolean }): void;
  /** 변경의 실제 내용이 있는 쪽 (삭제·이전 버전에만 있는 것 → 'left'). 한쪽만 보여 주는 화면은 'focus' 때 이쪽으로 바꿔 보여 주면 된다 */
  contentSide(change: ChangeItem): 'left' | 'right';
  next(): void;
  prev(): void;
  setFilter(type: ChangeType | null): void;
  /** 한 장 보기: 새 버전 복사본에 삭제된 것까지 겹쳐 target 안에 그림 (원본은 그대로) */
  renderRedline(target: Element): Element;
  on(ev: 'start' | 'update' | 'error' | 'focus' | 'filter' | 'sync', f: (data: any) => void): () => void;
  off(ev: string, f: (data: any) => void): void;
  clear(): void;
  destroy(): void;
}

export function createCompare(options: CompareOptions): CompareController;

export interface UiOptions { locale?: 'ko' | 'en' | string; labels?: Record<string, unknown>; /** CSP nonce */ nonce?: string }
export function mountToolbar(el: HTMLElement, ctrl: CompareController, o?: UiOptions & { modes?: boolean; mode?: 'side' | 'redline'; onMode?: (m: 'side' | 'redline') => void }): { setMode(m: string): void; destroy(): void };
export function mountChangeList(el: HTMLElement, ctrl: CompareController, o?: UiOptions & { max?: number }): { destroy(): void };

export interface ViewerSource { url?: string; html?: string; label?: string }
export function mountViewer(host: HTMLElement, o: Omit<CompareOptions, 'left' | 'right'> & UiOptions & { left: ViewerSource; right: ViewerSource; height?: string;
  /** 'shared'(기본): 두 iframe 을 한 스크롤 영역에 나란히 / 'split': 따로 스크롤 + 스크롤 맞춤 */
  layout?: 'shared' | 'split';
  /** false = 화면 안의 스크립트를 실행하지 않음 (저장해 둔 화면·받은 파일을 열 때). 기본 true */
  scripts?: boolean }): {
  ready: Promise<CompareController>;
  readonly controller: CompareController | null;
  setMode(m: 'side' | 'redline'): void;
  destroy(): void;
};
export function ensureUiStyle(doc?: Document, nonce?: string): void;
/** 비교 화면 뼈대 (도구 막대 · 두 문서가 나란히 든 한 스크롤 영역 · 변경 목록). 문서는 left / right 안에 그린다 */
export function mountLayout(host: HTMLElement, o?: UiOptions & { leftLabel?: string; rightLabel?: string; height?: string; toolbar?: boolean; list?: boolean; modes?: boolean }): {
  root: HTMLElement; left: HTMLElement; right: HTMLElement; desk: HTMLElement; bar: HTMLElement; list: HTMLElement; redline: HTMLElement;
  attach(ctrl: CompareController): CompareController;
  setMode(m: 'side' | 'redline'): void;
  destroy(): void;
};
/** 비교할 화면 주소 검사 (같은 도메인 http/https 만). 문제가 있으면 오류 */
export function safeUrl(doc: Document, url: string): string;
export function snapshot(root: Source, opt?: { attrs?: string[]; ignore?: string; anchors?: string; keyAttrs?: string[] }): { tree: unknown; nodes: Node[]; anchors: number[]; anchorHashes: string[] };
export function diffTrees(job: unknown): unknown;
export const DOM_RULES: Record<string, unknown>;
export const messages: Record<string, Record<string, unknown>>;
export function getMessages(locale?: string, overrides?: Record<string, unknown>): Record<string, any>;

/** SDK 버전 */
export const version: string;

export interface ReportOptions { title?: string; leftLabel?: string; rightLabel?: string; locale?: 'ko' | 'en' | string; author?: string; version?: string }
/** 비교 결과를 그 자체로 열리는 HTML 보고서 한 장으로 (변경관리 첨부·인쇄·PDF 저장용) */
export function exportReport(ctrl: CompareController, o?: ReportOptions): string;
/** 보고서를 파일로 내려받게. 돌려주는 값 = 파일 이름 */
export function downloadReport(ctrl: CompareController, o?: ReportOptions & { fileName?: string; document?: Document }): string;
