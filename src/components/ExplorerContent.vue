<script setup lang="ts">
import { provide, ref, onMounted } from 'vue';
import { ApiClient } from '../api-client/ApiClient';
import { useAuthStore } from '../store/authStore';
import FileView from './FileView.vue';
import ModelView from './ModelView.vue';
import RequestView from './RequestView.vue';
import TokenView from './TokenView.vue';
import { useContentStore } from '../store/contentStore';
import { useLogStore } from '../store/logStore';

const tabs = ref([
  {index: 1, name: 'Файлы', selected: false},
  {index: 2, name: 'Токены', selected: false},
  {index: 3, name: 'Модели', selected: false},
  {index: 4, name: 'Запросы', selected: false},
])

const currentTab = ref<number>()

const componentsMap = (index : number) => {
  const r = [FileView, TokenView, ModelView, RequestView]
  return r[index - 1];
}

const selectTab = (tab) => {
  
  tabs.value.forEach(t => {
    t.selected = false
    if (t == tab) {
      t.selected = true
      currentTab.value = t.index
    }
  })
}

onMounted(async () => {
  const authStore = useAuthStore();
  const baseURL = `${import.meta.env.VITE_API_URL}`;
  const logURL = `${import.meta.env.VITE_LOG_API_URL}`
  const token = authStore.token;
  const contentStore = useContentStore();
  const logStore = useLogStore()
  const apiClient = new ApiClient(logURL, baseURL, token, contentStore, logStore);
  provide('apiClient', apiClient)
  
  
  const files = await apiClient.getFileList()
  if (files.data && files.data.length > 0){
    console.log('files')
    files.data.forEach(f => {
    f.created_at = new Date(f.created_at * 1000).toISOString()
    const sizeMeasurement = ['б', 'Кб', "Мб", "Гб"]
    let size = f.bytes
    let index = 0
    while (size > 1024) {
      size = size / 1024
      index++
    }
    f.bytes = size.toFixed(2) + sizeMeasurement[index]
  });
  }
  console.log(files)
  contentStore.setFiles(files)
  contentStore.setModels(await apiClient.getModels())
})

</script>

<template>
    <div class="explorer__tabs">
      <ul class="nav nav-pills" >
        <li 
          v-for="tab of tabs"
          class="nav-item"
          style="cursor: pointer;"
          :key="tab.index"
          @click="selectTab(tab)"
        >
          <a 
            class="nav-link"
            :class="{'active' : tab.selected}"
          >
            {{ tab.name }}
          </a>
        </li>
      </ul>
      <div 
        v-if="currentTab" 
        class="explorer__tabs-body" 
      >
        <component
          :is="componentsMap(currentTab)"
        />
      </div>
    </div>
    
</template>

<style scoped lang="scss">
  .explorer{
    &__tabs-body{
      margin-top: 10px;
    }
  }

</style>
