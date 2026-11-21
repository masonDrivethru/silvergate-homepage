<script setup>
defineProps({ doc: Object });
</script>
<template>
  <section class="page" v-if="doc">
    <h2>{{ doc.title }}</h2>
    <table>
      <tr><th>단계</th><th>지시</th></tr>
      <!-- 반복 항목에 고유 키를 달면 순서가 바뀌어도 정확히 짝이 맞는다 -->
      <tr v-for="s in doc.steps" :key="s.id" :data-sgc-key="s.id"><td>{{ s.name }}</td><td>{{ s.text }}</td></tr>
    </table>
    <p data-sgc-ignore>출력: {{ new Date().toLocaleString() }}</p>
  </section>
</template>
