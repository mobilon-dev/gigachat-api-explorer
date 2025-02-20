<script setup lang="ts">
import { inject, onMounted, ref, computed } from 'vue';
import { useContentStore } from '../store/contentStore';
import { ApiClient } from '../api-client/ApiClient';

const contentStore = useContentStore()
const selectedModel = ref('')
const apiClient = inject('apiClient') as ApiClient
const messages = ref<Message[]>([])
const stream = ref(false)
const interval = ref(0)

interface Message {
  role: any
  content: string
  attachments: any
}

const allowSend = computed(() => {
  if (!selectedModel.value) return false
  for (let m of messages.value){
    if (!m.role || (m.content == '' && !m.attachments))
      return false
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
  await apiClient.sendRequest(selectedModel.value, messages.value, stream.value, interval.value)
}

onMounted(() => {
  messages.value.push({
    role: null,
    content: '',
    attachments: null,
  })
  contentStore.modelResponse = ''
})

</script>

<template>
  <div class="request__container">
    <div class="request__model">
      <div style="display: flex;">
        <span style="margin: auto;" >Модель</span>
        <select style="margin-left: 5px;" class="form-select" v-model="selectedModel">
          <option value="" selected disabled>Выберите модель</option>
          <option v-for="m of contentStore.models.data">
            {{ m.id }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary" @click="newMessage">Добавить сообщение</button>
    </div>
    <div 
      class="request__message"
      v-for="(m, index) of messages"
    >
      <select class="form-select" v-model="m.role">
        <option :value="null" disabled>Роль</option>
        <option v-for="r of roles">{{ r }}</option>
      </select>
      <textarea class="form-control" v-model="m.content"></textarea>
      <select class="form-select" v-model="m.attachments">
        <option :value="null">Файл</option>
        <option v-for="f of contentStore.files.data" :value="f.id">{{ f.filename }}</option>
      </select>
      <button class="btn btn-light" @click="removeMessage(index)">
        Удалить
      </button>
    </div>
    <div class="request__controls">
      <div>
        <span>Потоковый вывод ответа</span>
        <input style="margin-left: 5px;" type="checkbox" v-model="stream"/>
      </div>
      <button 
        class="btn btn-primary"
        :disabled="!allowSend"
        @click="sendRequest"
      >
        Отправить
      </button>
    </div>
    <div v-if="stream">
      <span>Интервал</span>
      <input style="margin-left: 5px;"  type="number" min="0" max='5' step="0.1" v-model="interval"/>
    </div>
    <hr>
    <strong>Ответ</strong>
    <div 
      v-html="contentStore.modelResponse" 
      class="request__response form-control"
    >
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
    select,button{
      max-height: 50px;
      line-height: 30px;
    }

  }

  &__controls{
    display: flex;
    justify-content: space-between;
  }

  &__response{
    margin-top: 5px;
    min-height: 50px;
    border-radius: 5px;
    white-space: break-spaces;
    max-height: 300px;
    overflow: auto;
  }
}
</style>
