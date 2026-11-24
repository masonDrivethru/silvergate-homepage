// 저장한 웹페이지 파일 → 비교 화면(iframe srcdoc)에 넣을 HTML. 브라우저 안에서만 읽고 어디에도 올리지 않는다.
//  - .mhtml / .mht : 크롬·엣지 "웹페이지, 단일 파일". 그림·CSS 가 파일 안에 다 들어 있어 원래 모양 그대로 (권장)
//  - .html / .htm  : "웹페이지, HTML만" → 원래 주소(<!-- saved from url=… -->)를 기준으로 그림·CSS 를 원래 사이트에서 불러옴
//                    "웹페이지, 전체" → 함께 저장된 "_files" 폴더를 같이 넣으면 그 안의 그림·CSS 를 씀
// 스크립트는 실행하지 않는다 (비교 화면 iframe 은 sandbox). 그래서 <script>·<noscript>, 주소 이동·보안 정책 meta 는 뺀다.

const PAGE_RE = /\.(mhtml|mht|html|htm)$/i;
export const isPageFile = (name) => PAGE_RE.test(name);

/**
 * @param {File} file 페이지 파일
 * @param {Array<{file: File, path: string}>} [extras] 함께 넣은 파일들 ("_files" 폴더 안의 그림·CSS)
 * @returns {Promise<{html: string, title: string, url: string, urls: string[]}>} urls 는 다 쓰면 revoke 할 blob 주소
 */
export async function readPageFile(file, extras = []) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const urls = [];
  let html, url = '';
  if (/\.mht(ml)?$/i.test(file.name)) ({ html, url } = fromMhtml(buf, urls));
  else ({ html, url } = await fromHtml(buf, extras, urls));
  html = clean(html);
  const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim()) || file.name;
  return { html, title, url, urls };
}

// ---------------------------------------------------------------- 공통

const latin1 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return s; };
const bytesOf = (bin) => { const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i) & 255; return b; };

function decodeText(bytes, charset) {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return new TextDecoder('utf-8').decode(bytes.subarray(3));
  let cs = charset;
  if (!cs) cs = latin1(bytes.subarray(0, 4096)).match(/<meta[^>]+charset\s*=\s*["']?\s*([\w-]+)/i)?.[1];
  try { return new TextDecoder(cs || 'utf-8').decode(bytes); } catch { return new TextDecoder('utf-8').decode(bytes); }
}

function decodeEntities(s) {
  if (typeof document === 'undefined') return s;
  const t = document.createElement('textarea'); t.innerHTML = s; return t.value;
}

/** 스크립트 없이 보여 줄 HTML 로 */
function clean(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript\s*>/gi, '')
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?\s*(refresh|content-security-policy)[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
}

function addBase(html, href) {
  if (!href || /<base\b/i.test(html)) return html;
  const tag = `<base href="${href.replace(/"/g, '&quot;')}">`;
  return /<head\b[^>]*>/i.test(html) ? html.replace(/<head\b[^>]*>/i, (m) => m + tag) : tag + html;
}

/** 문자열 안의 주소들을 blob 주소로 (긴 주소부터, HTML 속성에 &amp; 로 들어간 것도) */
function replaceUrls(text, map) {
  const keys = [...map.keys()].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const v = map.get(k);
    text = text.split(k).join(v);
    if (k.includes('&')) text = text.split(k.replace(/&/g, '&amp;')).join(v);
  }
  return text;
}

// ---------------------------------------------------------------- MHTML

function header(head, name) {
  const m = head.match(new RegExp(`^${name}:[ \\t]*([^\\r\\n]*(?:\\r?\\n[ \\t]+[^\\r\\n]*)*)`, 'im'));
  return m ? m[1].replace(/\r?\n[ \t]+/g, ' ').trim() : '';
}
const param = (v, name) => v.match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|([^;\\s]+))`, 'i'))?.slice(1).find(Boolean) ?? '';

function qpDecode(s) {
  return s.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function fromMhtml(buf, urls) {
  const bin = latin1(buf);
  const split = bin.search(/\r?\n\r?\n/);
  const top = bin.slice(0, split);
  const boundary = param(header(top, 'Content-Type'), 'boundary');
  if (!boundary) throw new Error('mhtml');
  const pageUrl = header(top, 'Snapshot-Content-Location');
  const parts = [];
  for (const raw of bin.split('--' + boundary).slice(1)) {
    if (raw.startsWith('--')) break;
    const at = raw.search(/\r?\n\r?\n/);
    if (at < 0) continue;
    const head = raw.slice(0, at), sep = raw.slice(at).match(/^\r?\n\r?\n/)[0];
    let body = raw.slice(at + sep.length).replace(/\r?\n$/, '');
    const enc = header(head, 'Content-Transfer-Encoding').toLowerCase();
    if (enc === 'base64') body = atob(body.replace(/\s+/g, ''));
    else if (enc === 'quoted-printable') body = qpDecode(body);
    const ct = header(head, 'Content-Type');
    parts.push({
      type: ct.split(';')[0].trim().toLowerCase() || 'application/octet-stream',
      charset: param(ct, 'charset'),
      loc: header(head, 'Content-Location'),
      cid: header(head, 'Content-ID').replace(/^<|>$/g, ''),
      bytes: bytesOf(body),
    });
  }
  const main = parts.find((p) => p.type === 'text/html');
  if (!main) throw new Error('mhtml');
  const map = new Map();
  const put = (p, blobUrl) => { urls.push(blobUrl); if (p.loc) map.set(p.loc, blobUrl); if (p.cid) map.set('cid:' + p.cid, blobUrl); };
  // 1) 그림·글꼴 2) CSS(안의 url() 을 1번으로) 3) 안쪽 frame HTML 4) 본문
  for (const p of parts) if (p !== main && p.type !== 'text/css' && p.type !== 'text/html') put(p, URL.createObjectURL(new Blob([p.bytes], { type: p.type })));
  for (const p of parts) if (p.type === 'text/css') put(p, URL.createObjectURL(new Blob([replaceUrls(decodeText(p.bytes, p.charset), map)], { type: 'text/css' })));
  for (const p of parts) if (p !== main && p.type === 'text/html') put(p, URL.createObjectURL(new Blob([clean(replaceUrls(decodeText(p.bytes, p.charset), map))], { type: 'text/html' })));
  let html = replaceUrls(decodeText(main.bytes, main.charset), map);
  html = addBase(html, pageUrl || main.loc);
  return { html, url: pageUrl || main.loc };
}

// ---------------------------------------------------------------- HTML (+ "_files" 폴더)

async function fromHtml(buf, extras, urls) {
  let html = decodeText(buf);
  const url = html.match(/<!--\s*saved from url=\(\d+\)(\S+?)\s*-->/i)?.[1] ?? '';
  if (extras.length) {
    // "_files" 폴더 안 파일 이름 → blob. CSS 는 안의 url() 도 같은 폴더 파일로 바꾼 뒤 만든다
    const byName = new Map();
    const css = [];
    for (const x of extras) {
      if (/\.css$/i.test(x.file.name)) { css.push(x); continue; }
      const u = URL.createObjectURL(x.file); urls.push(u); byName.set(x.file.name, u);
    }
    const swap = (text) => text.replace(/((?:["'(=]|url\(\s*["']?))((?:\.\/)?(?:[^"'()\s<>]*?\/)?)([^"'()\s<>\/?#]+)(?=[?#"')\s>])/g,
      (m, pre, dir, name) => { const u = byName.get(safeDecode(name)); return u && (dir === '' || /_files\/$/i.test(dir) || dir === './') ? pre + u : m; });
    for (const x of css) {
      const u = URL.createObjectURL(new Blob([swap(await x.file.text())], { type: 'text/css' })); urls.push(u); byName.set(x.file.name, u);
    }
    html = swap(html);
  }
  html = addBase(html, url);
  return { html, url };
}

const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
