// Web Worker: 비교 계산을 화면 스레드 밖에서 (수천 쪽도 화면이 멈추지 않게)
// 화면 쪽은 문서를 평평한 목록으로 나눠 보내고(part), 다 보내면 go 를 보낸다
import { diffTrees } from './engine.js';
import { unflatten } from './snapshot.js';

const jobs = new Map();

self.onmessage = (e) => {
  const d = e.data;
  try {
    if (d.part) {
      let j = jobs.get(d.id);
      if (!j) { j = { left: [], right: [] }; jobs.set(d.id, j); }
      const arr = j[d.part];
      for (let k = 0; k < d.recs.length; k++) arr[d.at + k] = d.recs[k];
      return;
    }
    if (d.go) {
      const j = jobs.get(d.id) ?? { left: [], right: [] };
      jobs.delete(d.id);
      const out = diffTrees({ left: unflatten(j.left), right: unflatten(j.right), leftAnchors: d.leftAnchors, rightAnchors: d.rightAnchors, options: d.options });
      self.postMessage({ id: d.id, ok: true, out }, [out.anchorPairs.buffer]);
      return;
    }
    if (d.job) self.postMessage({ id: d.id, ok: true, out: diffTrees(d.job) });
  } catch (err) {
    jobs.delete(d.id);
    self.postMessage({ id: d.id, ok: false, error: String(err?.stack ?? err) });
  }
};
