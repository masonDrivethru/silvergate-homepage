/** 기본 문구 (ko / en). labels 로 일부만 바꿀 수 있다 */
export const messages = {
  ko: {
    added: '추가', modified: '수정', deleted: '삭제', moved: '이동',
    changes: '변경 목록', noChanges: '바뀐 곳 없음', running: '비교하는 중…', empty: '(빈 칸)',
    before: '이전', after: '새 버전', side: '나란히', redline: '한 장 보기', sync: '스크롤 맞춤',
    prev: '이전 변경', next: '다음 변경', filterHint: '눌러서 이 종류만 보기',
    column: (n) => `표 열 ${n}칸`, attrNames: { colspan: '가로 병합(colspan)', rowspan: '세로 병합(rowspan)', value: '입력값', src: '그림', href: '링크' },
    nodes: '읽은 요소', took: (s) => `비교 ${s}초`, page: (p) => `${p}쪽`, more: (n) => `${n.toLocaleString()}건 더 보기`,
  },
  en: {
    added: 'Added', modified: 'Modified', deleted: 'Deleted', moved: 'Moved',
    changes: 'Changes', noChanges: 'No differences', running: 'Comparing…', empty: '(empty)',
    before: 'Before', after: 'After', side: 'Side by side', redline: 'Redline', sync: 'Sync scroll',
    prev: 'Previous change', next: 'Next change', filterHint: 'Show only this type',
    column: (n) => `Table column (${n} cells)`, attrNames: { colspan: 'Merge (colspan)', rowspan: 'Merge (rowspan)', value: 'Input value', src: 'Image', href: 'Link' },
    nodes: 'Nodes', took: (s) => `${s}s`, page: (p) => `p.${p}`, more: (n) => `Show ${n.toLocaleString()} more`,
  },
};

export function getMessages(locale, overrides) {
  const base = messages[locale] ?? messages[String(locale ?? '').slice(0, 2)] ?? messages.ko;
  return overrides ? { ...base, ...overrides } : base;
}
