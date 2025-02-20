import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { marked } from 'marked';
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
    const parsed = marked.parse(content)
    modelResponse.value += parsed as string
  }

  const setModelResponse = async (content: string) => {
    const parsed = await marked.parse(content)
    modelResponse.value = parsed as string
  }

  return {
    files,
    models,
    isLoading,
    modelResponse,
    setFiles,
    setModels,
    streamProcessing,
    setModelResponse,
  };
});
