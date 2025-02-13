<script setup>
import { ref } from 'vue';
import FileView from './components/FileView.vue';
import ModelView from './components/ModelView.vue';
import RequestView from './components/RequestView.vue';
import TokenView from './components/TokenView.vue';

const tabs = ref([
  {index: 0, name: 'Файлы', selected: false},
  {index: 1, name: 'Токены', selected: false},
  {index: 2, name: 'Модели', selected: false},
  {index: 3, name: 'Запросы', selected: false},
])

const currentTab = ref(null)

const componentsMap = (index) => {
  const r = [FileView, TokenView, ModelView, RequestView]
  return r[index];
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
  <div class="explorer__container">
    <div class="explorer__auth-line">
      <input placeholder="client_id"/>
      <input placeholder="client_secret"/>
      <button>Получить доступ</button>
    </div>
    <div class="explorer__token-line">
      <p>JWT</p>
      <button>Копировать</button>
    </div>
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
      <div class="explorer__tabs-body">
        <component
          :is="componentsMap(currentTab)"
        />
      </div>
    </div>
    <p>Консоль</p>
    <div class="explorer__console-container">

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

    &__console-container{
      border: 1px solid;
    }

  }
</style>
