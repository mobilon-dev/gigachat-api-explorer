<script setup lang="ts">
import { inject, onMounted, ref, computed } from 'vue';
import { useContentStore } from '../store/contentStore';
import { ApiClient } from '../api-client/ApiClient';

const contentStore = useContentStore()
const selectedModel = ref()
const apiClient = inject('apiClient') as ApiClient
const messages = ref<Message[]>([])
const stream = ref(false)
const interval = ref(0)

const response = ref('')

interface Message {
  role: any
  content: string
  attachments: any
}

const allowSend = computed(() => {
  if (!selectedModel.value) return false
  for (let m of messages.value){
    if (!m.role) return false
    if (m.content == '' && !m.attachments) return false
  }
  return true
})

const roles = [
  'system','assistant','user'
]

const newMessage = () => {
  messages.value.push({
      role: null,
      content: '',
      attachments: null,
    })
}

const removeMessage = (index) => {
  messages.value.splice(index, 1)
}

const sendRequest = async () => {
  messages.value.forEach(m => {
    if (m.attachments){
      const arr : any = []
      arr.push(m.attachments)
      m.attachments = arr
    }
  })
  const r = await apiClient.sendRequest(selectedModel.value, messages.value, stream.value, interval.value)
  response.value = r.choices[0].message.content
}

onMounted(() => {
    messages.value.push({
      role: null,
      content: '',
      attachments: null,
    })
})

</script>

<template>
  <div class="request__container">
    <div class="request__model">
      <div>
        <span>Модель</span>
        <select v-model="selectedModel">
          <option v-for="m of contentStore.models.data">
            {{ m.id }}
          </option>
        </select>
      </div>
      <button @click="newMessage">Добавить сообщение</button>
    </div>
    <div 
      class="request__message"
      v-for="(m, index) of messages"
    >
      <select v-model="m.role">
        <option v-for="r of roles">{{ r }}</option>
      </select>
      <textarea v-model="m.content"></textarea>
      <select v-model="m.attachments">
        <option :value="null">Нет</option>
        <option v-for="f of contentStore.files.data" :value="f.id">{{ f.filename }}</option>
      </select>
      <button @click="removeMessage(index)">
        Удалить
      </button>
    </div>
    <div class="request__controls">
      <div>
        <span>Потоковый вывод ответа</span>
        <input type="checkbox" v-model="stream"/>
      </div>
      <button 
        :disabled="!allowSend"
        @click="sendRequest"
      >
        Отправить
      </button>
    </div>
    <div v-if="stream">
      <span>Интервал</span>
      <input type="number" min="1" max='5' step="1" v-model="interval"/>
    </div>
    
    <hr>
    <span>Ответ</span>
    <div class="request__response">
      {{ response }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.request{

  &__model{
    display: flex;
    justify-content: space-between;
  }

  &__message{
    margin-top: 5px;
    display: flex;
    gap: 5px;
    textarea{
      width: 100%;
      resize: vertical;
    }
  }

  &__controls{
    display: flex;
    justify-content: space-between;
  }

  &__response{
    margin-top: 5px;
    min-height: 50px;
    border: 1px solid;
    border-radius: 5px;
  }
}
</style>
