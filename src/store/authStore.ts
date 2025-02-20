import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {

  const token = ref('');
  const isLoading = ref(false)

  const isAuthenticated = computed(() => { 
    return (token.value !== '') ? true : false;
  });

  const setToken = (newToken: string) => {
    token.value = newToken;
  }

  const resetToken = () => {
    token.value = '';
  }

  
  return {
    token,
    isAuthenticated,
    isLoading,
    setToken,
    resetToken,
  };
});
