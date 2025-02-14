<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { ApiClient } from '../api-client/ApiClient';

const apiClient = inject('apiClient') as ApiClient
const files = ref()
const selectedId = ref('')
const fileInput = ref<HTMLInputElement>()

const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const onFileSelected = async () => {
  if (fileInput.value?.files){
    const response = await apiClient.uploadFile(fileInput.value?.files[0])
    console.log(response)
  }
};

const selectFile = (file) => {
  files.value.data.forEach((f) => {
    f.selected = false
    if (f == file){
      f.selected = true
      selectedId.value = f.id
    }
  })
}

const deleteFile = async () => {
  if (selectedId.value != ''){
    const response = await apiClient.deleteFile(selectedId.value)
    console.log(response)
  }
}

const downloadFile = async () => {
  if (selectedId.value != ''){
    const response = await apiClient.downloadFile(selectedId.value)
    console.log(response)
  }
}

const aboutFile = async () => {
  if (selectedId.value != ''){
    const response = await apiClient.getFileInfo(selectedId.value)
    console.log(response)
  }
}

onMounted(async () => {
  files.value = await apiClient.getFileList()
  console.log(files.value)
})
</script>

<template>
  <div class="container">
    <button @click="triggerFileUpload">
      Загрузить файл
    </button>
    <input
      ref="fileInput"
      style="display: none;"
      type="file"
      @change="onFileSelected"
    >
    <div v-if="files">
      <div v-if="files.data.length > 0">
        <div 
          v-for="file of files.data"
          class="fileview__file" 
          :class="{'fileview__selected-file' : file.selected}"
          @click="selectFile(file)"
        >
          <p>{{ file.filename }}, {{ file.bytes }}, {{ file.created_at }}</p>
        </div>
      </div>
      <p v-else>Список файлов пуст</p>
    </div>
    
    <button 
      v-if="selectedId != ''"
      @click="deleteFile"
    >
      Удалить файл
    </button>
    <button 
      v-if="selectedId != ''"
      @click="downloadFile"
    >
      Скачать файл
    </button>
    <button 
      v-if="selectedId != ''"
      @click="aboutFile"
    >
      О файле
    </button>

  </div>
</template>

<style scoped lang="scss">
  .fileview{
    &__file{
      cursor: pointer;
    }

    &__selected-file{
      background-color: #e5e5e5;
    }
  }
</style>
