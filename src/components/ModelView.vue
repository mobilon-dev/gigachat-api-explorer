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
    <div v-if="models">
      <p v-for="m of models.data">{{ m.id }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
