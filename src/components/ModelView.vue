<script setup>
import { inject } from 'vue';
const apiClient = inject('apiClient')
console.log(apiClient)
apiClient.getModels()
</script>

<template>
  <div class="container">
    <span>models</span>
  </div>
</template>

<style scoped>

</style>
