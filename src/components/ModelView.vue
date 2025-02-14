<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { ApiClient } from '../api-client/ApiClient';

const apiClient = inject('apiClient') as ApiClient
const models = ref()

onMounted(async () => {
  models.value = await apiClient.getModels()
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
