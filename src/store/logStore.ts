import { defineStore } from 'pinia';
import { ref } from 'vue';
import { marked } from 'marked';
export const useLogStore = defineStore('log', () => {

  const log = ref<string[]>([]);

  function appendLog(str: string){
    const parsed = marked.parse(str)
    log.value.push(parsed as string)
  }

  function resetLog(){
    log.value = []
  }

  return {
    log,
    appendLog,
    resetLog,
  };
});
