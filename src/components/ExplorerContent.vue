<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ApiClient } from '../api-client/ApiClient';
import { useAuthStore } from '../store/authStore';
import FileView from './FileView.vue';
import ModelView from './ModelView.vue';
import RequestView from './RequestView.vue';
import TokenView from './TokenView.vue';

const authStore = useAuthStore();
const baseURL = `${import.meta.env.VITE_API_URL}`;
const token = authStore.token;
const apiClient = new ApiClient(baseURL, token);

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

</script>

<template>
    <div class="explorer__tabs">
      <div class="explorer__tabs-header">
        <button 
          v-for="tab of tabs"
          class="explorer__tab"
          :class="{'explorer__selected-tab' : tab.selected}"
          :key="tab.index"
          @click="selectTab(tab)"
        >
          {{ tab.name }}
        </button>
      </div>
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

    &__tab{
      font-size: 18px;
      border: none;
      display: inline-block;
      background: #fff;
      padding: 10px 25px;
      text-align: center;
      cursor: pointer;
      margin-bottom: -3px;
      border-bottom: 3px solid #eee;
    }

    &__selected-tab{
      color: #5fa03a;
	    border-bottom: 3px solid #5fa03a;
    }

    

  }
</style>
