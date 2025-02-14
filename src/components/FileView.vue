<script setup>
import { inject } from 'vue';
const apiClient = inject('apiClient')
console.log(apiClient)
</script>

<template>
  <div class="container">
    <span>files</span>
  </div>
</template>

<style scoped>

</style>
