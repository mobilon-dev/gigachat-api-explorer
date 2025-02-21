<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useContentStore } from '../store/contentStore';

const models = ref()

onMounted(async () => {
  const contentStore = useContentStore()
  models.value = contentStore.models
  console.log(models.value)
})
</script>

<template>
  <div class="container">
    <div class="modelview__row">
      <strong>Модель</strong>
      <strong>Тип</strong>
      <strong>Владелец</strong>
    </div>
    <div v-if="models">
      <div 
        class="modelview__row" 
        v-for="m of models.data"
      >
        <div>{{ m.id }}</div>
        <div>{{ m.type }}</div>
        <div>{{ m.owned_by }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .modelview{

    &__row{
      display: grid;
      border-bottom: 1px solid var(--bs-border-color);
      grid-column: 1/3;
      grid-template-columns: 60% 15% 25%;
      padding: 7px;
    }
  }
</style>
