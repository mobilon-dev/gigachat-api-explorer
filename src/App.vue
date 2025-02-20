<script setup>
import ExplorerApp from './ExplorerApp.vue';
import Loader from './components/Loader.vue';
import { useAuthStore } from './store/authStore';
import { useContentStore } from './store/contentStore';

const contentStore = useContentStore()
const authStore = useAuthStore()
</script>

<template> 
  <span class="warning">Для доступа к GigaChat API применяется сторонний proxy-сервер. Рекомендуется обновить client_secret после использования.</span>
  <div class="container">
    <ExplorerApp />
    <Transition name="fade">
      <div
        v-if="contentStore.isLoading || authStore.isLoading"
        class="loader-overlay"
      >
        <Loader />
      </div>
    </Transition>
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

.loader-overlay {
  position:absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(233, 225, 239, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>
