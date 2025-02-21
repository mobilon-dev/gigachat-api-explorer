<script setup lang="ts">
import { inject, onMounted, ref, computed, watch, nextTick, unref } from 'vue';
import { useContentStore } from '../store/contentStore';
import { ApiClient } from '../api-client/ApiClient';

const contentStore = useContentStore()
const selectedModel = ref('')
const apiClient = inject('apiClient') as ApiClient
const messages = ref<Message[]>([])
const stream = ref(false)
const interval = ref(0)
const refResponse = ref<HTMLElement>()

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
  contentStore.resetModelResponse()
  messages.value.forEach(m => {
    if (m.attachments){
      const arr : any = []
      arr.push(m.attachments)
      m.attachments = arr
    }
  })
  if (stream.value){
    contentStore.isLoading = true
    const response = await apiClient.sendStreamRequest(selectedModel.value, messages.value, stream.value, interval.value)
    contentStore.isLoading = false
    const inter = setInterval(() => {
      if (response.length == 0){
        clearInterval(inter)
      }
      else 
        contentStore.streamProcessing(response.shift() as string)
    }, interval.value * 1000)
  }
  else if (!stream.value){
    contentStore.isLoading = true
    const response = await apiClient.sendRequest(selectedModel.value, messages.value)
    contentStore.isLoading = false
    contentStore.setModelResponse(response.choices[0].message.content)
  } 
}

watch(
  () => {contentStore.modelResponse},
  () => {
    if (stream.value){
      nextTick(() => {
        const element = unref(refResponse)
        if (element)
          element.scrollTop = element?.scrollHeight
      })
    }
  },
  {deep: true}
)

onMounted(() => {
  messages.value.push({
    role: null,
    content: '',
    attachments: null,
  })
  contentStore.resetModelResponse()
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
      ref="refResponse"
      v-html="contentStore.modelResponse" 
      class="request__response form-control"
    />
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
    height: 200px;
    max-height: 1000px;
    border-radius: 5px;
    white-space: break-spaces;
    overflow: auto;
    resize: vertical;
  }
}
</style>
