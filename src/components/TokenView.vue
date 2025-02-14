<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { ApiClient } from '../api-client/ApiClient';

const apiClient = inject('apiClient') as ApiClient
const tokens = ref()

onMounted(async () => {
  tokens.value = await apiClient.getAvailableTokens()
  console.log(tokens.value)
})
</script>

<template>
  <div class="container">
    <div v-if="tokens">
      <p v-for="t of tokens.balance">
      {{t.usage}}: доступно {{ t.value }} токенов
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
