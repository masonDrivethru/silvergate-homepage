/**
 * SilverBio Compare — 비교 엔진
 *
 * 순수 JavaScript. DOM·프레임워크를 전혀 모른다.
 * MBR 문서 두 버전(JSON)을 받아 ChangeSet 객체만 돌려준다.
 *
 *   import { compare } from './engine.js'
 *   const result = compare(v10, v11, { countBy: 'step' })
 */
import DiffMatchPatch from 'diff-match-patch';

/** @typedef {import('./types.js').MbrDocument} MbrDocument */
/** @typedef {import('./types.js').Group} Group */
/** @typedef {import('./types.js').Step} Step */
/** @typedef {import('./types.js').Param} Param */
/** @typedef {import('./types.js').Change} Change */
/** @typedef {import('./types.js').ChangeSet} ChangeSet */
/** @typedef {import('./types.js').CompareOptions} CompareOptions */

const dmp = new DiffMatchPatch();

/* ------------------------------------------------------------------ */
/*  공개 API                                                           */
/* ------------------------------------------------------------------ */

/**
 * 두 버전을 비교한다.
 * @param {MbrDocument} left   이전 버전
 * @param {MbrDocument} right  새 버전
 * @param {CompareOptions} [options]
 * @returns {ChangeSet}
 */
export function compare(left, right, options = {}) {
  const opts = { countBy: 'step', longTextMin: 20, ...options };
  if (opts.countBy !== 'step' && opts.countBy !== 'param') {
    throw new Error(`countBy must be "step" or "param": ${opts.countBy}`);
  }

  /** @type {Change[]} */
  const changes = [];
  const aligned = matchGroups(left?.groups ?? [], right?.groups ?? []).map((pair) =>
    diffGroup(pair, changes, opts),
  );

  const { groupFlags, stepFlags } = rollup(aligned);

  return {
    stats: countChanges(changes, opts.countBy),
    changes,
    groupFlags,
    stepFlags,
    aligned,
    versions: { left: left?.version ?? '', right: right?.version ?? '' },
  };
}

/**
 * 그룹 매칭: groupId 우선, 없으면 title.
 * @param {Group[]} leftGroups
 * @param {Group[]} rightGroups
 */
export function matchGroups(leftGroups, rightGroups) {
  return matchByKey(leftGroups, rightGroups, (g) => g.groupId || g.title);
}

/**
 * 스텝 단위 비교. 스텝 자체 속성(title, instruction)만 본다.
 * 파라미터는 diffParams()가 따로 본다.
 * @param {Step} l
 * @param {Step} r
 * @returns {{field:string, left:string, right:string}[]}
 */
export function diffStep(l, r) {
  const out = [];
  for (const field of ['title', 'instruction']) {
    const a = l[field] ?? '';
    const b = r[field] ?? '';
    if (a !== b) out.push({ field, left: a, right: b });
  }
  return out;
}

/**
 * 파라미터 단위 비교. 키로 매칭하고, 양쪽에 있으면 어떤 속성이 바뀌었는지 돌려준다.
 * @param {Param[]} leftParams
 * @param {Param[]} rightParams
 * @returns {{key:string, left:Param|null, right:Param|null, status:import('./types.js').ChangeType|null, fields:string[]}[]}
 */
export function diffParams(leftParams, rightParams) {
  return matchByKey(leftParams, rightParams, (p) => p.key).map(({ key, left, right }) => {
    if (!left) return { key, left, right, status: 'added', fields: [] };
    if (!right) return { key, left, right, status: 'deleted', fields: [] };
    const fields = [];
    if ((left.label ?? '') !== (right.label ?? '')) fields.push('label');
    if ((left.value ?? '') !== (right.value ?? '')) fields.push('value');
    if ((left.unit ?? '') !== (right.unit ?? '')) fields.push('unit');
    if (formatSpec(left.spec) !== formatSpec(right.spec)) fields.push('spec');
    return { key, left, right, status: fields.length ? 'modified' : null, fields };
  });
}

/**
 * 하위 변경을 상위로 올린다 (파라미터 → 스텝 → 그룹).
 * 스텝/그룹 자체가 추가·삭제면 그 상태를 그대로 쓰고,
 * 아니면 하위에 변경이 하나라도 있을 때 "modified"로 표시한다.
 * aligned 트리의 status도 함께 채운다.
 * @param {import('./types.js').AlignedGroup[]} aligned
 */
export function rollup(aligned) {
  /** @type {Object<string, import('./types.js').ChangeType>} */
  const groupFlags = {};
  /** @type {Object<string, import('./types.js').ChangeType>} */
  const stepFlags = {};

  for (const g of aligned) {
    for (const s of g.steps) {
      if (!s.status && s.params.some((p) => p.status)) s.status = 'modified';
      if (s.status) stepFlags[`${g.key}/${s.key}`] = s.status;
    }
    if (!g.status && g.steps.some((s) => s.status)) g.status = 'modified';
    if (g.status) groupFlags[g.key] = g.status;
  }
  return { groupFlags, stepFlags };
}

/**
 * 값을 사람이 읽는 한 줄로 만든다: "450 L  [440 ~ 460]"
 * 변경 목록·diff 모두 이 문자열 기준이라 UI와 표기가 어긋나지 않는다.
 * @param {Param|null} p
 */
export function formatParam(p) {
  if (!p) return '';
  const main = [p.value, p.unit].filter((x) => x !== undefined && x !== '').join(' ');
  const spec = formatSpec(p.spec);
  return spec ? `${main}  [${spec}]` : main;
}

/** @param {import('./types.js').Spec} [spec] */
export function formatSpec(spec) {
  if (!spec) return '';
  const has = (n) => typeof n === 'number' && Number.isFinite(n);
  if (has(spec.lcl) && has(spec.ucl)) return `${spec.lcl} ~ ${spec.ucl}`;
  if (has(spec.lcl)) return `≥ ${spec.lcl}`;
  if (has(spec.ucl)) return `≤ ${spec.ucl}`;
  return '';
}

/* ------------------------------------------------------------------ */
/*  내부                                                               */
/* ------------------------------------------------------------------ */

/**
 * 키로 양쪽 목록을 짝짓고, 문서 순서를 유지한 하나의 목록으로 합친다.
 * 오른쪽(새 버전) 순서를 기준으로 하고, 왼쪽에만 있는 항목은
 * 왼쪽에서 앞에 있던 짝 바로 뒤에 끼워 넣는다.
 * 같은 키가 한쪽에 두 번 나오면 "키#2"처럼 구분한다.
 * @template T
 * @param {T[]} leftArr
 * @param {T[]} rightArr
 * @param {(item:T) => string} keyFn
 * @returns {{key:string, left:T|null, right:T|null}[]}
 */
function matchByKey(leftArr, rightArr, keyFn) {
  const L = withUniqueKeys(leftArr ?? [], keyFn);
  const R = withUniqueKeys(rightArr ?? [], keyFn);
  const leftMap = new Map(L.map((x) => [x.key, x.item]));
  const rightKeys = new Set(R.map((x) => x.key));

  const out = [];
  let li = 0;
  const flushLeftOnly = (untilKey) => {
    // 다음 공통 키를 만날 때까지 왼쪽 전용 항목을 내보낸다
    while (li < L.length && L[li].key !== untilKey) {
      if (!rightKeys.has(L[li].key)) out.push({ key: L[li].key, left: L[li].item, right: null });
      li++;
    }
    if (li < L.length && L[li].key === untilKey) li++;
  };

  for (const { key, item } of R) {
    if (leftMap.has(key)) {
      flushLeftOnly(key);
      out.push({ key, left: leftMap.get(key), right: item });
    } else {
      out.push({ key, left: null, right: item });
    }
  }
  flushLeftOnly(undefined); // 남은 왼쪽 전용 항목
  return out;
}

/** @template T @param {T[]} arr @param {(item:T)=>string} keyFn */
function withUniqueKeys(arr, keyFn) {
  const seen = new Map();
  return arr.map((item) => {
    const base = String(keyFn(item) ?? '');
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { key: n === 1 ? base : `${base}#${n}`, item };
  });
}

/** DOM id로 쓸 수 있게 공백 등을 정리 */
function anchor(...parts) {
  return parts
    .filter((p) => p !== null && p !== undefined && p !== '')
    .map((p) => String(p).replace(/\s+/g, '_'))
    .join('-');
}

/** 수정된 값의 문자 단위 diff (짧으면 그대로, 길면 의미 단위로 정리) */
function textDiff(a, b, longTextMin) {
  const diffs = dmp.diff_main(a, b);
  if (Math.max(a.length, b.length) >= longTextMin) dmp.diff_cleanupSemantic(diffs);
  else dmp.diff_cleanupEfficiency(diffs);
  return diffs.map(([op, text]) => [op, text]);
}

function diffGroup({ key, left, right }, changes, opts) {
  const groupTitle = right?.title ?? left?.title ?? key;
  const node = {
    key,
    left,
    right,
    status: !left ? 'added' : !right ? 'deleted' : null,
    steps: [],
    anchorId: anchor(key),
  };

  if (node.status) {
    changes.push(makeChange({ type: node.status, level: 'group', groupId: key, groupTitle,
      label: groupTitle, left: left ? groupTitle : null, right: right ? groupTitle : null,
      anchorId: node.anchorId }));
  } else if ((left.title ?? '') !== (right.title ?? '')) {
    node.status = 'modified';
    changes.push(makeChange({ type: 'modified', level: 'group', groupId: key, groupTitle,
      field: 'title', label: groupTitle, left: left.title, right: right.title,
      diffs: textDiff(left.title ?? '', right.title ?? '', opts.longTextMin), anchorId: node.anchorId }));
  }

  const stepPairs = matchByKey(left?.steps ?? [], right?.steps ?? [], (s) => s.stepId || s.title);
  node.steps = stepPairs.map((pair) => diffStepNode(pair, { key, groupTitle, groupStatus: node.status }, changes, opts));
  return node;
}

function diffStepNode({ key, left, right }, grp, changes, opts) {
  const stepTitle = right?.title ?? left?.title ?? key;
  const base = { groupId: grp.key, groupTitle: grp.groupTitle, stepId: key, stepTitle };
  const node = {
    key,
    left,
    right,
    status: !left ? 'added' : !right ? 'deleted' : null,
    params: [],
    anchorId: anchor(grp.key, key),
  };
  const groupWhole = grp.groupStatus === 'added' || grp.groupStatus === 'deleted';

  if (node.status) {
    // 그룹째 추가/삭제된 경우 하위 스텝은 그룹 1건에 포함 — 변경 목록에 따로 넣지 않는다
    if (!groupWhole) {
      changes.push(makeChange({ ...base, type: node.status, level: 'step', label: stepTitle,
        left: left ? stepTitle : null, right: right ? stepTitle : null, anchorId: node.anchorId }));
    }
  } else {
    for (const d of diffStep(left, right)) {
      node.status = 'modified';
      changes.push(makeChange({ ...base, type: 'modified', level: 'step', field: d.field,
        label: stepTitle, left: d.left, right: d.right,
        diffs: textDiff(d.left, d.right, opts.longTextMin), anchorId: node.anchorId }));
    }
  }

  node.params = diffParams(left?.params ?? [], right?.params ?? []).map((p) => {
    const anchorId = anchor(grp.key, key, p.key);
    // 스텝째 추가/삭제면 하위 파라미터는 같은 상태로 표시만 하고 목록에는 넣지 않는다
    if (node.status === 'added' || node.status === 'deleted') {
      return { key: p.key, left: p.left, right: p.right, status: node.status, anchorId };
    }
    if (p.status) {
      const prm = p.right ?? p.left;
      const l = p.left ? formatParam(p.left) : null;
      const r = p.right ? formatParam(p.right) : null;
      changes.push(makeChange({ ...base, type: p.status, level: 'param', paramKey: p.key,
        field: p.status === 'modified' ? p.fields.join(',') : null, fields: p.fields,
        label: prm.label ?? p.key, left: l, right: r,
        diffs: p.status === 'modified' ? textDiff(l, r, opts.longTextMin) : null, anchorId }));
    }
    return { key: p.key, left: p.left, right: p.right, status: p.status, anchorId };
  });

  return node;
}

/** 빠진 속성을 null로 채워 항상 같은 모양을 돌려준다 */
function makeChange(c) {
  return {
    type: c.type,
    level: c.level,
    groupId: c.groupId,
    groupTitle: c.groupTitle,
    stepId: c.stepId ?? null,
    stepTitle: c.stepTitle ?? null,
    paramKey: c.paramKey ?? null,
    field: c.field ?? null,
    ...(c.fields ? { fields: c.fields } : {}),
    label: c.label,
    left: c.left ?? null,
    right: c.right ?? null,
    diffs: c.diffs ?? null,
    anchorId: c.anchorId,
  };
}

/**
 * 집계. 같은 단위의 변경은 한 번만 센다.
 *  - countBy "param": 변경 목록 1건 = 1
 *  - countBy "step" : 같은 스텝의 변경은 묶어서 1. 그룹 단위 추가/삭제/이름변경은 그룹 1건.
 *    스텝 자체가 추가/삭제면 그 상태로, 아니면 수정으로 센다.
 */
function countChanges(changes, countBy) {
  const stats = { added: 0, modified: 0, deleted: 0 };
  if (countBy === 'param') {
    for (const c of changes) stats[c.type]++;
    return stats;
  }
  const units = new Map();
  for (const c of changes) {
    const unit = c.level === 'group' ? `g:${c.groupId}` : `s:${c.groupId}/${c.stepId}`;
    const isWhole = c.level !== 'param' && c.type !== 'modified';
    const prev = units.get(unit);
    // 스텝째 추가/삭제가 수정보다 우선
    if (!prev || (isWhole && prev === 'modified')) units.set(unit, isWhole ? c.type : 'modified');
  }
  for (const t of units.values()) stats[t]++;
  return stats;
}
