<script setup>
import ExplorerApp from './ExplorerApp.vue';
</script>

<template> 
  <span class="warning">Для доступа к GigaChat API применяется сторонний proxy-сервер. Рекомендуется обновить client_secret после использования.</span>
  <div class="container">
    <ExplorerApp />
  </div>
</template>

<style scoped>

.warning{
  display: block;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  background-color: rgb(254 226 226);
  color: rgb(185 28 28);
  min-height: 50px;
  line-height: 50px;
  font-size: 20px;
}


.container {
  width: 70vw;
  margin: 30px auto;
}
</style>
