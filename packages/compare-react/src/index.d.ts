import type { ReactNode, RefObject, ForwardRefExoticComponent, RefAttributes } from 'react';
import type { CompareController, CompareOptions, ChangeItem } from '@silvergate/compare-dom';
export * from '@silvergate/compare-dom';

export interface SgCompareProps<T = unknown> {
  left?: T; right?: T;
  renderDoc: (data: T, side: 'left' | 'right') => ReactNode;
  leftLabel?: string; rightLabel?: string; mode?: 'side' | 'redline'; locale?: 'ko' | 'en' | string;
  labels?: Record<string, unknown>; page?: string | null; height?: string; options?: Partial<CompareOptions>;
  toolbar?: boolean; list?: boolean; onUpdate?: (c: CompareController) => void; onFocus?: (c: ChangeItem) => void;
}
export interface SgCompareHandle { controller: CompareController | null; run(): Promise<void> | undefined; next(): void; prev(): void; goTo(i: number): void }
export declare const SgCompare: ForwardRefExoticComponent<SgCompareProps & RefAttributes<SgCompareHandle>>;
export declare function useCompare(left: RefObject<HTMLElement>, right: RefObject<HTMLElement>, options?: Partial<CompareOptions>): CompareController | null;
