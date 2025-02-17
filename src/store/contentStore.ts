import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useContentStore = defineStore('content', () => {

  const files = ref<any>([])
  const models = ref<any>([])

  const setFiles = (newFiles) => {
    files.value = newFiles
  }

  const setModels = (newModels) => {
    models.value = newModels
  }

  return {
    files,
    models,
    setFiles,
    setModels,
  };
});
