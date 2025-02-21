<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useContentStore } from '../store/contentStore';
import { ApiClient } from '../api-client/ApiClient';

const apiClient = inject('apiClient') as ApiClient
const tokens = ref()

onMounted(async () => {
  const contentStore = useContentStore()
  contentStore.isLoading = true
  tokens.value = await apiClient.getAvailableTokens()
  contentStore.isLoading = false
})
</script>

<template>
  <div class="container">
    <div v-if="tokens">
      <p v-for="t of tokens.balance">
        <strong>{{t.usage}}</strong>: доступно <strong>{{ t.value }}</strong> токенов
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
