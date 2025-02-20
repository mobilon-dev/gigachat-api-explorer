import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useLogStore = defineStore('log', () => {

  const log = ref<string[]>([]);

  function appendLog(str: string){
    log.value.push(str)
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
