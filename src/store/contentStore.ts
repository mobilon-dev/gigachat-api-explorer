import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useContentStore = defineStore('content', () => {

  const isLoading = ref(false)
  const files = ref<any>([])
  const models = ref<any>([])

  const modelResponse = ref('')

  const setFiles = (newFiles) => {
    files.value = newFiles
  }

  const setModels = (newModels) => {
    models.value = newModels
  }

  const streamProcessing = (content: string) => {
    modelResponse.value += content
  }

  return {
    files,
    models,
    isLoading,
    modelResponse,
    setFiles,
    setModels,
    streamProcessing,
  };
});
