<template>
  <div
    class="spinner"
    :class="{'spinner-small' : !fullscreen}"
  />
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: true
    }
  },
};
</script>

<style scoped>
.spinner {
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 40px;
  height: 40px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
