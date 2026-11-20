import type { DefineComponent, Ref, ShallowRef, Plugin } from 'vue';
import type { CompareController, CompareOptions } from '@silvergate/compare-dom';
export * from '@silvergate/compare-dom';

export declare const SgCompare: DefineComponent<{
  left?: unknown; right?: unknown; leftLabel?: string; rightLabel?: string;
  mode?: 'side' | 'redline'; locale?: 'ko' | 'en' | string; labels?: Record<string, unknown>;
  page?: string | null; height?: string; options?: Partial<CompareOptions>; toolbar?: boolean; list?: boolean;
}>;
export declare function useCompare(left: Ref<HTMLElement | undefined>, right: Ref<HTMLElement | undefined>, options?: Partial<CompareOptions>): { controller: ShallowRef<CompareController | null> };
declare const plugin: Plugin;
export default plugin;
