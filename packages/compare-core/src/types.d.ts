// @silvergate/compare-core 타입

/** 패턴: 배열 항목·아무 키 하나는 *, 여러 단계는 **  예) 'sections.*.items', '**.updatedAt' */
export type Pattern = string;

export type ChangeType = 'added' | 'modified' | 'deleted' | 'moved';
/** 화면 표시용 상태. child = 자기는 그대로지만 안쪽에 변경이 있음 */
export type NodeStatus = ChangeType | 'child';
export type DiffOp = [-1 | 0 | 1, string];

export interface Change {
  type: ChangeType;
  /** value = 값 하나가 바뀜, node = 객체·배열 덩어리가 추가/삭제/이동 */
  kind: 'value' | 'node';
  /** 키 기반 경로. 예) sections[S2].items[3.1].text */
  path: string;
  /** 규칙 패턴. 예) sections.*.items.*.text */
  pattern: string;
  /** 위쪽 항목들의 제목 (변경 목록에 "구간 › 항목" 처럼 표시) */
  crumbs: string[];
  /** 무엇이 바뀌었나 (labels 규칙 또는 필드 이름·항목 제목) */
  label: string;
  left: unknown;
  right: unknown;
  /** 값이 바뀐 경우 글자 단위 diff */
  diffs: DiffOp[] | null;
  /** 조상 경로 (문서 위쪽부터) */
  ancestors: string[];
  ancestorPatterns: string[];
  /**
   * rules.raw 일 때만: 양쪽 원본 안의 실제 위치 (객체 키·배열 순번 목록). 없는 쪽은 null.
   * gap: 한쪽에만 있는 배열 항목이 반대쪽에서는 어느 항목 앞 자리인지 (삭제 → side 'right', 추가 → side 'left').
   *      parent = 반대쪽 배열 위치, index = 그 배열에서 앞에 올 항목 순번 (끝이면 길이)
   */
  at?: { left: Array<string | number> | null; right: Array<string | number> | null; gap?: { side: 'left' | 'right'; parent: Array<string | number>; index: number } };
}

export interface CompareRules {
  /**
   * 배열 항목의 짝을 맞출 키. 패턴 → 필드 이름 | 필드 이름 목록(앞에서부터 있는 것) | 함수 | false(키 없이 비교)
   * 지정이 없으면 id/key/uuid/code 를 자동으로 찾고, 없으면 같은 항목 기준(LCS) + 자리끼리 비교
   */
  keys?: Record<Pattern, string | string[] | ((item: any, index: number) => string) | false>;
  /** 비교에서 뺄 위치. 예) ['**.updatedAt', '**.updatedBy'] */
  ignore?: Pattern[] | Pattern;
  /** 배열 항목의 제목으로 쓸 필드 (변경 목록 표시용). 기본: title/name/label/heading */
  titles?: Record<Pattern, string | ((item: any) => string)>;
  /** 변경 목록에 보일 이름. 예) { 'sections.*.items.*.value': '설정값' } */
  labels?: Record<Pattern, string | ((change: Change) => string)>;
  /** 같다고 볼 기준을 위치별로. 예) { '**.amount': (a, b) => Number(a) === Number(b) } */
  equals?: Record<Pattern, (a: unknown, b: unknown) => boolean>;
  /**
   * 키 없는 배열에서 기준점(똑같은 항목) 사이에 남은 항목을 비슷한 것끼리 짝짓는 함수 (0~1, 0.5 이상이면 "수정").
   * 없으면 자리끼리 짝. 예) { 'blocks.*': (a, b) => a.type === b.type ? 0.8 : 0 }
   */
  similar?: Record<Pattern, (a: any, b: any) => number>;
  /**
   * 같은지 빨리 판정할 글자 (예: 미리 계산한 해시). 양쪽이 같으면 안쪽은 비교하지 않고 건너뛴다 (큰 문서용).
   * 건너뛴 안쪽은 pathOf/statusOf 로 찾을 수 없다 (바뀐 곳이 없으므로 표시할 것도 없음). 예) { '**': (n) => n?.h }
   */
  identity?: Record<Pattern, (item: any) => string | number | undefined | null>;
  /** 변경마다 양쪽 원본 안의 실제 위치(at)를 적는다. 기본 false */
  raw?: boolean;
  /** 집계 단위. 예) 'groups.*.steps.*' → 스텝 하나에 변경이 여러 개여도 1건 */
  countBy?: Pattern[] | Pattern;
  /** 숫자 표기 차이 무시 ("36.0" = 36). 기본 false (정밀도 변경도 변경으로 봄) */
  numeric?: boolean;
  /** 앞뒤·연속 공백 차이 무시. 기본 false */
  whitespace?: boolean;
  /** 순서 바뀜(moved) 찾기. 기본 true */
  detectMoves?: boolean;
  /** 이 길이 이상인 글은 단어 단위로 정리해서 diff. 기본 20 */
  textMin?: number;
}

export interface DiffResult {
  stats: { added: number; modified: number; deleted: number; moved: number };
  /** 문서 순서대로 */
  changes: Change[];
  /** 경로 → 상태 (바뀐 곳과 그 조상, 추가·삭제된 덩어리 안쪽 전부) */
  nodes: Record<string, { status: NodeStatus; own: boolean }>;
  /** 두 버전을 합친 값: 삭제된 것도 남아 있어 한 장짜리 "빨간 줄" 문서를 그릴 때 사용 */
  merged: unknown;
  /**
   * 원본(left·right·merged 안의) 객체 또는 경로 → 경로. field 를 주면 그 필드의 경로.
   * target 이 배열이고 field 가 숫자면 그 순번 항목의 경로 (문자열 배열 등 객체가 아닌 항목용)
   */
  pathOf(target: object | string, field?: string | number): string | null;
  statusOf(target: object | string, field?: string | number): NodeStatus | null;
  changesAt(target: object | string, field?: string | number): Change[];
}

export function compare(left: unknown, right: unknown, rules?: CompareRules): DiffResult;
export function textDiff(a: string, b: string, longMin?: number): DiffOp[];
export function formatValue(v: unknown, max?: number): string;
export function toPath(segs: Array<{ k: string } | { i: string }>): string;
export function toPattern(segs: Array<{ k: string } | { i: string }>): string;
export function makeMatcher<T>(spec: Record<string, T> | string[] | string | undefined): (pattern: string) => T | true | undefined;
/** 두 해시(글자) 목록에서 짝이 맞는 [왼쪽 순번, 오른쪽 순번] 목록 (LCS, 긴 목록은 Myers) */
export function alignSequences(left: string[], right: string[]): Array<[number, number]>;
