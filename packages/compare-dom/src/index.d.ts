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
  /** 'one' (기본): 스크롤 맞춤 중에는 오른쪽 스크롤바만 보임. 'both': 늘 양쪽 */
  scrollbars?: 'one' | 'both';
  /** 만들자마자 비교. 기본 true */
  auto?: boolean;
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
  run(): Promise<void>;
  goTo(index: number, opt?: { smooth?: boolean }): void;
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

export interface UiOptions { locale?: 'ko' | 'en' | string; labels?: Record<string, unknown> }
export function mountToolbar(el: HTMLElement, ctrl: CompareController, o?: UiOptions & { modes?: boolean; mode?: 'side' | 'redline'; onMode?: (m: 'side' | 'redline') => void }): { setMode(m: string): void; destroy(): void };
export function mountChangeList(el: HTMLElement, ctrl: CompareController, o?: UiOptions & { max?: number }): { destroy(): void };

export interface ViewerSource { url?: string; html?: string; label?: string }
export function mountViewer(host: HTMLElement, o: Omit<CompareOptions, 'left' | 'right'> & UiOptions & { left: ViewerSource; right: ViewerSource; height?: string }): {
  ready: Promise<CompareController>;
  readonly controller: CompareController | null;
  setMode(m: 'side' | 'redline'): void;
  destroy(): void;
};
export function ensureUiStyle(doc?: Document): void;
export function snapshot(root: Source, opt?: { attrs?: string[]; ignore?: string; anchors?: string; keyAttrs?: string[] }): { tree: unknown; nodes: Node[]; anchors: number[]; anchorHashes: string[] };
export function diffTrees(job: unknown): unknown;
export const DOM_RULES: Record<string, unknown>;
export const messages: Record<string, Record<string, unknown>>;
export function getMessages(locale?: string, overrides?: Record<string, unknown>): Record<string, any>;
