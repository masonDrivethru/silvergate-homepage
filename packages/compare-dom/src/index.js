// @silvergate/compare-dom — 브라우저에 그려진 화면 두 개를 원본 그대로 두고 바뀐 곳만 표시 (JSP·Vue·React·HTML 무관)
export { createCompare } from './controller.js';
export { mountToolbar, mountChangeList, mountViewer, ensureUiStyle } from './ui.js';
export { snapshot } from './snapshot.js';
export { diffTrees, DOM_RULES } from './engine.js';
export { messages, getMessages } from './messages.js';
/** SDK 버전 */
export const version = '1.0.0';
