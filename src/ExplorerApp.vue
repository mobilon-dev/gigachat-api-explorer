<script setup lang="ts">
import { ref, computed, watch, nextTick, unref } from 'vue';
import { useAuthStore } from './store/authStore';
import { useLogStore } from './store/logStore';
import { AuthClient } from './api-client/AuthClient';
import ExplorerContent from './components/ExplorerContent.vue';

const baseURL = `${import.meta.env.VITE_AUTH_URL}`;
const logURL = `${import.meta.env.VITE_LOG_AUTH_URL}`
const authStore = useAuthStore();
const logStore = useLogStore();
const authClient = new AuthClient(logURL, baseURL, logStore);

const scope = ref([
  {id: 1, name: 'GIGACHAT_API_PERS'},
  {id: 2, name: 'GIGACHAT_API_B2B'},
  {id: 3, name: 'GIGACHAT_API_CORP'},
])

const clientId = ref(localStorage.clientId)
const clientSecret = ref(localStorage.clientSecret)
const currentScope = ref('')
const showConsole = ref(true)
const s = ref(0)
const m = ref(0)
const refConsole = ref<HTMLElement>()

const allowGetToken = computed(() => {
  if (clientId.value != '' && clientSecret.value != '' && currentScope.value != '')
    return true
  return false
})

const elapsedTime = computed(() => {
  let minutes = m.value < 10 ? "0" + m.value : m.value;
  let seconds = s.value < 10 ? "0" + s.value : s.value;
  return minutes + ':' + seconds
})

let interval
const getAuthToken = async () => {
  if (allowGetToken.value && authClient){
    authStore.token = ''
    const response = await authClient.getToken(clientId.value, clientSecret.value, currentScope.value)
    if (response){
      clearInterval(interval)
      s.value = 59
      m.value = 29
      authStore.token = response.access_token
      localStorage.setItem('clientId', clientId.value)
      localStorage.setItem('clientSecret', clientSecret.value)
      interval = setInterval(() => {
        s.value -= 1
        if (s.value == 0){
          s.value = 59
          m.value -= 1
          if (m.value == -1){
            m.value = 0
            s.value = 0
            clearInterval(interval)
            alert('Необходимо обновить токен')
            authStore.token = ''
          }
        }
      }, 1000)
    }
      
  }
}

const hrefDoc = () => {
  const url = 'https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/gigachat-api'
  window.open(url, '_blank')?.focus();
}

const copyTokenToClipboard = () => {
  navigator.clipboard.writeText(authStore.token)
}
watch(
  () => {logStore.log.length},
  () => {
    nextTick(() => {
      const element = unref(refConsole)
      if (element)
        element.scrollTop = element?.scrollHeight
    })
  },
  {deep: true}
)

</script>

<template>
  <div class="explorer__container">
    <div class="explorer__header">
      <h4>GigaChat API Explorer</h4>
      <button 
        class="btn btn-secondary"
        @click="hrefDoc"
      >
        Документация
      </button>
    </div>
    <div class="explorer__auth-line">
      <input 
        class="form-control"
        placeholder="client_id"
        v-model="clientId"
      />
      <input 
        class="form-control"
        placeholder="client_secret"
        v-model="clientSecret"
      />
      <select class="form-select" v-model="currentScope">
        <option value="" selected disabled>Режим доступа</option>
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
        class="btn btn-secondary"
      >
        Получить доступ
      </button>
    </div>
    <div v-if="authStore.token" class="explorer__token-line">
      <p  class="explorer__token form-control">{{authStore.token}}</p>
      <span style="margin: auto;">{{ elapsedTime }}</span>
      <button 
        @click="copyTokenToClipboard"
        class="btn btn-secondary"
      >
        Копировать
      </button>
    </div>
    <ExplorerContent v-if="authStore.isAuthenticated" />
    <hr>
    <strong style="display: block; margin-bottom: 5px;">Консоль</strong>
    <div class="explorer__console-controls">
      <button 
        v-if="logStore.log.length > 0"
        @click="logStore.resetLog()"
        class="btn btn-secondary"
      >
        Очистить
      </button>
      <button 
        v-if="logStore.log.length > 0"
        @click="showConsole = !showConsole"
        class="btn btn-secondary"
      >
        {{showConsole ? 'Скрыть' : 'Раскрыть'}}
      </button>
    </div>
    
    <div 
      v-if="showConsole" 
      id="console" 
      ref="refConsole"
      class="explorer__console-container form-control"
    >
      <p v-html="log" v-for="log of logStore.log"></p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  input {
    width: 100%;
  }

  .explorer{
    &__container{
      padding: 20px;
    }

    &__auth-line, &__token-line, &__header{
      display: flex;
      gap: 5px;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__token{
      overflow: hidden;
      text-overflow: ellipsis;
      margin: auto;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      white-space: nowrap;
      user-select: none;
      border: 1px solid #e5e5e5;
      border-radius: 3px;
    }
    

    &__console-container{
      margin-top: 10px;
      min-height: 50px;
      max-height: 300px;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px;
      
      p{
        margin: 0;
        margin-left: 7px;
        white-space: break-spaces;
      }
    }

    &__console-controls{
      display: flex;
      gap: 5px;
      margin-top: 5px;
    }
  }
</style>
