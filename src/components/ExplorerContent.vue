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
//const token = authStore.token;
const token = 'eyJjdHkiOiJqd3QiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.bQyI5rQasBx2MWkGYFcnlITWnQYHn5-KsgZGl4hSjyuNTnIBBPGAP7-lfsEwamPZXAeV-MofDNmsOKFnWWj5OgKeJPFDenfzDcHDX77Dv9vjeOUsiHOiAIzFi0DkRBgIYdI6mVeTaEN_vxzjkZldrKASG8CvXJfp1smLMB3IqysIs7ltaLJJNttBQS6x9hsN_Ju3NO4UKkEauS16RU5SP3tc_phqXBoiOwJP2vfRM9vfuTtIuT9-TqSeJPI375MEaB1Rwsq8vOtu3lHimQPgu0fthvy7-5gYrVNpw8mddRGp9b1sJtUG4uI93kszlnztLNmp4-wosGUMt50CsXCYWA.kTd-jIQv7kPwxocmj-RIlg.e4dn9mbk2t6xIAruAqAcXnK5_4J8WrdczEXQLETDr1HCWg0JYEr_goOfUgRealHdVHAJ4nh9GD-MtzDT_S1Bczy1JinKhKz01LwWh7tyS5U6vEga8R2Vle2rQbLOOAgc5EFSmiVMebvzJQVZFYj74YpJIf9Tjrw1OHd0n3_2hsfMNnQ3AVY6lXRVu6GL8r9NNdbfJvsR-qgtFOhEp2Dk5vtZ7Dyws9dsguyI6eVoAFtJbbG6Hp9AH1vtys21oFLBI2bxPyzlGCv0bwvjwGL7e8H_URB2LOrX6APYK2GkxTZUZpruDkvvczfEVWXgfCfvDDhv4R343EqUc4QDoQHpKIigrraf7obzkPqVtGy1AP_UpfY7jVekiyQDOpy5LXdA_qcBUETTJD0EsQKmj8TR85_zwWYlnFU5QnyFRwdGFqiWhJnXLdB3j_B-B7roskrV0_LFtx5fVcMzrip55p5w5sle88FkmcoW0Bjk0rCTtzlHPRINRqMVFrrc8Uc1AdWRwOz4oNceysYaAOQzMb13w6iDTy-U5nOueMhvDLnGnzHEan-Sf4dPnE1pvBaPt3-waZo8yfGtIuqSQxz-97LIzJnfL0FQqlVdWkg2SBav_YDUcRH6wTxZ6ESrIBN8SByeyYzRtztqKBnw45gyIkj45WvRdkUcJFXby-X57CE77j6Wia-F7vs7SvgdTYqzq21Ob7veqAWAAyjNLqK55h1pFAoLG_eMG6SJhms1btwEduM.Wq2cTpwa7FiAJ8VWIZ4fLgm3CemDQHVRlOKQn9WLQqY'
const apiClient = new ApiClient(baseURL, token);
apiClient.getModels()
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
