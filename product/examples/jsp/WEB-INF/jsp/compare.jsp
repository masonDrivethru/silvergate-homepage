<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>문서 비교</title>
<style>body{margin:0;font:14px/1.6 sans-serif;background:#f4f5f7}.wrap{padding:16px}</style>
</head>
<body>
<%--
  서버 값은 HTML 속성(data-*)에 담는다. <c:out> 이 HTML 속성에 맞게 바꿔 주므로 주소의 & 나 따옴표가 있어도 안전하다.
  (스크립트 안에 ${...} 를 직접 쓰면 & 가 &amp; 로 바뀌어 주소가 깨지고, 값에 따라 스크립트가 끼어들 수 있다)
--%>
<%-- c:url = 컨텍스트 경로를 붙임, c:out = HTML 속성에 맞게 바꿈 (& → &amp; 는 속성 안에서 브라우저가 다시 & 로 읽는다) --%>
<c:url var="leftSrc" value="${leftUrl}"/>
<c:url var="rightSrc" value="${rightUrl}"/>
<div class="wrap">
  <div id="viewer"
       data-left-url="<c:out value='${leftSrc}'/>"
       data-right-url="<c:out value='${rightSrc}'/>"
       data-left-label="<c:out value='${leftLabel}'/>"
       data-right-label="<c:out value='${rightLabel}'/>"></div>
</div>

<script src="<c:url value='/static/sg-compare/sg-compare.min.js'/>"></script>
<%-- CSP nonce 를 쓰면: <script nonce="<c:out value='${cspNonce}'/>"> 로 바꾸고, viewer 에 data-nonce 도 같이 넘긴다 --%>
<script>
  (function () {
    var el = document.getElementById('viewer'), d = el.dataset;
    // 같은 도메인의 http(s) 주소만 열린다 (그 밖의 주소는 모듈이 거부하고 오류를 낸다)
    SgCompare.mountViewer(el, {
      left:  { url: d.leftUrl,  label: d.leftLabel },
      right: { url: d.rightUrl, label: d.rightLabel },
      page: '.page',      // 화면의 쪽 요소 선택자 (없으면 지움)
      locale: 'ko',
      height: 'calc(100vh - 32px)',
      nonce: d.nonce || undefined
    });
  })();
</script>
</body>
</html>
