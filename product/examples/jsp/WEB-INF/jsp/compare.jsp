<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>문서 비교</title>
<style>body{margin:0;font:14px/1.6 sans-serif;background:#f4f5f7}.wrap{padding:16px}</style>
</head>
<body>
<div class="wrap"><div id="viewer"></div></div>

<script src="${pageContext.request.contextPath}/static/sg-compare/sg-compare.min.js"></script>
<%-- CSP nonce 를 쓰는 경우: <script nonce="${cspNonce}"> 로 바꾸고 아래 nonce 옵션도 넘긴다 --%>
<script>
  (function () {
    var ctx = '${pageContext.request.contextPath}';
    SgCompare.mountViewer(document.getElementById('viewer'), {
      left:  { url: ctx + '${fn:escapeXml(leftUrl)}',  label: '${fn:escapeXml(leftLabel)}' },
      right: { url: ctx + '${fn:escapeXml(rightUrl)}', label: '${fn:escapeXml(rightLabel)}' },
      page: '.page',      // 화면의 쪽 요소 선택자 (없으면 지움)
      locale: 'ko',
      height: 'calc(100vh - 32px)'
      // nonce: '${cspNonce}'
    });
  })();
</script>
</body>
</html>
