/**
 * 범용 JSON 비교. 문서 종류를 모른다: 어떤 모양의 JSON이든 두 버전을 받아 바뀐 곳을 돌려준다.
 * 문서 종류별 차이(배열 짝 맞추는 키, 뺄 필드, 이름 표시 등)는 rules 로 받는다.
 */
import { toPath, toPattern, makeMatcher, stableHash } from './path.js';
import { matchKeyed, matchKeyless } from './match.js';
import { textDiff } from './text.js';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const AUTO_KEYS = ['id', 'key', 'uuid', 'code'];
const TITLE_FIELDS = ['title', 'name', 'label', 'heading'];
/** 상태 우선순위: 한 위치에 여러 상태가 겹치면 큰 쪽 */
const RANK = { child: 1, moved: 2, modified: 3, added: 4, deleted: 4 };

/**
 * @param {*} left   이전 버전
 * @param {*} right  새 버전
 * @param {import('./types.js').CompareRules} [rules]
 * @returns {import('./types.js').DiffResult}
 */
export function compare(left, right, rules = {}) {
  const opt = { textMin: 20, detectMoves: true, numeric: false, whitespace: false, ...rules };
  const find = {
    keys: makeMatcher(opt.keys),
    ignore: makeMatcher(opt.ignore),
    titles: makeMatcher(opt.titles),
    labels: makeMatcher(opt.labels),
    equals: makeMatcher(opt.equals),
    similar: makeMatcher(opt.similar),
    identity: makeMatcher(opt.identity),
    units: makeMatcher(opt.countBy),
  };
  const ignored = (pat) => !!find.ignore(pat);

  /** @type {import('./types.js').Change[]} */
  const changes = [];
  /** 경로 → { status, own } */
  const nodes = new Map();
  /** 원본 객체 → 경로 (화면에서 v-diff="step" 처럼 객체만 넘겨도 위치를 찾게) */
  const paths = new WeakMap();
  const remember = (v, path) => { if (v && typeof v === 'object') paths.set(v, path); };
  /** 배열 → 순번별 항목 id (문자열 배열처럼 객체가 아닌 항목도 pathOf(배열, 순번)으로 찾게) */
  const itemIds = new WeakMap();
  const setNode = (path, status, own) => {
    const cur = nodes.get(path);
    if (!cur || RANK[status] > RANK[cur.status] || (own && !cur.own && RANK[status] >= RANK[cur.status])) nodes.set(path, { status, own });
  };

  // ---------- 배열 항목 키 ----------
  function keyRule(pat, L, R) {
    const rule = find.keys(pat);
    if (rule === false) return null;                                  // 키 없이 비교하라고 지정
    if (typeof rule === 'function') {
      // 함수가 어느 항목에든 null/undefined 를 돌려주면 그 배열은 키 없이 비교 (키가 일부에만 있는 경우)
      const ok = [L, R].every((arr) => arr.every((x, i) => { const k = rule(x, i); return k !== null && k !== undefined; }));
      return ok ? rule : null;
    }
    if (typeof rule === 'string' || Array.isArray(rule)) {
      const fields = Array.isArray(rule) ? rule : [rule];
      return (item, idx) => {
        if (!isObj(item)) return String(item);
        for (const f of fields) if (item[f] !== undefined && item[f] !== null && item[f] !== '') return String(item[f]);
        return `#${idx}`;
      };
    }
    // 지정이 없으면: 양쪽 모든 항목에 id/key/uuid/code 중 하나가 겹치지 않게 있으면 그걸 쓴다
    const all = [...L, ...R];
    if (!all.length || !all.every(isObj)) return null;
    for (const f of AUTO_KEYS) {
      const ok = [L, R].every((arr) => {
        const seen = new Set();
        return arr.every((x) => x[f] !== undefined && x[f] !== null && !seen.has(x[f]) && seen.add(x[f]));
      });
      if (ok) return (item) => String(item[f]);
    }
    return null;
  }

  /** 키 없는 배열의 "똑같음" 판정용 글자. identity 규칙이 있으면 그것(예: 미리 계산한 해시), 없으면 값 전체 */
  function hashFn(itemPat) {
    const id = find.identity(itemPat);
    const full = (x) => stableHash(x, (p) => ignored(`${itemPat}${p ? '.' + p : ''}`));
    if (typeof id !== 'function') return full;
    return (x) => { const h = id(x); return h === undefined || h === null ? full(x) : 'id:' + h; };
  }

  function similarFn(itemPat) {
    const rule = find.similar(itemPat);
    return typeof rule === 'function' ? rule : null;
  }

  function titleOf(item, pat, id) {
    const rule = find.titles(pat);
    if (typeof rule === 'function') return String(rule(item) ?? id);
    if (typeof rule === 'string' && isObj(item) && item[rule] != null) return String(item[rule]);
    if (isObj(item)) for (const f of TITLE_FIELDS) if (typeof item[f] === 'string' && item[f]) return item[f];
    return isObj(item) || Array.isArray(item) ? id : String(item);
  }

  function labelOf(pat, segs, fallback, change) {
    const rule = find.labels(pat);
    if (typeof rule === 'function') return String(rule(change));
    if (typeof rule === 'string') return rule;
    const last = segs[segs.length - 1];
    return fallback ?? (last ? ('k' in last ? last.k : last.i) : '');
  }

  function equalLeaf(a, b, pat) {
    const rule = find.equals(pat);
    if (typeof rule === 'function') return !!rule(a, b);
    if (Object.is(a, b)) return true;
    if (opt.numeric && a !== '' && b !== '' && a !== null && b !== null && !isNaN(Number(a)) && !isNaN(Number(b))) return Number(a) === Number(b);
    if (opt.whitespace && typeof a === 'string' && typeof b === 'string') return a.trim().replace(/\s+/g, ' ') === b.trim().replace(/\s+/g, ' ');
    return false;
  }

  /** 추가·삭제된 덩어리 안쪽도 경로를 등록 (화면에서 안쪽 요소에 v-diff 를 달아도 상태가 나오게) */
  function registerTree(v, segs, status) {
    const path = toPath(segs);
    remember(v, path);
    setNode(path, status, false);
    const pat = toPattern(segs);
    if (Array.isArray(v)) {
      const keyOf = keyRule(pat, v, []) ?? ((_x, i) => (status === 'deleted' ? `#~${i}` : `#${i}`));
      const ids = new Map(), list = [];
      v.forEach((x, i) => {
        let id = String(keyOf(x, i)); const n = (ids.get(id) ?? 0) + 1; ids.set(id, n); if (n > 1) id += `#${n}`;
        list.push(id);
        registerTree(x, [...segs, { i: id }], status);
      });
      itemIds.set(v, list);
    } else if (isObj(v)) {
      for (const k of Object.keys(v)) if (!ignored(toPattern([...segs, { k }]))) registerTree(v[k], [...segs, { k }], status);
    }
  }

  /**
   * 한 위치 비교. 합친 값(merged)을 돌려준다: 삭제된 것도 남긴 한 장짜리 문서용
   * @param {{path:string, pattern:string}[]} anc  조상 위치 (문서 위쪽부터)
   */
  function visit(l, r, hasL, hasR, segs, crumbs, anc, lr, rr, gap) {
    const path = toPath(segs), pattern = toPattern(segs);
    const base = { path, pattern, crumbs: crumbs.slice(), ancestors: anc.map((a) => a.path), ancestorPatterns: anc.map((a) => a.pattern) };
    if (opt.raw) base.at = { left: hasL ? lr : null, right: hasR ? rr : null, ...(gap ? { gap } : {}) };
    const push = (c) => { const ch = { ...base, ...c }; ch.label = labelOf(pattern, segs, c.label, ch); changes.push(ch); setNode(path, ch.type, true); };

    if (!hasL && !hasR) return undefined;
    if (!hasL) { registerTree(r, segs, 'added'); push({ type: 'added', kind: kindOf(r), left: undefined, right: r, diffs: null }); return r; }
    if (!hasR) { registerTree(l, segs, 'deleted'); push({ type: 'deleted', kind: kindOf(l), left: l, right: undefined, diffs: null }); return l; }
    remember(l, path); remember(r, path);

    // 같다고 미리 알 수 있으면(identity 가 같음) 안쪽은 보지 않는다: 큰 문서에서 바뀌지 않은 부분을 건너뜀
    const idf = find.identity(pattern);
    if (typeof idf === 'function' && l && r && typeof l === 'object' && typeof r === 'object') {
      const a = idf(l);
      if (a !== undefined && a !== null && a === idf(r)) return r;
    }

    if (Array.isArray(l) && Array.isArray(r)) {
      const keyOf = keyRule(pattern, l, r);
      const pairs = keyOf
        ? matchKeyed(l, r, keyOf, opt.detectMoves)
        : matchKeyless(l, r, hashFn(pattern ? `${pattern}.*` : '*'), similarFn(pattern ? `${pattern}.*` : '*'));
      const merged = [];
      const itemPat = pattern ? `${pattern}.*` : '*';
      const lIds = new Array(l.length), rIds = new Array(r.length), mIds = [];
      // 삭제된 항목이 오른쪽에서 어디 앞에 있었는지 (다음에 오는 오른쪽 항목 순번, 없으면 끝)
      const nextR = new Array(pairs.length), nextL = new Array(pairs.length);
      if (opt.raw) {
        for (let k = pairs.length - 1, n = r.length; k >= 0; k--) { nextR[k] = n; if (pairs[k].hasR) n = pairs[k].ri; }
        for (let k = pairs.length - 1, n = l.length; k >= 0; k--) { nextL[k] = n; if (pairs[k].hasL && !pairs[k].moved) n = pairs[k].li; }
      }
      let pk = -1;
      for (const p of pairs) {
        pk++;
        if (p.hasL) lIds[p.li] = p.id;
        if (p.hasR) rIds[p.ri] = p.id;
        mIds.push(p.id);
        const item = p.hasR ? p.r : p.l;
        const seg = { i: p.id };
        const nextSegs = [...segs, seg];
        const title = titleOf(item, itemPat, p.id);
        const nextAnc = [...anc, { path, pattern }];
        if (p.moved) {
          const ipath = toPath(nextSegs);
          const mc = { path: ipath, pattern: itemPat, crumbs: [...crumbs, title], ancestors: nextAnc.map((a) => a.path), ancestorPatterns: nextAnc.map((a) => a.pattern),
            type: 'moved', kind: 'node', label: title, left: p.li + 1, right: p.ri + 1, diffs: null };
          if (opt.raw) mc.at = { left: [...lr, p.li], right: [...rr, p.ri] };
          changes.push(mc);
          setNode(ipath, 'moved', true);
        }
        const m = visit(p.l, p.r, p.hasL, p.hasR, nextSegs, [...crumbs, title], nextAnc,
          opt.raw && p.hasL ? [...lr, p.li] : null, opt.raw && p.hasR ? [...rr, p.ri] : null,
          !opt.raw ? null : !p.hasR ? { side: 'right', parent: rr, index: nextR[pk] } : !p.hasL ? { side: 'left', parent: lr, index: nextL[pk] } : null);
        if (m && typeof m === 'object') remember(m, toPath(nextSegs));
        merged.push(m);
      }
      itemIds.set(l, lIds); itemIds.set(r, rIds); itemIds.set(merged, mIds);
      return merged;
    }

    if (isObj(l) && isObj(r)) {
      const merged = {};
      const keys = [...Object.keys(r), ...Object.keys(l).filter((k) => !hasOwn(r, k))];
      for (const k of keys) {
        const nextSegs = [...segs, { k }];
        if (ignored(toPattern(nextSegs))) { merged[k] = hasOwn(r, k) ? r[k] : l[k]; continue; }
        const m = visit(l[k], r[k], hasOwn(l, k), hasOwn(r, k), nextSegs, crumbs, [...anc, { path, pattern }],
          opt.raw ? [...lr, k] : null, opt.raw ? [...rr, k] : null, null);
        if (m && typeof m === 'object') remember(m, toPath(nextSegs));
        merged[k] = m;
      }
      return merged;
    }

    // 값 (또는 모양이 달라짐: 객체 ↔ 값)
    if (equalLeaf(l, r, pattern)) return r;
    const prim = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);
    const diffs = prim(l) && prim(r) && l !== null && r !== null ? textDiff(String(l), String(r), opt.textMin) : null;
    push({ type: 'modified', kind: prim(l) && prim(r) ? 'value' : 'node', left: l, right: r, diffs });
    return r;
  }

  const merged = visit(left, right, left !== undefined, right !== undefined, [], [], [], [], [], null);

  // 롤업: 바뀐 곳의 조상은 모두 "안쪽에 변경 있음(child)"
  for (const c of changes) for (const a of c.ancestors) setNode(a, 'child', false);

  const result = {
    stats: countChanges(changes, find.units),
    changes,
    nodes: Object.fromEntries(nodes),
    merged,
    pathOf: (target, field) => {
      const p = typeof target === 'string' ? target : paths.get(target);
      if (p === undefined) return null;
      if (field === undefined) return p;
      if (typeof field === 'number') {
        const id = Array.isArray(target) ? itemIds.get(target)?.[field] : undefined;
        return id === undefined ? null : `${p}[${String(id).replace(/[\\[\]]/g, (m) => '\\' + m)}]`;
      }
      return `${p}${p ? '.' : ''}${field}`;
    },
    statusOf: (target, field) => {
      const p = result.pathOf(target, field);
      const n = p === null ? undefined : nodes.get(p);
      return n ? n.status : null;
    },
    changesAt: (target, field) => {
      const p = result.pathOf(target, field);
      return p === null ? [] : changes.filter((c) => c.path === p);
    },
  };
  return result;
}

function kindOf(v) { return v !== null && typeof v === 'object' ? 'node' : 'value'; }

/**
 * 집계. countBy 가 없으면 변경 1건 = 1. 있으면 그 패턴에 맞는 가장 가까운 위치(예: 스텝) 단위로 묶어 센다.
 * 단위 자체가 추가·삭제면 그 상태, 순서만 바뀌었으면 moved, 그 밖은 modified
 */
function countChanges(changes, unitOf) {
  const stats = { added: 0, modified: 0, deleted: 0, moved: 0 };
  const units = new Map();
  for (const c of changes) {
    let unit = c.path, isSelf = true;
    if (unitOf(c.pattern) === undefined) {
      unit = null;
      for (let i = c.ancestors.length - 1; i >= 0; i--) {
        if (unitOf(c.ancestorPatterns[i]) !== undefined) { unit = c.ancestors[i]; isSelf = false; break; }
      }
      if (unit === null) { unit = c.path; isSelf = true; }
    }
    const t = isSelf ? c.type : 'modified';
    const prev = units.get(unit);
    if (!prev || RANK[t] > RANK[prev]) units.set(unit, t);
  }
  for (const t of units.values()) stats[t]++;
  return stats;
}
