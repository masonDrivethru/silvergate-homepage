// localStorage 래퍼: 비공개 창 등에서 저장소가 막혀 있어도 오류 없이 동작
export const store = {
  get(k: string): string | null {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string): void {
    try { localStorage.setItem(k, v); } catch { /* 저장 불가 환경 */ }
  },
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const CONTACT_EMAIL = 'masonlee@silvergate-solutions.com';
