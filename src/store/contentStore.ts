import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { marked } from 'marked';
export const useContentStore = defineStore('content', () => {

  const isLoading = ref(false)
  const files = ref<any>([])
  const models = ref<any>([])

  const modelResponse = ref('')
  const unparsedModelResponce = ref('')

  const setFiles = (newFiles) => {
    files.value = newFiles
  }

  const setModels = (newModels) => {
    models.value = newModels
  }

  const streamProcessing = (content: string) => {
    unparsedModelResponce.value += content
    setModelResponse(unparsedModelResponce.value)
  }

  const setModelResponse = (content: string) => {
    const parsed = marked.parse(content)
    modelResponse.value = parsed as string
  }

  const resetModelResponse = () => {
    modelResponse.value = ''
    unparsedModelResponce.value = ''
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
    resetModelResponse,
  };
});
