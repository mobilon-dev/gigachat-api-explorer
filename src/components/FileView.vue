<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { ApiClient } from '../api-client/ApiClient';
import { useContentStore } from '../store/contentStore';

const contentStore = useContentStore()
const apiClient = inject('apiClient') as ApiClient
const files = ref()
const selectedFile = ref<any>(null)
const fileInput = ref<HTMLInputElement>()
const openFileInfo = ref(false)
const fileInfo = ref<any>(null)
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const onFileSelected = async () => {
  if (fileInput.value?.files){
    await apiClient.uploadFile(fileInput.value?.files[0])
    contentStore.setFiles(await apiClient.getFileList())
    files.value = contentStore.files
  }
};

const selectFile = (file) => {
  files.value.data.forEach((f) => {
    f.selected = false
    if (f == file){
      f.selected = true
      selectedFile.value = f
    }
  })
}

const deleteFile = async () => {
  if (selectedFile.value){
    await apiClient.deleteFile(selectedFile.value.id)
    contentStore.setFiles(await apiClient.getFileList())
    files.value = contentStore.files
  }
}

const downloadFile = async () => {
  if (selectedFile.value){
    await apiClient.downloadFile(selectedFile.value.id, selectedFile.value.filename, selectedFile.value.created_at)
  }
}

const aboutFile = async () => {
  if (selectedFile.value){
    const response = await apiClient.getFileInfo(selectedFile.value.id)
    console.log(response)
    fileInfo.value = response
    openFileInfo.value = true
  }
}

onMounted(async () => {
  files.value = contentStore.files
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
      <div class="fileview__table" v-if="files.data.length > 0">
        <div class="fileview__row">
          <div class="fileview__col">Наименование</div>
          <div>Размер</div>
          <div>Создан</div>
        </div>
        
        <div 
          v-for="file of files.data"
          class="fileview__row fileview__file" 
          :class="{'fileview__selected-file' : file.selected}"
          @click="selectFile(file)"
        >
          <div class="fileview__col1">{{ file.filename }}</div>
          <div class="fileview__col2">{{ file.bytes }}</div>
          <div class="fileview__col3">{{ file.created_at }}</div>
        </div>
      </div>
      <p v-else>Список файлов пуст</p>
    </div>
    
    <button 
      v-if="selectedFile"
      @click="deleteFile"
    >
      Удалить файл
    </button>
    <button 
      v-if="selectedFile"
      @click="downloadFile"
    >
      Скачать файл
    </button>
    <button 
      v-if="selectedFile"
      @click="aboutFile"
    >
      О файле
    </button>
    <Teleport to="body">
      <div
        v-if="openFileInfo"
        class="fileview__modal-overlay"
      >
        <div class="fileview__modal">
          <p>О файле</p>
          <button
            @click="openFileInfo = false"
          >
            Выход
          </button>
          <p>Политика доступа: {{ fileInfo?.access_policy }}</p>
          <p>Размер в байтах:  {{ fileInfo?.bytes }}</p>
          <p>Создан: {{ fileInfo?.created_at }}</p>
          <p>Название файла: {{ fileInfo?.fileInput }}</p>
          <p>Идентификатор: {{ fileInfo?.id }}</p>
          <p>Тип: {{ fileInfo?.object }}</p>
          <p>Назначение: {{ fileInfo?.purpose }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
  .fileview{
    &__table{
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    &__row{
      display: grid;
      grid-column: 1/3;
      grid-template-columns: 70% 15% 15%;
      padding: 5px;
    }

    &__file{
      cursor: pointer;
    }

    &__col1{
      grid-column: 1;
    }

    &__col2{
      grid-column: 2;
    }
    &__col3{
      grid-column: 3;
    }

    &__selected-file{
      background-color: #e5e5e5;
    }

    &__modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      background-color: white;
      border-radius: 5px;
      padding: 10px;
      max-width: 30%;

      p {
        margin: 0;
        font-size: 20px;
      }
    }

    &__modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1000;
    }

  }
</style>
