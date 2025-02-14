<script setup lang="ts">
import { ref, computed } from 'vue';
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

const allowGetToken = computed(() => {
  if (clientId.value != '' && clientSecret.value != '' && currentScope.value != '')
    return true
  return false
})

let timer
const getAuthToken = async () => {
  if (allowGetToken.value && authClient){
    authStore.token = ''
    const response = await authClient.getToken(clientId.value, clientSecret.value, currentScope.value)
    if (response){
      clearTimeout(timer)
      authStore.token = response.access_token
      timer = setTimeout(() => {
        alert('Необходимо обновить токен')
        authStore.token = ''
      }, 1000 * 60 * 30)
    }
      
  }
}

const copyTokenToClipboard = () => {
  navigator.clipboard.writeText(authStore.token)
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
      <button
        :disabled="!allowGetToken"
        @click="getAuthToken"
      >
        Получить доступ
      </button>
    </div>
    <div v-if="authStore.token" class="explorer__token-line">
      <p class="explorer__token">{{authStore.token}}</p>
      <button @click="copyTokenToClipboard">Копировать</button>
    </div>
    <ExplorerContent v-if="authStore.isAuthenticated" />
    <p>Консоль</p>
    <div class="explorer__console-container">
      <p v-for="log of logStore.log">{{ log }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  input {
    width: 100%;
  }

  .explorer{

    &__container{
      border: 1px solid;
      padding: 20px;
    }

    &__auth-line, &__token-line{
      display: flex;
      gap: 5px;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__token{
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      white-space: nowrap;
      user-select: none;
      border: 1px solid #e5e5e5;
      border-radius: 3px;
    }
    

    &__console-container{
      border: 1px solid;
      min-height: 50px;
      max-height: 300px;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px;

      p{
        margin: 0;
      }
    }
  }
</style>
