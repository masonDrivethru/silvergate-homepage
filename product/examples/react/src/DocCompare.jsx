import { useRef } from 'react';
import { SgCompare } from '@silvergate/compare-react';

// 고객사가 이미 가진 문서 화면 컴포넌트
function MyDocument({ doc }) {
  if (!doc) return null;
  return (
    <section className="page">
      <h2>{doc.title}</h2>
      <table><tbody>
        <tr><th>단계</th><th>지시</th></tr>
        {doc.steps.map((s) => (
          <tr key={s.id} data-sgc-key={s.id}><td>{s.name}</td><td>{s.text}</td></tr>
        ))}
      </tbody></table>
    </section>
  );
}

export default function DocCompare({ before, after }) {
  const cmp = useRef(null);
  return (
    <SgCompare ref={cmp} left={before} right={after}
      leftLabel={before?.version} rightLabel={after?.version}
      renderDoc={(doc) => <MyDocument doc={doc} />}
      page=".page" locale="ko" height="80vh"
      onUpdate={(ctrl) => console.log('변경', ctrl.stats)} />
  );
}
