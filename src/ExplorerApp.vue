<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from './store/authStore';
import { useLogStore } from './store/logStore';
import { AuthClient } from './api-client/AuthClient';
import ExplorerContent from './components/ExplorerContent.vue';

const baseURL = `${import.meta.env.VITE_AUTH_URL}`;
const authClient = new AuthClient(baseURL);
const authStore = useAuthStore();
const logStore = useLogStore();

const scope = ref([
  {id: 1, name: 'GIGACHAT_API_PERS'},
  {id: 2, name: 'GIGACHAT_API_B2B'},
  {id: 3, name: 'GIGACHAT_API_CORP'},
])

const clientId = ref('')
const clientSecret = ref('')
const currentScope = ref('')

const getAuthToken = async () => {
  if (!authStore.isAuthenticated && authClient){
    await authClient.getToken(clientId.value, clientSecret.value, currentScope.value)
  }
}

</script>

<template>
  <div class="explorer__container">
    <div class="explorer__auth-line">
      <input 
        placeholder="client_id"
        v-model="clientId"
      />
      <input 
        placeholder="client_secret"
        v-model="clientSecret"
      />
      <select v-model="currentScope">
        <option 
          v-for="s of scope" 
          :key="s.id"
        >
          {{ s.name }}
        </option>
      </select>
      <button @click="getAuthToken">Получить доступ</button>
    </div>
    <div class="explorer__token-line">
      <p>JWT</p>
      <button>Копировать</button>
    </div>
    <ExplorerContent v-if="!authStore.isAuthenticated" />
    <p>Консоль</p>
    <div class="explorer__console-container">
      <p v-for="log of logStore.log">{{ log }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .explorer{

    &__container{
      border: 1px solid;
      padding: 20px;
    }

    &__auth-line, &__token-line{
      display: flex;
    }

    &__console-container{
      border: 1px solid;
    }
  }
</style>
